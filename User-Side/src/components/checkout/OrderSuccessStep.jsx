import React from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, Clock, MapPin, Sparkles, QrCode, Utensils, ShoppingBag } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import useCartStore from '../../store/useCartStore'

// Customer friendly timeline step definition
const TIMELINE_STEPS = [
  { id: 'confirmed', title: 'Order Confirmed', subtitle: 'Received by restaurant' },
  { id: 'preparing', title: 'Preparing Your Meal', subtitle: 'Freshly cooked for arrival' },
  { id: 'ready', title: 'Food Ready', subtitle: 'Piping hot & packaged' },
  { id: 'arrive', title: 'Arrive', subtitle: 'At your scheduled time' },
  { id: 'enjoy', title: 'Enjoy Your Meal', subtitle: 'Zero waiting time' }
]

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

export default function OrderSuccessStep({ restaurant = { name: 'Chutneys' } }) {
  const navigate = useNavigate()
  const { orderType, selectedSlot } = useCartStore()

  const isDineIn = orderType === 'dine-in'
  const activeSlotStr = selectedSlot || '6:30 PM'
  const timeline = getTimelineTimes(activeSlotStr)

  return (
    <motion.div
      initial={{ scale: 0.96, opacity: 0, y: 15 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      className="max-w-xl mx-auto space-y-6 text-center py-2"
    >
      {/* 🌟 PREMIUM APPLE / SWIGGY STYLE CUSTOMER CARD */}
      <div className="bg-white border border-slate-200/90 p-6 sm:p-8 rounded-3xl shadow-xl space-y-6 relative overflow-hidden text-slate-900">
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Large Success Status Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.15, 1] }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="w-20 h-20 bg-orange-500 text-white rounded-3xl flex items-center justify-center mx-auto shadow-xl shadow-orange-500/30 relative z-10"
        >
          <CheckCircle2 size={44} strokeWidth={2.5} />
        </motion.div>

        {/* Success Header */}
        <div className="space-y-2 relative z-10">
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            You're all set.
          </h2>
          <p className="text-sm sm:text-base font-extrabold text-orange-600">
            We're preparing your food according to your arrival.
          </p>
          <p className="text-xs font-semibold text-slate-500 flex items-center justify-center gap-1">
            <MapPin size={13} className="text-orange-500" />
            <span>{restaurant?.name || 'Chutneys - Financial District'}</span>
          </p>
        </div>

        {/* Customer Reassurance Message */}
        <div className="bg-orange-50/80 border border-orange-200/80 p-3.5 sm:p-4 rounded-2xl text-left flex items-center gap-3 relative z-10">
          <div className="w-9 h-9 rounded-xl bg-orange-500 text-white flex items-center justify-center shrink-0 shadow-sm">
            {isDineIn ? <Utensils size={18} /> : <ShoppingBag size={18} />}
          </div>
          <div>
            <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm">
              {isDineIn ? 'Your table will be ready when you arrive.' : 'Your takeaway will be ready at the counter.'}
            </h4>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
              Zero waiting time. Arrive smoothly and enjoy your meal.
            </p>
          </div>
        </div>

        {/* Time Cards Row */}
        <div className="grid grid-cols-2 gap-3 text-left relative z-10">
          <div className="bg-slate-50 border border-slate-200/80 p-3.5 rounded-2xl">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
              Arrival Time
            </span>
            <span className="text-base font-mono font-black text-slate-900 block mt-0.5">
              {timeline.arrival}
            </span>
          </div>

          <div className="bg-orange-50 border border-orange-200/80 p-3.5 rounded-2xl">
            <span className="text-[10px] font-black uppercase tracking-wider text-orange-600 block">
              {isDineIn ? 'Estimated Food Ready' : 'Estimated Pickup Time'}
            </span>
            <span className="text-base font-mono font-black text-orange-600 block mt-0.5">
              {timeline.ready}
            </span>
          </div>
        </div>

        {/* 🛣️ SIMPLE PROGRESS TIMELINE */}
        <div className="bg-slate-50/80 border border-slate-200/80 p-4 sm:p-5 rounded-2xl text-left space-y-4 relative z-10">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
            <span className="text-[11px] font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Clock size={13} className="text-orange-500" /> Progress Timeline
            </span>
            <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200">
              Fresh Preparation
            </span>
          </div>

          <div className="space-y-3.5">
            {TIMELINE_STEPS.map((step, idx) => {
              const isCurrent = idx === 1 // "Preparing Your Meal" is currently active
              const isCompleted = idx === 0

              return (
                <div key={step.id} className="flex items-start gap-3 relative">
                  {idx < TIMELINE_STEPS.length - 1 && (
                    <div className={`absolute top-5 left-3.5 bottom-0 w-0.5 ${idx < 1 ? 'bg-orange-500' : 'bg-slate-200'}`} />
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

        {/* Pickup QR / Pass Action Button */}
        <button
          onClick={() => navigate('/pickup')}
          className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer relative z-10"
        >
          <QrCode size={18} /> View Pickup Pass & QR
        </button>
      </div>
    </motion.div>
  )
}
