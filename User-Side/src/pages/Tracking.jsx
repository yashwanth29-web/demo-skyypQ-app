import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, Clock, MapPin, ArrowLeft, Utensils, ShoppingBag, QrCode, X, Calendar, Edit3, Lock, Hand } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import useOrderStore from '../store/useOrderStore'
import api from '../lib/api'
import { joinOrderRoom, leaveOrderRoom, onOrderUpdate, offOrderUpdate } from '../lib/socket'

const TIMELINE_STEPS = [
  { id: 'confirmed', title: 'Booking Confirmed', subtitle: 'Received by restaurant' },
  { id: 'preparing', title: 'Preparing Your Meal', subtitle: 'Freshly cooked for arrival' },
  { id: 'ready', title: 'Food Ready', subtitle: 'Piping hot & packaged' },
  { id: 'arrive', title: 'Arrive', subtitle: 'At your scheduled time' },
  { id: 'enjoy', title: 'Enjoy Your Meal', subtitle: 'Zero waiting time' }
]

const generateAvailableFutureSlots = (baseSlotStr = '6:45 PM') => {
  const slots = []
  const match = baseSlotStr ? baseSlotStr.match(/(\d+):(\d+)\s*(AM|PM)/i) : null
  let baseDate = new Date()

  if (match) {
    let h = parseInt(match[1], 10)
    let m = parseInt(match[2], 10)
    const ampm = match[3].toUpperCase()
    if (ampm === 'PM' && h < 12) h += 12
    if (ampm === 'AM' && h === 12) h = 0
    baseDate.setHours(h, m, 0, 0)
  }

  // Generate 8 consecutive 15-minute slots strictly AFTER base slot
  for (let i = 1; i <= 8; i++) {
    const slotTime = new Date(baseDate.getTime() + i * 15 * 60000)
    let hours = slotTime.getHours()
    const minutes = slotTime.getMinutes()
    const ampm = hours >= 12 ? 'PM' : 'AM'
    hours = hours % 12 || 12
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes
    slots.push(`${hours}:${formattedMinutes} ${ampm}`)
  }

  return slots
}

function getTimelineTimes(slotStr = '6:30 PM') {
  const match = slotStr ? slotStr.match(/(\d+):(\d+)\s*(AM|PM)/i) : null
  if (!match) {
    return { arrival: '6:30 PM', ready: '6:25 PM' }
  }
  let h = parseInt(match[1], 10)
  const m = parseInt(match[2], 10)
  const ampm = match[3].toUpperCase()
  if (ampm === 'PM' && h < 12) h += 12
  if (ampm === 'AM' && h === 12) h = 0

  const arrivalDate = new Date()
  arrivalDate.setHours(h, m, 0, 0)
  const readyDate = new Date(arrivalDate.getTime() - 3 * 60000)

  const formatTime = (d) => {
    let dh = d.getHours()
    const dm = d.getMinutes()
    const dampm = dh >= 12 ? 'PM' : 'AM'
    dh = dh % 12 || 12
    const mm = dm < 10 ? `0${dm}` : dm
    return `${dh}:${mm} ${dampm}`
  }

  return {
    arrival: formatTime(arrivalDate),
    ready: formatTime(readyDate)
  }
}

export default function TrackingPage() {
  const navigate = useNavigate()
  const { orders, fetchMyOrders, updateOrderFromSocket, updateOrderSlot } = useOrderStore()

  const [activeOrder, setActiveOrder] = useState(null)
  const [selectedSlot, setSelectedSlot] = useState('6:45 PM')
  const [showTimeModal, setShowTimeModal] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)

  // On mount: load order from sessionStorage first, then fetch from backend
  useEffect(() => {
    const loadOrder = async () => {
      // Try sessionStorage for immediate display
      const cached = sessionStorage.getItem('skyyq_active_order')
      if (cached) {
        const parsed = JSON.parse(cached)
        setActiveOrder(parsed)
        setSelectedSlot(parsed.slot || '6:45 PM')
      }
      // Fetch fresh from backend
      await fetchMyOrders()
    }
    loadOrder()
  }, [])

  // Keep activeOrder in sync with store (updated via Socket.io)
  useEffect(() => {
    const fromStore = orders.find(
      (o) => o.status !== 'completed' && o.isCustomerOrder
    ) || orders[0]
    if (fromStore) {
      setActiveOrder(fromStore)
      setSelectedSlot((prev) => fromStore.slot || prev)
    }
  }, [orders])

  // Join Socket.io room for this specific order
  useEffect(() => {
    if (!activeOrder?._id) return
    const token = localStorage.getItem('skyyq_customer_token')

    joinOrderRoom(activeOrder._id, token)

    const handleUpdate = (updated) => {
      updateOrderFromSocket(updated)
      setActiveOrder(updated)
      sessionStorage.setItem('skyyq_active_order', JSON.stringify(updated))
    }

    onOrderUpdate(handleUpdate)

    return () => {
      offOrderUpdate(handleUpdate)
      leaveOrderRoom(activeOrder._id)
    }
  }, [activeOrder?._id])

  const handleSlotChange = (newSlot) => {
    setSelectedSlot(newSlot)
    if (activeOrder?._id) {
      updateOrderSlot(activeOrder._id, newSlot)
    }
    setShowTimeModal(false)
  }

  const isDineIn = activeOrder?.type === 'dine-in'
  const currentStatus = activeOrder?.status || 'pending'
  const timeline = getTimelineTimes(selectedSlot)
  const restaurantName = activeOrder?.restaurantName || 'Chutneys - Financial District'

  // Map status to active timeline index (0 to 4)
  const getStepIndex = () => {
    if (currentStatus === 'preparing') return 1
    if (currentStatus === 'ready') return 2
    if (currentStatus === 'completed') return 4
    return 0 // pending / confirmed -> step 0
  }

  const activeStepIdx = getStepIndex()

  const handleCancelOrder = () => {
    setShowCancelConfirm(false)
    navigate('/')
  }

  const handleMarkArrived = async () => {
    if (!activeOrder?._id) return
    try {
      const { data } = await api.patch(`/orders/${activeOrder._id}/arrived`)
      setActiveOrder(data)
      sessionStorage.setItem('skyyq_active_order', JSON.stringify(data))
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Header */}
      <header className="p-4 flex items-center justify-between bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <button
          onClick={() => navigate('/')}
          className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-700 cursor-pointer flex items-center gap-1 font-bold text-xs"
        >
          <ArrowLeft size={18} /> Home
        </button>
        <h1 className="text-sm font-black text-slate-900 tracking-tight">Track Your Order</h1>
        <button
          onClick={() => navigate('/pickup')}
          className="text-xs font-black text-orange-600 bg-orange-50 border border-orange-200 px-3 py-1.5 rounded-xl hover:bg-orange-100 transition-colors cursor-pointer"
        >
          Pass & QR
        </button>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-xl w-full mx-auto p-4 sm:p-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 text-center relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Top Status Badge */}
          <div className="flex items-center justify-center gap-2 relative z-10">
            {currentStatus === 'preparing' ? (
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full animate-pulse">
                🔥 CHEF PREPARING YOUR MEAL
              </span>
            ) : currentStatus === 'ready' ? (
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                ✨ FOOD READY FOR PICKUP
              </span>
            ) : (
              <span className="text-[10px] font-black uppercase tracking-widest text-orange-600 bg-orange-50 border border-orange-200 px-3 py-1 rounded-full">
                ⏳ WAITING FOR RESTAURANT TO START
              </span>
            )}
          </div>

          {/* Large Success Status Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.15, 1] }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="w-20 h-20 bg-orange-500 text-white rounded-3xl flex items-center justify-center mx-auto shadow-xl shadow-orange-500/30 relative z-10"
          >
            <CheckCircle2 size={44} strokeWidth={2.5} />
          </motion.div>

          {/* Title & Subtitle */}
          <div className="space-y-1.5 relative z-10">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              {currentStatus === 'preparing' ? 'Preparing Your Meal' : currentStatus === 'ready' ? 'Food is Ready!' : "You're all set."}
            </h2>
            <p className="text-sm sm:text-base font-extrabold text-orange-600">
              {currentStatus === 'preparing'
                ? 'Chef is cooking your dish fresh for your arrival.'
                : currentStatus === 'ready'
                  ? 'Your order is hot and packaged at the counter.'
                  : "We're preparing your food according to your arrival."}
            </p>
            <p className="text-xs font-semibold text-slate-500 flex items-center justify-center gap-1 pt-1">
              <MapPin size={13} className="text-orange-500" />
              <span>{restaurantName}</span>
            </p>
          </div>

          {/* Friendly Reassurance Banner */}
          <div className="bg-orange-50/80 border border-orange-200/80 p-4 rounded-2xl text-left flex items-center justify-between gap-3 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-orange-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                {isDineIn ? <Utensils size={18} /> : <ShoppingBag size={18} />}
              </div>
              <div>
                <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm">
                  {isDineIn ? 'Your table will be ready when you arrive.' : 'Your takeaway will be ready at the counter.'}
                </h4>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                  Zero waiting time guarantee. Freshly prepared just in time.
                </p>
              </div>
            </div>
          </div>

          {/* INTERACTIVE ACTION BAR: CHANGE TIME | CANCEL | LOCKED */}
          {currentStatus === 'preparing' || currentStatus === 'ready' ? (
            <div className="bg-amber-50 border border-amber-200 p-3 rounded-2xl flex items-center justify-between text-xs font-black text-amber-900 relative z-10">
              <div className="flex items-center gap-2">
                <Lock size={15} className="text-amber-600 shrink-0" />
                <span>Kitchen is preparing your order • Arrival time locked</span>
              </div>
              <span className="text-[9px] uppercase font-black bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded-md">
                Locked
              </span>
            </div>
          ) : (currentStatus === 'pending' || currentStatus === 'confirmed') ? (
            <div className="bg-slate-100 p-2 rounded-2xl border border-slate-200/80 grid grid-cols-2 gap-2 relative z-10">
              <button
                onClick={() => setShowTimeModal(true)}
                className="py-2 px-3 bg-white text-slate-800 hover:text-orange-600 rounded-xl text-xs font-black border border-slate-200 shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <Edit3 size={13} className="text-orange-500" /> Change Time
              </button>
              <button
                onClick={() => setShowCancelConfirm(true)}
                className="py-2 px-3 bg-white text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-black border border-rose-200 shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <X size={13} /> Cancel Order
              </button>
            </div>
          ) : null}

          {/* I'm Here Button */}
          {currentStatus !== 'completed' && activeOrder?._id && (
            <div className="relative z-10 pt-2">
              <button
                onClick={handleMarkArrived}
                disabled={activeOrder?.customerArrived}
                className={`w-full py-4 rounded-2xl font-black text-sm shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  activeOrder?.customerArrived
                    ? 'bg-emerald-100 text-emerald-700 border border-emerald-300 cursor-not-allowed'
                    : 'bg-orange-500 hover:bg-orange-600 text-white shadow-orange-500/20 active:scale-98'
                }`}
              >
                {activeOrder?.customerArrived ? (
                  <>
                    <CheckCircle2 size={18} /> You have arrived
                  </>
                ) : (
                  <>
                    <Hand size={18} /> I'm Here!
                  </>
                )}
              </button>
            </div>
          )}

          {/* SIGNATURE SKYPPQ SMART ETA SUMMARY TIMELINE CARD */}
          <div className="bg-slate-900 text-white p-4.5 rounded-3xl shadow-xl space-y-3 relative overflow-hidden border border-slate-800 text-left relative z-10">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-orange-500 text-white flex items-center justify-center font-bold text-xs">
                  <Clock size={15} />
                </div>
                <div>
                  <h4 className="font-black text-xs text-white tracking-tight">SkYppQ Smart Arrival Sync</h4>
                  <p className="text-[9px] text-orange-400 font-extrabold uppercase">Live Timeline</p>
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold bg-slate-800 text-slate-300 px-2.5 py-1 rounded-full border border-slate-700">
                🚗 20 min drive
              </span>
            </div>

            {/* TIMELINE STEPS */}
            <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800/80 space-y-2.5 text-xs font-extrabold">
              <div className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-2"><span>🕒</span> Now</span>
                <span className="font-mono text-white">7:00 PM</span>
              </div>

              <div className="flex items-center justify-between text-slate-400 text-[11px] pl-3 border-l-2 border-orange-500/50 my-1">
                <span>🚗 Drive (20 min)</span>
                <span className="font-mono text-orange-400">En Route</span>
              </div>

              <div className="flex items-center justify-between text-amber-300 bg-amber-500/10 p-2 rounded-xl border border-amber-500/30 font-black">
                <span className="flex items-center gap-1.5"><span>👨‍🍳</span> Kitchen Starts Cooking</span>
                <span className="font-mono font-black">7:08 PM</span>
              </div>

              <div className="flex items-center justify-between text-emerald-400 text-[11px] pl-3 border-l-2 border-emerald-500/50 my-1">
                <span>🍽️ Food Ready</span>
                <span className="font-mono text-emerald-400">{timeline.arrival}</span>
              </div>

              <div className="flex items-center justify-between text-emerald-400 bg-emerald-500/10 p-2 rounded-xl border border-emerald-500/30 font-black">
                <span className="flex items-center gap-1.5"><span>📍</span> You Arrive</span>
                <span className="font-mono font-black">{timeline.arrival}</span>
              </div>
            </div>

            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-2 text-[11px] font-black text-emerald-400">
              <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
              <span>"Your food will be ready the exact minute you arrive."</span>
            </div>
          </div>

          {/* 5-STEP SIMPLE PROGRESS TIMELINE */}
          <div className="bg-slate-50/80 border border-slate-200/80 p-4 sm:p-5 rounded-2xl text-left space-y-4 relative z-10">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <span className="text-[11px] font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Clock size={13} className="text-orange-500" /> Progress Timeline
              </span>
              <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200">
                {currentStatus === 'preparing' ? 'Kitchen Cooking' : currentStatus === 'ready' ? 'Ready at Counter' : 'Booking Confirmed'}
              </span>
            </div>

            <div className="space-y-3.5">
              {TIMELINE_STEPS.map((step, idx) => {
                let isCompleted = idx < activeStepIdx
                let isCurrent = idx === activeStepIdx

                // If customer marked arrived, force the Arrive step (idx 3) to be completed
                if (idx === 3 && activeOrder?.customerArrived) {
                  isCompleted = true
                  isCurrent = false
                }
                
                // If both arrived and ready, make step 4 (Enjoy) the current active step
                if (idx === 4 && activeOrder?.customerArrived && currentStatus === 'ready') {
                  isCurrent = true
                }

                return (
                  <div key={step.id} className="flex items-start gap-3 relative">
                    {idx < TIMELINE_STEPS.length - 1 && (
                      <div className={`absolute top-5 left-3.5 bottom-0 w-0.5 ${isCompleted || (idx === 2 && activeOrder?.customerArrived) ? 'bg-orange-500' : 'bg-slate-200'}`} />
                    )}

                    <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10 text-xs font-bold ${
                      isCompleted
                        ? 'bg-orange-500 text-white shadow-xs'
                        : isCurrent
                          ? 'bg-orange-500 text-white ring-4 ring-orange-100 shadow-md animate-pulse'
                          : 'bg-slate-200 text-slate-400'
                    }`}>
                      {isCompleted ? '✓' : idx + 1}
                    </div>

                    <div className="pt-0.5">
                      <p className={`font-black text-xs ${isCurrent ? 'text-orange-600' : 'text-slate-900'}`}>
                        {step.title}
                      </p>
                      <p className="text-[10px] font-medium text-slate-400">
                        {step.subtitle}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={() => navigate('/pickup')}
            className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer relative z-10"
          >
            <QrCode size={18} /> View Pickup Pass & QR
          </button>
        </motion.div>
      </main>

      {/* CHANGE TIME MODAL */}
      <AnimatePresence>
        {showTimeModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 text-center shadow-2xl border border-slate-200"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-black text-slate-900 text-base flex items-center gap-1.5">
                  <Calendar size={18} className="text-orange-500" /> Select New Arrival Time
                </h3>
                <button onClick={() => setShowTimeModal(false)} className="p-1 text-slate-400 hover:text-slate-700">
                  <X size={18} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                {generateAvailableFutureSlots(selectedSlot).map((slot) => (
                  <button
                    key={slot}
                    onClick={() => handleSlotChange(slot)}
                    className={`py-2 px-3 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                      selectedSlot === slot
                        ? 'bg-orange-500 text-white border-orange-500 shadow-md'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-orange-50'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CANCEL CONFIRMATION MODAL */}
      <AnimatePresence>
        {showCancelConfirm && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 text-center shadow-2xl border border-slate-200"
            >
              <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
                <X size={24} />
              </div>
              <h3 className="font-black text-slate-900 text-lg">Cancel Your Order?</h3>
              <p className="text-xs text-slate-500 font-medium">
                You can cancel your booking for free before the restaurant starts cooking.
              </p>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowCancelConfirm(false)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-xl cursor-pointer"
                >
                  Keep Order
                </button>
                <button
                  onClick={handleCancelOrder}
                  className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl cursor-pointer shadow-md"
                >
                  Confirm Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
