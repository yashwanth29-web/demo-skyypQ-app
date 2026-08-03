import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Utensils, Clock, Flame, Sparkles, CheckCircle2, ShoppingBag, Plus, ArrowLeft, Zap
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import useOrderStore from '../../store/useOrderStore'

export default function OwnerDashboard() {
  const navigate = useNavigate()
  const { orders, updateOrderStatus, addOrder } = useOrderStore()
  const [activeTab, setActiveTab] = useState('upcoming') // 'upcoming' | 'preparing' | 'ready' | 'completed'

  // Filter Active vs Completed orders
  const activeOrders = orders.filter((o) => o.status !== 'completed')
  const preparingOrders = orders.filter((o) => o.status === 'preparing')
  const readyOrders = orders.filter((o) => o.status === 'ready')
  const completedOrders = orders.filter((o) => o.status === 'completed')

  // Helper to parse slot time string (e.g., "11:59 PM") to minutes for sorting
  const getSlotMinutes = (slotStr = '11:59 PM') => {
    const match = slotStr ? slotStr.match(/(\d+):(\d+)\s*(AM|PM)/i) : null
    if (!match) return 1000
    let h = parseInt(match[1], 10)
    const m = parseInt(match[2], 10)
    const ampm = match[3].toUpperCase()
    if (ampm === 'PM' && h < 12) h += 12
    if (ampm === 'AM' && h === 12) h = 0
    return h * 60 + m
  }

  // Calculate Suggested Start Time (15 mins before arrival slot)
  const calculateSuggestedStart = (slotStr = '11:59 PM') => {
    const match = slotStr ? slotStr.match(/(\d+):(\d+)\s*(AM|PM)/i) : null
    if (!match) return '11:44 PM'
    let h = parseInt(match[1], 10)
    let m = parseInt(match[2], 10)
    const ampm = match[3].toUpperCase()
    if (ampm === 'PM' && h < 12) h += 12
    if (ampm === 'AM' && h === 12) h = 0

    const arrivalDate = new Date()
    arrivalDate.setHours(h, m, 0, 0)
    const startDate = new Date(arrivalDate.getTime() - 15 * 60000)

    let sh = startDate.getHours()
    const sm = startDate.getMinutes()
    const sampm = sh >= 12 ? 'PM' : 'AM'
    sh = sh % 12 || 12
    const smm = sm < 10 ? `0${sm}` : sm
    return `${sh}:${smm} ${sampm}`
  }

  // Calculate live urgency badge for kitchen start time
  const getUrgencyBadge = (suggestedStartStr) => {
    if (!suggestedStartStr) return { text: '⚡ Start Now', style: 'bg-orange-500 text-white animate-pulse' }

    const match = suggestedStartStr.match(/(\d+):(\d+)\s*(AM|PM)/i)
    if (!match) return { text: '⚡ Start Now', style: 'bg-orange-500 text-white' }

    let h = parseInt(match[1], 10)
    const m = parseInt(match[2], 10)
    const ampm = match[3].toUpperCase()
    if (ampm === 'PM' && h < 12) h += 12
    if (ampm === 'AM' && h === 12) h = 0

    const now = new Date()
    const startObj = new Date()
    startObj.setHours(h, m, 0, 0)

    const diffMins = Math.round((startObj.getTime() - now.getTime()) / 60000)

    if (diffMins > 1) {
      return { text: `🔥 Starts in ${diffMins} mins`, style: 'bg-amber-100 text-amber-900 border border-amber-300 font-extrabold' }
    } else if (diffMins >= -5) {
      return { text: '⚡ Start Now', style: 'bg-orange-500 text-white font-black animate-pulse shadow-md' }
    } else {
      return { text: '⚠️ Running Late', style: 'bg-rose-600 text-white font-black animate-bounce shadow-md' }
    }
  }

  // Filter orders according to selected tab and sort by Customer Arrival Time (nearest first)
  const displayedOrders = (() => {
    let list = []
    if (activeTab === 'upcoming') {
      list = [...activeOrders]
    } else if (activeTab === 'preparing') {
      list = [...preparingOrders]
    } else if (activeTab === 'ready') {
      list = [...readyOrders]
    } else if (activeTab === 'completed') {
      list = [...completedOrders]
    }

    return list.sort((a, b) => getSlotMinutes(a.slot) - getSlotMinutes(b.slot))
  })()

  // Demo action: Simulate incoming arrival for investor demo
  const handleSimulateArrival = () => {
    const demoNames = ['Rahul Sharma', 'Vikram Malhotra', 'Ananya Roy', 'Priya Patel', 'Karan Verma']
    const randomName = demoNames[Math.floor(Math.random() * demoNames.length)]
    const randomType = Math.random() > 0.5 ? 'takeaway' : 'dine-in'
    const randomSlot = ['11:59 PM', '12:15 AM', '12:30 AM'][Math.floor(Math.random() * 3)]

    const sampleInstructions = [
      ['Extra Chutney', 'No Onions'],
      ['Less Spicy'],
      ['Pack Filter Coffee separately']
    ]
    const randomInstructions = Math.random() > 0.4 ? sampleInstructions[Math.floor(Math.random() * sampleInstructions.length)] : null

    const newDemoOrder = {
      customerName: randomName,
      restaurantId: 'r1',
      restaurantName: 'Chutneys',
      items: [
        { name: 'Mutton Dum Biryani', quantity: 1, price: 340 }
      ],
      total: 370,
      type: randomType,
      slot: randomSlot,
      prepTime: '15 min',
      specialInstructions: randomInstructions,
      status: 'pending',
      createdAt: new Date().toISOString(),
      isCustomerOrder: false
    }

    addOrder(newDemoOrder)
  }

  const handleUpdateStatus = (orderId, newStatus) => {
    updateOrderStatus(orderId, newStatus)
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pt-16 pb-28">
      {/* Top Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-500 text-white rounded-2xl flex items-center justify-center font-bold shadow-md shadow-orange-500/20">
            <Utensils size={20} />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              SkYppQ Kitchen Manager
              <span className="text-[9px] font-black text-orange-600 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full uppercase">
                Owner Mode
              </span>
            </h1>
            <p className="text-[11px] text-slate-500 font-medium">Synchronizing Kitchen Prep with Customer Arrival</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSimulateArrival}
            className="hidden sm:flex items-center gap-1.5 bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 px-3 py-1.5 rounded-xl text-xs font-black transition-colors cursor-pointer"
          >
            <Plus size={14} /> Simulate Arrival
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1 bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded-xl text-xs font-extrabold transition-colors cursor-pointer"
          >
            <ArrowLeft size={14} /> Customer App
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* ======================================================== */}
        {/* SCREEN 1: TOP SUMMARY COUNTERS                            */}
        {/* ======================================================== */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`p-4 rounded-3xl border text-left transition-all cursor-pointer ${
              activeTab === 'upcoming'
                ? 'bg-orange-500 text-white border-orange-500 shadow-lg shadow-orange-500/20 ring-2 ring-orange-500/20'
                : 'bg-white text-slate-900 border-slate-200/90 hover:border-orange-300'
            }`}
          >
            <span className={`text-[10px] font-black uppercase tracking-wider block ${activeTab === 'upcoming' ? 'text-orange-100' : 'text-slate-400'}`}>
              Active Orders
            </span>
            <span className="text-2xl sm:text-3xl font-black font-mono block mt-1">
              {activeOrders.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('preparing')}
            className={`p-4 rounded-3xl border text-left transition-all cursor-pointer ${
              activeTab === 'preparing'
                ? 'bg-amber-500 text-white border-amber-500 shadow-lg shadow-amber-500/20 ring-2 ring-amber-500/20'
                : 'bg-white text-slate-900 border-slate-200/90 hover:border-amber-300'
            }`}
          >
            <span className={`text-[10px] font-black uppercase tracking-wider block ${activeTab === 'preparing' ? 'text-amber-100' : 'text-slate-400'}`}>
              Preparing
            </span>
            <span className="text-2xl sm:text-3xl font-black font-mono block mt-1">
              {preparingOrders.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('ready')}
            className={`p-4 rounded-3xl border text-left transition-all cursor-pointer ${
              activeTab === 'ready'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-600/20 ring-2 ring-emerald-600/20'
                : 'bg-white text-slate-900 border-slate-200/90 hover:border-emerald-300'
            }`}
          >
            <span className={`text-[10px] font-black uppercase tracking-wider block ${activeTab === 'ready' ? 'text-emerald-100' : 'text-slate-400'}`}>
              Ready
            </span>
            <span className="text-2xl sm:text-3xl font-black font-mono block mt-1">
              {readyOrders.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('completed')}
            className={`p-4 rounded-3xl border text-left transition-all cursor-pointer ${
              activeTab === 'completed'
                ? 'bg-slate-900 text-white border-slate-900 shadow-lg ring-2 ring-slate-900/20'
                : 'bg-white text-slate-900 border-slate-200/90 hover:border-slate-400'
            }`}
          >
            <span className={`text-[10px] font-black uppercase tracking-wider block ${activeTab === 'completed' ? 'text-slate-400' : 'text-slate-400'}`}>
              Completed
            </span>
            <span className="text-2xl sm:text-3xl font-black font-mono block mt-1">
              {completedOrders.length}
            </span>
          </button>
        </div>

        {/* FEED HEADER & TAB SELECTOR */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight">
              {activeTab === 'upcoming'
                ? 'Upcoming Customer Arrivals'
                : activeTab === 'preparing'
                  ? 'Orders Currently Preparing'
                  : activeTab === 'ready'
                    ? 'Orders Ready for Customer'
                    : 'Completed Orders History'}
            </h2>
            <p className="text-xs text-slate-500 font-semibold">Sorted by nearest arrival time first</p>
          </div>

          <button
            onClick={handleSimulateArrival}
            className="sm:hidden flex items-center gap-1 bg-orange-50 text-orange-700 border border-orange-200 px-2.5 py-1 rounded-xl text-xs font-black"
          >
            <Plus size={13} /> Add Demo Arrival
          </button>
        </div>

        {/* ======================================================== */}
        {/* UPCOMING ARRIVALS REFINED ORDER CARDS FEED              */}
        {/* ======================================================== */}
        {displayedOrders.length === 0 ? (
          <div className="p-12 bg-white rounded-3xl border border-slate-200 text-center space-y-3 shadow-xs">
            <div className="w-12 h-12 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center mx-auto">
              <CheckCircle2 size={24} />
            </div>
            <h3 className="font-black text-slate-900 text-base">No orders in this state</h3>
            <p className="text-xs text-slate-500 font-medium">Click "Simulate Arrival" above to trigger a demo order.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <AnimatePresence>
              {displayedOrders.map((order) => {
                const suggestedStart = calculateSuggestedStart(order.slot)
                const isDineIn = order.type === 'dine-in'
                const firstName = (order.customerName || 'Rahul').split(' ')[0]
                const urgencyBadge = getUrgencyBadge(suggestedStart)

                // Parse special instructions
                const instructionsList = Array.isArray(order.specialInstructions)
                  ? order.specialInstructions
                  : typeof order.specialInstructions === 'string'
                    ? [order.specialInstructions]
                    : order.instructions
                      ? Array.isArray(order.instructions) ? order.instructions : [order.instructions]
                      : []
                
                const hasSpecialInstructions = instructionsList.length > 0

                return (
                  <motion.div
                    key={order.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-md space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-4">
                      {/* HEADER: 👤 FIRST NAME & 🥡 ORDER TYPE & LIVE URGENCY BADGE */}
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-1.5">
                            <span>👤</span> {firstName}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* LIVE URGENCY BADGE */}
                          {order.status === 'pending' || order.status === 'waiting' || !order.status ? (
                            <span className={`px-2.5 py-1 rounded-full text-[11px] font-black uppercase ${urgencyBadge.style}`}>
                              {urgencyBadge.text}
                            </span>
                          ) : null}

                          <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                            isDineIn 
                              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' 
                              : 'bg-orange-50 text-orange-700 border border-orange-200'
                          }`}>
                            {isDineIn ? '🍽️ Dine-In' : '🥡 Takeaway'}
                          </span>
                        </div>
                      </div>

                      {/* SMART KITCHEN SCHEDULE (REORDERED IN EXACT SPEC ORDER OF IMPORTANCE) */}
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/90 text-left space-y-2.5 font-sans">
                        <div className="flex items-center justify-between border-b border-slate-200/80 pb-1.5 text-[11px]">
                          <span className="font-black uppercase tracking-wider text-slate-500 flex items-center gap-1">
                            <Zap size={14} className="text-orange-500" /> Smart Kitchen Schedule
                          </span>
                        </div>

                        {/* 5-GRID SCHEDULE IN EXACT SPEC ORDER: */}
                        {/* 1. Customer Arrival */}
                        {/* 2. Kitchen Start Cooking (PRIMARY VISUAL ELEMENT) */}
                        {/* 3. Food Ready */}
                        {/* 4. Drive Time */}
                        {/* 5. Prep Time */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-0.5 text-xs">
                          {/* 1. Arrival */}
                          <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                            <span className="text-[9px] font-black uppercase text-slate-400 block">📍 Arrival</span>
                            <span className="text-sm font-mono font-black text-slate-900 block mt-0.5">{order.slot || '11:59 PM'}</span>
                          </div>

                          {/* 2. Start Cooking (PRIMARY VISUAL FOCUS) */}
                          <div className="bg-amber-100 border-2 border-amber-400 p-2.5 rounded-xl text-left shadow-xs">
                            <span className="text-[9px] font-black uppercase text-amber-950 block">👨‍🍳 Start Cooking</span>
                            <span className="text-sm font-mono font-black text-amber-950 block mt-0.5">{suggestedStart}</span>
                          </div>

                          {/* 3. Food Ready */}
                          <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                            <span className="text-[9px] font-black uppercase text-slate-400 block">🍽️ Food Ready</span>
                            <span className="text-sm font-mono font-black text-emerald-600 block mt-0.5">{order.slot || '11:59 PM'}</span>
                          </div>

                          {/* 4. Drive Time */}
                          <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                            <span className="text-[9px] font-black uppercase text-slate-400 block">🚗 Drive</span>
                            <span className="text-xs font-mono font-black text-orange-600 block mt-0.5">20 min</span>
                          </div>

                          {/* 5. Prep Time */}
                          <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs col-span-2 sm:col-span-2">
                            <span className="text-[9px] font-black uppercase text-slate-400 block">⏱️ Prep Time</span>
                            <span className="text-xs font-mono font-black text-slate-700 block mt-0.5">{order.prepTime || '15 min'}</span>
                          </div>
                        </div>
                      </div>

                      {/* 📝 ORDER ITEMS */}
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-black uppercase text-slate-400 block">Items</span>
                        <ul className="space-y-1.5 text-xs font-black text-slate-900 bg-slate-50/60 p-3 rounded-2xl border border-slate-100">
                          {order.items?.map((item, idx) => (
                            <li key={idx} className="flex items-center gap-2">
                              <span className="text-orange-600 font-black">{item.quantity} ×</span>
                              <span className="font-extrabold text-slate-900">{item.name}</span>
                            </li>
                          )) || (
                            <li className="flex items-center gap-2">
                              <span className="text-orange-600 font-black">1 ×</span>
                              <span className="font-extrabold text-slate-900">Mutton Dum Biryani</span>
                            </li>
                          )}
                        </ul>
                      </div>

                      {/* 📌 SPECIAL INSTRUCTIONS (Only rendered if present!) */}
                      {hasSpecialInstructions && (
                        <div className="bg-orange-50/80 border border-orange-200 p-3 rounded-2xl text-left space-y-1">
                          <span className="text-[10px] font-black uppercase tracking-wider text-orange-800 block">
                            Special Instructions
                          </span>
                          <ul className="text-xs font-bold text-slate-800 space-y-0.5 pl-1">
                            {instructionsList.map((inst, idx) => (
                              <li key={idx} className="flex items-center gap-1.5 text-slate-900">
                                <span className="text-orange-600 font-black">•</span> {inst}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* 🎯 SINGLE LARGE PRIMARY ACTION BUTTON */}
                    <div className="pt-2">
                      {order.status === 'pending' || order.status === 'waiting' || !order.status ? (
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'preparing')}
                          className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white font-black text-sm rounded-2xl shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
                        >
                          <Flame size={18} />
                          <span>Start Preparing</span>
                        </button>
                      ) : order.status === 'preparing' ? (
                        <div className="space-y-2">
                          <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-center text-xs font-extrabold text-amber-800 flex items-center justify-center gap-1.5">
                            <Clock size={14} className="animate-spin text-amber-600" />
                            <span>Preparing • Started at {suggestedStart}</span>
                          </div>
                          <button
                            onClick={() => handleUpdateStatus(order.id, 'ready')}
                            className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-2xl shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
                          >
                            <Sparkles size={18} />
                            <span>Mark Ready</span>
                          </button>
                        </div>
                      ) : order.status === 'ready' ? (
                        <div className="space-y-2">
                          <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-center text-xs font-extrabold text-emerald-800 flex items-center justify-center gap-1.5">
                            <CheckCircle2 size={14} className="text-emerald-600" />
                            <span>Food Ready • Waiting for Customer</span>
                          </div>
                          <button
                            onClick={() => handleUpdateStatus(order.id, 'completed')}
                            className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-black text-sm rounded-2xl shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
                          >
                            <ShoppingBag size={18} />
                            <span>{isDineIn ? 'Customer Seated' : 'Complete Pickup'}</span>
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
