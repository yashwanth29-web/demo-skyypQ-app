import React from 'react'
import { Check, Flame, Sparkles, CheckCircle2 } from 'lucide-react'

const stages = [
  { id: 'pending', label: 'Confirmed' },
  { id: 'preparing', label: 'Preparing' },
  { id: 'ready', label: 'Food Ready' },
  { id: 'completed', label: 'Completed' }
]

export default function OrderTimeline({ currentStatus, onStatusChange }) {
  const currentIndex = stages.findIndex((s) => s.id === currentStatus)

  return (
    <div className="w-full mt-4 space-y-4">
      <div className="flex items-center justify-between relative px-2">
        {/* Connecting line */}
        <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-700/50 -translate-y-1/2 rounded-full z-0" />
        <div
          className="absolute top-1/2 left-0 h-1 bg-orange-500 -translate-y-1/2 rounded-full z-0 transition-all duration-500"
          style={{ width: `${(Math.max(0, currentIndex) / (stages.length - 1)) * 100}%` }}
        />

        {/* Nodes */}
        {stages.map((stage, index) => {
          const isCompleted = index <= currentIndex
          const isCurrent = index === currentIndex

          return (
            <div key={stage.id} className="relative z-10 flex flex-col items-center gap-1 group">
              <button
                onClick={() => onStatusChange(stage.id)}
                className={`w-6 h-6 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                  isCompleted ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30' : 'bg-slate-800 border-2 border-slate-600 text-transparent'
                } ${isCurrent ? 'ring-4 ring-orange-500/30 scale-110' : 'hover:scale-105'}`}
              >
                {isCompleted && <Check size={12} strokeWidth={4} />}
              </button>
              <span className={`text-[9px] font-black uppercase tracking-wider transition-colors ${
                isCurrent ? 'text-orange-400' : isCompleted ? 'text-slate-200' : 'text-slate-500'
              }`}>
                {stage.label}
              </span>
            </div>
          )
        })}
      </div>

      {/* Prominent Action Button for Restaurant Owner */}
      <div className="pt-2">
        {(currentStatus === 'pending' || currentStatus === 'confirmed' || !currentStatus) && (
          <button
            onClick={() => onStatusChange('preparing')}
            className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-black text-xs rounded-xl shadow-md uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-98"
          >
            <Flame size={14} /> START PREPARING
          </button>
        )}

        {currentStatus === 'preparing' && (
          <button
            onClick={() => onStatusChange('ready')}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-98"
          >
            <Sparkles size={14} /> MARK FOOD READY
          </button>
        )}

        {currentStatus === 'ready' && (
          <button
            onClick={() => onStatusChange('completed')}
            className="w-full py-2.5 bg-slate-700 hover:bg-slate-600 text-white font-black text-xs rounded-xl shadow-md uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-98"
          >
            <CheckCircle2 size={14} /> COMPLETE ORDER
          </button>
        )}
      </div>
    </div>
  )
}
