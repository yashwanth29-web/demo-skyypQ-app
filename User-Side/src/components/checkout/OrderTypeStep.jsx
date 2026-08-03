import React from 'react'
import { motion } from 'framer-motion'
import { ShoppingBag, UtensilsCrossed, ArrowRight, CheckCircle2, Zap, Clock } from 'lucide-react'
import useCartStore from '../../store/useCartStore'

export default function OrderTypeStep({ onNext }) {
  const { orderType, setOrderType } = useCartStore()

  const options = [
    {
      id: 'takeaway',
      title: 'Takeaway',
      tagline: 'Instant Express Pickup',
      description: 'Food ready when you arrive.',
      detail: 'Our kitchen syncs with your live drive ETA so your order is hot and ready at the counter the second you step in.',
      badge: 'Zero Waiting Guarantee',
      badgeBg: 'bg-orange-50 text-orange-600 border-orange-200',
      icon: ShoppingBag,
      gradient: 'from-orange-500/10 via-amber-500/5 to-transparent',
      borderColor: orderType === 'takeaway' ? 'border-orange-500 ring-2 ring-orange-500/20 shadow-xl' : 'border-slate-200 hover:border-orange-300'
    },
    {
      id: 'dine-in',
      title: 'Dine-In',
      tagline: 'VIP Table Reservation',
      description: 'Reserved table with food prepared on time.',
      detail: 'Walk straight to your reserved table with food prepared right as you sit down. No waiting for a table or menu.',
      badge: 'Immediate Seating',
      badgeBg: 'bg-emerald-50 text-emerald-600 border-emerald-200',
      icon: UtensilsCrossed,
      gradient: 'from-emerald-500/10 via-teal-500/5 to-transparent',
      borderColor: orderType === 'dine-in' ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-xl' : 'border-slate-200 hover:border-emerald-300'
    }
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="space-y-6"
    >
      {/* Step Header */}
      <div className="text-center space-y-2">
        <span className="text-[10px] font-black tracking-widest uppercase bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full border border-indigo-200">
          STEP 1 OF 4 • CHOOSE EXPERIENCE
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          How would you like to experience your visit?
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-md mx-auto">
          SkYppQ synchronizes the kitchen with your arrival time for 100% zero waiting.
        </p>
      </div>

      {/* Large Premium Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {options.map((opt) => {
          const Icon = opt.icon
          const isSelected = orderType === opt.id

          return (
            <motion.button
              key={opt.id}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setOrderType(opt.id)}
              className={`p-6 rounded-3xl border bg-white text-left transition-all relative overflow-hidden flex flex-col justify-between cursor-pointer ${opt.borderColor}`}
            >
              <div className={`absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl ${opt.gradient} rounded-bl-full pointer-events-none`} />

              <div className="space-y-4 relative z-10">
                <div className="flex justify-between items-start">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${isSelected ? (opt.id === 'takeaway' ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30' : 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30') : 'bg-slate-100 text-slate-700'}`}>
                    <Icon size={28} />
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border ${opt.badgeBg}`}>
                      {opt.badge}
                    </span>
                    {isSelected && (
                      <CheckCircle2 size={22} className={opt.id === 'takeaway' ? 'text-orange-500 fill-orange-500/20' : 'text-emerald-500 fill-emerald-500/20'} />
                    )}
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block">
                    {opt.tagline}
                  </span>
                  <h3 className="text-xl font-black text-slate-900 mt-0.5">{opt.title}</h3>
                  <p className="text-sm font-bold text-slate-800 mt-1">{opt.description}</p>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed mt-2">{opt.detail}</p>
                </div>
              </div>

              <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-black">
                <span className={isSelected ? (opt.id === 'takeaway' ? 'text-orange-600' : 'text-emerald-600') : 'text-slate-400'}>
                  {isSelected ? '✓ Selected' : 'Tap to select'}
                </span>
                <ArrowRight size={16} className={isSelected ? (opt.id === 'takeaway' ? 'text-orange-600' : 'text-emerald-600') : 'text-slate-300'} />
              </div>
            </motion.button>
          )
        })}
      </div>

      {/* Action Footer */}
      <div className="pt-4 flex justify-end">
        <button
          onClick={onNext}
          disabled={!orderType}
          className="w-full sm:w-auto px-8 py-4 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-extrabold text-sm rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 active:scale-98"
        >
          <span>Continue to Arrival Planning</span>
          <ArrowRight size={18} />
        </button>
      </div>
    </motion.div>
  )
}
