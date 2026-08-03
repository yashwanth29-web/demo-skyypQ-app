import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Navigation, Clock, Zap, Calendar, ArrowRight, ArrowLeft, Check, AlertCircle } from 'lucide-react'
import useCartStore from '../../store/useCartStore'

// Helper to generate 15-min interval slots for the next 2 hours
const generateTimeSlots = () => {
  const slots = []
  const now = new Date()
  
  // Start from next 15-min mark
  const startMinutes = Math.ceil((now.getMinutes() + 10) / 15) * 15
  const startTime = new Date(now)
  startTime.setMinutes(startMinutes, 0, 0)

  // Generate 8 slots (2 hours of 15-min intervals)
  for (let i = 0; i < 8; i++) {
    const slotTime = new Date(startTime.getTime() + i * 15 * 60000)
    const hours = slotTime.getHours()
    const minutes = slotTime.getMinutes()
    const ampm = hours >= 12 ? 'PM' : 'AM'
    const formattedHours = hours % 12 || 12
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes
    const timeString = `${formattedHours}:${formattedMinutes} ${ampm}`

    // Simulated availability statuses
    let status = 'available' // 🟢 Green
    let label = 'Available'
    let count = 12 - (i % 3) * 3

    if (i === 2 || i === 5) {
      status = 'limited' // 🟠 Orange
      label = 'Limited'
      count = 3
    } else if (i === 4) {
      status = 'full' // 🔴 Red
      label = 'Full'
      count = 0
    }

    slots.push({
      id: `slot-${i}`,
      time: timeString,
      status,
      label,
      count
    })
  }

  return slots
}

export default function ArrivalPlanningStep({ onNext, onBack }) {
  const { arrivalMode, setArrivalMode, selectedSlot, setSelectedSlot } = useCartStore()
  const timeSlots = useMemo(() => generateTimeSlots(), [])

  const handleSelectSlot = (slot) => {
    if (slot.status === 'full') return
    setSelectedSlot(slot.time)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="space-y-6"
    >
      {/* Step Header */}
      <div className="text-center space-y-2">
        <span className="text-[10px] font-black tracking-widest uppercase bg-orange-50 text-orange-600 px-3 py-1 rounded-full border border-orange-200">
          STEP 2 OF 4 • TAKEAWAY ARRIVAL PLANNING
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          When will you arrive for pickup?
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-md mx-auto">
          Choose whether to leave now with live GPS cooking or schedule a pickup time slot.
        </p>
      </div>

      {/* Arrival Mode Choices (Leave Now vs Schedule Pickup) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Option 1: Leave Now */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => setArrivalMode('leave-now')}
          className={`p-5 rounded-3xl border bg-white text-left transition-all relative overflow-hidden flex flex-col justify-between cursor-pointer ${
            arrivalMode === 'leave-now'
              ? 'border-orange-500 ring-2 ring-orange-500/20 shadow-xl'
              : 'border-slate-200 hover:border-orange-300'
          }`}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${arrivalMode === 'leave-now' ? 'bg-orange-500 text-white shadow-md' : 'bg-slate-100 text-slate-700'}`}>
                <Navigation size={24} />
              </div>
              <span className="text-[10px] font-black uppercase bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-full border border-emerald-200">
                ⚡ Recommended
              </span>
            </div>

            <div>
              <h3 className="text-lg font-black text-slate-900">Leave Now</h3>
              <p className="text-xs font-bold text-orange-600 mt-0.5">Live Drive ETA Cooking</p>
              <p className="text-xs text-slate-500 font-medium leading-relaxed mt-1.5">
                We'll prepare your food based on your live arrival. Kitchen starts cooking automatically as you approach.
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-black">
            <span className={arrivalMode === 'leave-now' ? 'text-orange-600' : 'text-slate-400'}>
              {arrivalMode === 'leave-now' ? '✓ Selected' : 'Tap to select'}
            </span>
            <Zap size={14} className={arrivalMode === 'leave-now' ? 'text-orange-600' : 'text-slate-300'} />
          </div>
        </motion.button>

        {/* Option 2: Schedule Pickup */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => setArrivalMode('scheduled')}
          className={`p-5 rounded-3xl border bg-white text-left transition-all relative overflow-hidden flex flex-col justify-between cursor-pointer ${
            arrivalMode === 'scheduled'
              ? 'border-indigo-500 ring-2 ring-indigo-500/20 shadow-xl'
              : 'border-slate-200 hover:border-indigo-300'
          }`}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${arrivalMode === 'scheduled' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-700'}`}>
                <Clock size={24} />
              </div>
              <span className="text-[10px] font-black uppercase bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-full border border-indigo-200">
                📅 Scheduled Slot
              </span>
            </div>

            <div>
              <h3 className="text-lg font-black text-slate-900">Schedule Pickup</h3>
              <p className="text-xs font-bold text-indigo-600 mt-0.5">15-Min Interval Windows</p>
              <p className="text-xs text-slate-500 font-medium leading-relaxed mt-1.5">
                Select a specific time window for the next 2 hours. Kitchen completes cooking 2 mins before your slot.
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-black">
            <span className={arrivalMode === 'scheduled' ? 'text-indigo-600' : 'text-slate-400'}>
              {arrivalMode === 'scheduled' ? '✓ Selected' : 'Tap to select slot'}
            </span>
            <Calendar size={14} className={arrivalMode === 'scheduled' ? 'text-indigo-600' : 'text-slate-300'} />
          </div>
        </motion.button>
      </div>

      {/* 📅 15-MINUTE TIME SLOTS GRID (Visible when 'scheduled' is active) */}
      {arrivalMode === 'scheduled' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-white p-5 rounded-3xl border border-slate-200 shadow-md space-y-4"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h4 className="font-extrabold text-slate-900 text-sm">Select Pickup Time Window</h4>
              <p className="text-xs text-slate-400 font-medium">Slots available for the next 2 hours</p>
            </div>

            <div className="flex items-center gap-3 text-[10px] font-bold">
              <span className="flex items-center gap-1 text-emerald-600">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> Available
              </span>
              <span className="flex items-center gap-1 text-amber-600">
                <span className="w-2 h-2 rounded-full bg-amber-500" /> Limited
              </span>
              <span className="flex items-center gap-1 text-rose-500">
                <span className="w-2 h-2 rounded-full bg-rose-500" /> Full
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {timeSlots.map((slot) => {
              const isSelected = selectedSlot === slot.time
              const isFull = slot.status === 'full'
              const isLimited = slot.status === 'limited'

              let colorClasses = 'border-emerald-200 bg-emerald-50/40 hover:bg-emerald-50 text-slate-900'
              let badgeColor = 'bg-emerald-500'

              if (isLimited) {
                colorClasses = 'border-amber-200 bg-amber-50/40 hover:bg-amber-50 text-slate-900'
                badgeColor = 'bg-amber-500'
              } else if (isFull) {
                colorClasses = 'border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed opacity-60'
                badgeColor = 'bg-rose-500'
              }

              if (isSelected) {
                colorClasses = 'border-indigo-600 bg-indigo-600 text-white shadow-md ring-2 ring-indigo-500/20'
              }

              return (
                <button
                  key={slot.id}
                  disabled={isFull}
                  onClick={() => handleSelectSlot(slot)}
                  className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-between gap-1 relative ${colorClasses}`}
                >
                  <span className="text-xs font-mono font-black">{slot.time}</span>
                  <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                    isSelected ? 'bg-white/20 text-white' : isFull ? 'bg-rose-100 text-rose-600' : isLimited ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {slot.label}
                  </span>
                </button>
              )
            })}
          </div>
        </motion.div>
      )}

      {/* Step Controls (Back & Continue) */}
      <div className="pt-4 flex items-center justify-between">
        <button
          onClick={onBack}
          className="px-5 py-3 text-slate-600 hover:bg-slate-100 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5"
        >
          <ArrowLeft size={16} /> Back
        </button>

        <button
          onClick={onNext}
          className="px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 active:scale-98"
        >
          <span>Continue to Order Review</span>
          <ArrowRight size={18} />
        </button>
      </div>
    </motion.div>
  )
}
