import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Utensils, Clock, Flame, Sparkles, CheckCircle2,
  ShoppingBag, Plus, LogOut, Zap, Phone, Bell, ScanLine, User
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import useOwnerStore from '../store/useOwnerStore'
import useKitchenStore from '../store/useKitchenStore'
import useRealtimeOrders from '../hooks/useRealtimeOrders'

// ─── Urgency Badge Calculator ─────────────────────────────────────────────────
function getUrgencyBadge(suggestedStartStr) {
  if (!suggestedStartStr) return { text: '⚡ Start Now', style: 'bg-orange-500 text-white animate-pulse' }
  const match = suggestedStartStr.match(/(\d+):(\d+)\s*(AM|PM)/i)
  if (!match) return { text: '⚡ Start Now', style: 'bg-orange-500 text-white' }
  let h = parseInt(match[1], 10)
  const m = parseInt(match[2], 10)
  const ampm = match[3].toUpperCase()
  if (ampm === 'PM' && h < 12) h += 12
  if (ampm === 'AM' && h === 12) h = 0
  const startObj = new Date()
  startObj.setHours(h, m, 0, 0)
  const diffMins = Math.round((startObj.getTime() - Date.now()) / 60000)
  if (diffMins > 1) return { text: `🔥 Starts in ${diffMins} mins`, style: 'bg-amber-100 text-amber-900 border border-amber-300 font-extrabold' }
  if (diffMins >= -5) return { text: '⚡ Start Now', style: 'bg-orange-500 text-white font-black animate-pulse shadow-md' }
  return { text: '⚠️ Running Late', style: 'bg-rose-600 text-white font-black animate-bounce shadow-md' }
}

// ─── Calculate suggested start time ──────────────────────────────────────────
function calcSuggestedStart(slotStr = '11:59 PM', prepMins = 15) {
  const match = slotStr?.match(/(\d+):(\d+)\s*(AM|PM)/i)
  if (!match) return slotStr
  let h = parseInt(match[1], 10); const m = parseInt(match[2], 10)
  const ampm = match[3].toUpperCase()
  if (ampm === 'PM' && h < 12) h += 12
  if (ampm === 'AM' && h === 12) h = 0
  const d = new Date(); d.setHours(h, m, 0, 0)
  const start = new Date(d.getTime() - prepMins * 60000)
  let sh = start.getHours(); const sm = start.getMinutes()
  const sa = sh >= 12 ? 'PM' : 'AM'; sh = sh % 12 || 12
  return `${sh}:${sm < 10 ? '0' + sm : sm} ${sa}`
}

// ─── Countdown Timer Component ────────────────────────────────────────────────
function KitchenTimer({ suggestedStartStr }) {
  const [diff, setDiff] = useState(null)
  useEffect(() => {
    const calc = () => {
      if (!suggestedStartStr) return
      const match = suggestedStartStr.match(/(\d+):(\d+)\s*(AM|PM)/i)
      if (!match) return
      let h = parseInt(match[1], 10); const m = parseInt(match[2], 10)
      const ampm = match[3].toUpperCase()
      if (ampm === 'PM' && h < 12) h += 12
      if (ampm === 'AM' && h === 12) h = 0
      const t = new Date(); t.setHours(h, m, 0, 0)
      setDiff(Math.round((t.getTime() - Date.now()) / 1000))
    }
    calc()
    const id = setInterval(calc, 1000)
    return () => clearInterval(id)
  }, [suggestedStartStr])
  if (diff === null || diff <= 0) return null
  const mins = Math.floor(diff / 60); const secs = diff % 60
  return (
    <span className="text-xs font-mono font-black text-amber-700">
      ⏱ {mins}:{secs < 10 ? '0' + secs : secs}
    </span>
  )
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function OwnerDashboard() {
  const navigate = useNavigate()
  const { owner } = useOwnerStore()
  const { orders, fetchOrders, fetchCompletedOrders, updateStatus, isLoading } = useKitchenStore()

  const [activeTab, setActiveTab] = useState('upcoming')
  const [tick, setTick] = useState(0) // forces urgency badge re-render every minute

  // Connect real-time Socket.io subscription
  useRealtimeOrders()

  // Initial data fetch
  useEffect(() => {
    if (owner?.restaurantId) {
      fetchOrders(owner.restaurantId, 'pending,preparing,ready')
      fetchCompletedOrders(owner.restaurantId)
    }
  }, [owner?.restaurantId])

  // Re-render urgency badges every 60 seconds
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 60000)
    return () => clearInterval(id)
  }, [])

  // Derived order lists
  const activeOrders = orders.filter((o) => o.status !== 'completed')
  const preparingOrders = orders.filter((o) => o.status === 'preparing')
  const readyOrders = orders.filter((o) => o.status === 'ready')
  const completedOrders = orders.filter((o) => o.status === 'completed')

  const getSlotMinutes = (slotStr = '11:59 PM') => {
    const m = slotStr?.match(/(\d+):(\d+)\s*(AM|PM)/i)
    if (!m) return 1440
    let h = parseInt(m[1], 10)
    const min = parseInt(m[2], 10)
    if (m[3].toUpperCase() === 'PM' && h < 12) h += 12
    if (m[3].toUpperCase() === 'AM' && h === 12) h = 0
    return h * 60 + min
  }

  const displayedOrders = (() => {
    const map = { upcoming: activeOrders, preparing: preparingOrders, ready: readyOrders, completed: completedOrders }
    return [...(map[activeTab] || [])].sort((a, b) => getSlotMinutes(a.slot) - getSlotMinutes(b.slot))
  })()

  const handleUpdateStatus = async (orderId, newStatus) => {
    const result = await updateStatus(orderId, newStatus)
    if (result.success) {
      const labels = { preparing: '🍳 Started preparing!', ready: '✅ Food is ready!', completed: '🎉 Order completed!' }
      toast.success(labels[newStatus] || 'Status updated', {
        style: { borderRadius: '16px', background: '#1e293b', color: '#fff', border: '1px solid #334155' }
      })
    } else {
      toast.error(result.error || 'Update failed')
    }
  }

  // Tab config
  const tabs = [
    { id: 'upcoming', label: 'Active', count: activeOrders.length, color: 'orange' },
    { id: 'preparing', label: 'Preparing', count: preparingOrders.length, color: 'amber' },
    { id: 'ready', label: 'Ready', count: readyOrders.length, color: 'emerald' },
    { id: 'completed', label: 'Done', count: completedOrders.length, color: 'slate' },
  ]
  const tabActiveStyles = {
    orange: 'bg-orange-500 text-white border-orange-500 shadow-lg shadow-orange-500/20',
    amber: 'bg-amber-500 text-white border-amber-500 shadow-lg shadow-amber-500/20',
    emerald: 'bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-600/20',
    slate: 'bg-slate-900 text-white border-slate-900 shadow-lg',
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pt-16 pb-28">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-3 sm:px-8 py-3 flex items-center justify-between shadow-sm gap-2">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-orange-500 text-white rounded-xl sm:rounded-2xl flex items-center justify-center font-bold shadow-md shadow-orange-500/20 shrink-0">
            <Utensils size={18} />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-sm sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-1.5 sm:gap-2">
              <span className="truncate">SkYppQ <span className="hidden sm:inline">Manager</span></span>
              <span className="text-[9px] font-black text-orange-600 bg-orange-50 border border-orange-200 px-1.5 py-0.5 rounded-full uppercase shrink-0 tracking-wider">Kitchen</span>
            </h1>
            <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium truncate leading-tight">
              {owner?.restaurantName || 'Loading...'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button onClick={() => navigate('/scanner')}
            className="flex items-center gap-1 sm:gap-1.5 bg-orange-500 hover:bg-orange-600 text-white px-2.5 sm:px-3 py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-black transition-colors cursor-pointer shadow-md shadow-orange-500/20 uppercase sm:normal-case tracking-wide">
            <ScanLine size={14} /> <span className="hidden sm:inline">Scan QR</span><span className="sm:hidden">Scan</span>
          </button>
          <button onClick={() => navigate('/profile')}
            className="flex items-center justify-center bg-slate-900 hover:bg-slate-800 text-white w-8 h-8 sm:w-auto sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl transition-colors cursor-pointer shrink-0">
            <User size={14} /> <span className="hidden sm:inline text-xs font-extrabold ml-1">Profile Hub</span>
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* Summary counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`p-4 rounded-3xl border text-left transition-all cursor-pointer ${
                activeTab === tab.id
                  ? tabActiveStyles[tab.color]
                  : 'bg-white text-slate-900 border-slate-200/90 hover:border-orange-300'
              }`}>
              <span className={`text-[10px] font-black uppercase tracking-wider block ${
                activeTab === tab.id ? 'text-white/70' : 'text-slate-400'
              }`}>{tab.label}</span>
              <span className="text-2xl sm:text-3xl font-black font-mono block mt-1">{tab.count}</span>
            </button>
          ))}
        </div>

        {/* Feed header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight">
              {activeTab === 'upcoming' ? 'Upcoming Customer Arrivals'
                : activeTab === 'preparing' ? 'Orders Currently Preparing'
                : activeTab === 'ready' ? 'Orders Ready for Pickup'
                : 'Completed Orders'}
            </h2>
            <p className="text-xs text-slate-500 font-semibold">Sorted by nearest arrival first</p>
          </div>
          {isLoading && (
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold">
              <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Syncing...
            </div>
          )}
        </div>

        {/* Order cards */}
        {displayedOrders.length === 0 ? (
          <div className="p-12 bg-white rounded-3xl border border-slate-200 text-center space-y-3 shadow-xs">
            <div className="w-12 h-12 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center mx-auto">
              <CheckCircle2 size={24} />
            </div>
            <h3 className="font-black text-slate-900 text-base">No orders in this state</h3>
            <p className="text-xs text-slate-500 font-medium">New orders will appear here in real-time.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <AnimatePresence>
              {displayedOrders.map((order) => {
                const prepMins = parseInt(order.prepTime) || 15
                const suggestedStart = order.suggestedStart || calcSuggestedStart(order.slot, prepMins)
                const urgencyBadge = getUrgencyBadge(suggestedStart)
                const isDineIn = order.type === 'dine-in'
                const firstName = (order.customerName || 'Customer').split(' ')[0]
                const instructionsList = Array.isArray(order.specialInstructions) ? order.specialInstructions : []

                return (
                  <motion.div key={order._id} layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-md space-y-4 flex flex-col justify-between">

                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex flex-col xl:flex-row xl:items-center justify-between border-b border-slate-100 pb-3 gap-3">
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                          <span className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-1.5">
                            <User size={20} className="text-slate-700" /> {firstName}
                          </span>
                          {order.customerPhone && (
                            <a href={`tel:${order.customerPhone}`}
                              className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-orange-500 transition-colors bg-slate-50 border border-slate-100 px-2 py-1 rounded-lg">
                              <Phone size={12} /> {order.customerPhone}
                            </a>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          {(order.status === 'pending' || order.status === 'waiting') && !order.customerArrived && (
                            <span className={`px-2.5 py-1 rounded-full text-[11px] font-black uppercase whitespace-nowrap shrink-0 ${urgencyBadge.style}`}>
                              {urgencyBadge.text}
                            </span>
                          )}
                          {order.customerArrived && (
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-black uppercase bg-emerald-500 text-white shadow-md animate-pulse whitespace-nowrap shrink-0">
                              🛎️ Arrived
                            </span>
                          )}
                          <span className={`px-3 py-1 rounded-full text-[11px] font-black uppercase whitespace-nowrap shrink-0 ${
                            isDineIn ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'bg-orange-50 text-orange-700 border border-orange-200'
                          }`}>
                            {isDineIn ? '🍽️ Dine-In' : '🥡 Takeaway'}
                          </span>
                        </div>
                      </div>

                      {/* Smart Kitchen Schedule */}
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/90 space-y-2.5">
                        <div className="flex items-center justify-between border-b border-slate-200/80 pb-1.5 text-[11px]">
                          <span className="font-black uppercase tracking-wider text-slate-500 flex items-center gap-1">
                            <Zap size={14} className="text-orange-500" /> Smart Kitchen Schedule
                          </span>
                          <KitchenTimer suggestedStartStr={suggestedStart} />
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-0.5 text-xs">
                          <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-xs">
                            <span className="text-[9px] font-black uppercase text-slate-400 block">📍 Arrival</span>
                            <span className="text-sm font-mono font-black text-slate-900 block mt-0.5">{order.slot || '—'}</span>
                          </div>
                          <div className="bg-amber-100 border-2 border-amber-400 p-2.5 rounded-xl">
                            <span className="text-[9px] font-black uppercase text-amber-950 block">👨‍🍳 Start Cooking</span>
                            <span className="text-sm font-mono font-black text-amber-950 block mt-0.5">{suggestedStart}</span>
                          </div>
                          <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-xs">
                            <span className="text-[9px] font-black uppercase text-slate-400 block">🍽️ Food Ready</span>
                            <span className="text-sm font-mono font-black text-emerald-600 block mt-0.5">{order.slot || '—'}</span>
                          </div>
                          <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-xs">
                            <span className="text-[9px] font-black uppercase text-slate-400 block">🚗 Drive</span>
                            <span className="text-xs font-mono font-black text-orange-600 block mt-0.5">{order.driveTimeMins ? `${order.driveTimeMins} min` : '—'}</span>
                          </div>
                          <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-xs col-span-2 sm:col-span-2">
                            <span className="text-[9px] font-black uppercase text-slate-400 block">⏱️ Prep Time</span>
                            <span className="text-xs font-mono font-black text-slate-700 block mt-0.5">{order.prepTime || '15 min'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-black uppercase text-slate-400 block">Items</span>
                        <ul className="space-y-1.5 text-xs font-black text-slate-900 bg-slate-50/60 p-3 rounded-2xl border border-slate-100">
                          {order.items?.map((item, idx) => (
                            <li key={idx} className="flex items-center gap-2">
                              <span className="text-orange-600 font-black">{item.quantity} ×</span>
                              <span className="font-extrabold text-slate-900">{item.name}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Special Instructions */}
                      {instructionsList.length > 0 && (
                        <div className="bg-orange-50/80 border border-orange-200 p-3 rounded-2xl space-y-1">
                          <span className="text-[10px] font-black uppercase tracking-wider text-orange-800 block">Special Instructions</span>
                          <ul className="text-xs font-bold text-slate-800 space-y-0.5 pl-1">
                            {instructionsList.map((inst, idx) => (
                              <li key={idx} className="flex items-center gap-1.5">
                                <span className="text-orange-600 font-black">•</span> {inst}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
                    <div className="pt-2">
                      {order.status === 'pending' || order.status === 'waiting' || !order.status ? (
                        <button onClick={() => handleUpdateStatus(order._id, 'preparing')}
                          className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white font-black text-sm rounded-2xl shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98">
                          <Flame size={18} /> Start Preparing
                        </button>
                      ) : order.status === 'preparing' ? (
                        <div className="space-y-2">
                          <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-center text-xs font-extrabold text-amber-800 flex items-center justify-center gap-1.5">
                            <Clock size={14} className="animate-spin text-amber-600" />
                            Preparing • Started at {suggestedStart}
                          </div>
                          <button onClick={() => handleUpdateStatus(order._id, 'ready')}
                            className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-2xl shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98">
                            <Sparkles size={18} /> Mark Ready
                          </button>
                        </div>
                      ) : order.status === 'ready' ? (
                        <div className="space-y-2">
                          <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-center text-xs font-extrabold text-emerald-800 flex items-center justify-center gap-1.5">
                            <CheckCircle2 size={14} className="text-emerald-600" /> Food Ready • Waiting for Customer
                          </div>
                          <button onClick={() => navigate('/scanner')}
                            className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-black text-sm rounded-2xl shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98">
                            <ScanLine size={18} /> {isDineIn ? 'Scan Pass to Seat' : 'Scan Pass to Complete'}
                          </button>
                        </div>
                      ) : (
                        <div className="p-3 bg-slate-100 rounded-2xl text-center text-xs font-extrabold text-slate-500 uppercase flex items-center justify-center gap-1.5">
                          <CheckCircle2 size={14} /> Order Completed
                        </div>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  )
}
