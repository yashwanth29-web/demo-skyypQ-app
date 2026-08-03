import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Clock, ChevronRight, X } from 'lucide-react'
import useOrderStore from '../store/useOrderStore'

export default function ActiveOrderWidget() {
  const navigate = useNavigate()
  const { orders } = useOrderStore()
  const [isDismissed, setIsDismissed] = useState(false)

  // Find active customer order ONLY (only when user actually places/books an order)
  const activeOrder = orders.find((o) => o.isCustomerOrder && o.status !== 'completed' && o.status !== 'cancelled')

  if (!activeOrder || isDismissed) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        className="fixed bottom-20 left-4 right-4 z-40 flex flex-col items-center pointer-events-none"
      >
        <div className="bg-white/95 backdrop-blur-xl border border-orange-200 text-slate-900 rounded-2xl p-3 shadow-xl shadow-orange-500/10 flex items-center justify-between w-full max-w-sm pointer-events-auto cursor-pointer hover:bg-orange-50/50 transition-all">
          <div onClick={() => navigate('/tracking')} className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-9 h-9 bg-orange-500 text-white rounded-xl flex items-center justify-center shrink-0 font-bold shadow-md shadow-orange-500/20">
              <Clock size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-black text-xs text-slate-900 truncate">
                {activeOrder.status === 'preparing' ? 'Chef is preparing your meal' : activeOrder.status === 'ready' ? 'Food is ready for pickup!' : 'Preparing for your arrival'}
              </h4>
              <p className="text-[10px] text-slate-500 font-semibold truncate flex items-center gap-1">
                <span>{activeOrder.items?.length || 1} items</span>
                <span>•</span>
                <span className="font-mono text-orange-600 font-black">₹{activeOrder.total?.toFixed(0) || activeOrder.total}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 pl-2">
            <button
              onClick={() => navigate('/tracking')}
              className="flex items-center gap-1 bg-orange-500 hover:bg-orange-600 text-white text-xs font-black px-3 py-1.5 rounded-xl shadow-md shadow-orange-500/20 transition-all cursor-pointer"
            >
              Track <ChevronRight size={14} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                setIsDismissed(true)
              }}
              className="p-1 text-slate-400 hover:text-slate-700 rounded-lg transition-colors cursor-pointer"
              title="Dismiss"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
