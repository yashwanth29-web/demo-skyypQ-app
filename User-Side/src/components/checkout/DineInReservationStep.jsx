import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { UtensilsCrossed, Clock, CheckCircle2, ArrowRight, ArrowLeft, Sparkles, UserCheck, ShieldCheck } from 'lucide-react'
import useCartStore from '../../store/useCartStore'

// Helper to generate 15-min interval table reservation slots for next 2 hours
const generateDineInSlots = () => {
  const slots = []
  const now = new Date()
  
  const startMinutes = Math.ceil((now.getMinutes() + 10) / 15) * 15
  const startTime = new Date(now)
  startTime.setMinutes(startMinutes, 0, 0)

  for (let i = 0; i < 8; i++) {
    const slotTime = new Date(startTime.getTime() + i * 15 * 60000)
    const hours = slotTime.getHours()
    const minutes = slotTime.getMinutes()
    const ampm = hours >= 12 ? 'PM' : 'AM'
    const formattedHours = hours % 12 || 12
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes
    const timeString = `${formattedHours}:${formattedMinutes} ${ampm}`

    // Calculate food ready time (2 mins before table reservation time)
    const foodTime = new Date(slotTime.getTime() - 2 * 60000)
    const foodHours = foodTime.getHours()
    const foodMinutes = foodTime.getMinutes()
    const foodAmpm = foodHours >= 12 ? 'PM' : 'AM'
    const formattedFoodHours = foodHours % 12 || 12
    const formattedFoodMinutes = foodMinutes < 10 ? `0${foodMinutes}` : foodMinutes
    const foodReadyString = `${formattedFoodHours}:${formattedFoodMinutes} ${foodAmpm}`

    const tablesCount = Math.max(2, 10 - i * 1) // e.g. 8 tables available

    slots.push({
      id: `dine-slot-${i}`,
      time: timeString,
      tablesAvailable: tablesCount,
      foodReadyTime: foodReadyString,
      tableReadyTime: timeString,
      tableNumber: (i % 6) + 3 // Table 3 to 8
    })
  }

  return slots
}

export default function DineInReservationStep({ onNext, onBack }) {
  const { selectedSlot, setSelectedSlot, setDineInDetails } = useCartStore()
  const slots = useMemo(() => generateDineInSlots(), [])

  // Currently active selected slot object
  const activeSlot = useMemo(() => {
    return slots.find((s) => s.time === selectedSlot) || slots[0]
  }, [slots, selectedSlot])

  const handleSelect = (slot) => {
    setSelectedSlot(slot.time)
    setDineInDetails({
      selectedSlot: slot.time,
      tableNumber: slot.tableNumber,
      availableTablesCount: slot.tablesAvailable,
      estimatedFoodReadyTime: slot.foodReadyTime,
      estimatedArrivalTime: slot.tableReadyTime
    })
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
        <span className="text-[10px] font-black tracking-widest uppercase bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full border border-emerald-200">
          STEP 2 OF 4 • DINE-IN TABLE RESERVATION
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Select Your Seating Window
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-md mx-auto">
          Selecting a slot automatically reserves your table and schedules food preparation to complete 2 mins before you sit down.
        </p>
      </div>

      {/* 🟢 TIME SLOTS SELECTOR GRID */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-md space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <UtensilsCrossed size={16} className="text-emerald-600" />
              Available Table Reservation Slots
            </h3>
            <p className="text-xs text-slate-400 font-medium">Slots available for the next 2 hours</p>
          </div>
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            Real-Time Sync
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {slots.map((s) => {
            const isSelected = activeSlot.id === s.id

            return (
              <button
                key={s.id}
                onClick={() => handleSelect(s)}
                className={`p-3.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-between gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-600 text-white shadow-lg ring-2 ring-emerald-500/20'
                    : 'border-slate-200 bg-white hover:border-emerald-300 text-slate-900 shadow-xs'
                }`}
              >
                <span className="text-sm font-mono font-black">{s.time}</span>
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}>
                  {s.tablesAvailable} Tables Free
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ⚡ AUTOMATIC TABLE RESERVATION & TELEMETRY CARD */}
      <div className="bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 text-white p-6 rounded-3xl border border-emerald-500/40 shadow-xl space-y-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold border border-emerald-500/30">
              <Sparkles size={24} />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider block">
                AUTOMATIC TABLE RESERVATION
              </span>
              <h4 className="font-extrabold text-base text-white">
                Table #{activeSlot.tableNumber} Auto-Reserved
              </h4>
            </div>
          </div>

          <span className="bg-emerald-500 text-slate-950 font-black text-xs px-3 py-1 rounded-full shadow-md">
            VIP Guaranteed
          </span>
        </div>

        {/* Telemetry Grid: Food Ready vs Table Ready */}
        <div className="grid grid-cols-2 gap-3 pt-2 relative z-10">
          <div className="p-3.5 bg-white/5 border border-white/10 rounded-2xl">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Estimated Food Ready
            </span>
            <span className="text-lg font-mono font-black text-emerald-400 mt-0.5 block">
              {activeSlot.foodReadyTime}
            </span>
            <p className="text-[10px] text-slate-400 mt-1">Piping hot in kitchen</p>
          </div>

          <div className="p-3.5 bg-white/5 border border-white/10 rounded-2xl">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Table Ready & Seated
            </span>
            <span className="text-lg font-mono font-black text-white mt-0.5 block">
              {activeSlot.tableReadyTime}
            </span>
            <p className="text-[10px] text-slate-400 mt-1">Walk in & sit immediately</p>
          </div>
        </div>

        <p className="text-xs text-emerald-200/90 font-medium text-center pt-1 relative z-10">
          "Walk in, take your seat at Table #{activeSlot.tableNumber}, and enjoy your meal without waiting."
        </p>
      </div>

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
