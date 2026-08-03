import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, useLocation } from 'react-router-dom'
import { Clock, ChevronRight, X } from 'lucide-react'
import useOrderStore from '../store/useOrderStore'

export default function ActiveOrderWidget() {
  const navigate = useNavigate()
  const location = useLocation()
  const { orders, fetchMyOrders } = useOrderStore()
  const [isDismissed, setIsDismissed] = useState(false)

  // Fetch orders when the widget mounts on the homepage
  useEffect(() => {
    const token = localStorage.getItem('skyyq_customer_token')
    if (token) {
      fetchMyOrders()
    }
  }, [fetchMyOrders])

  // Find ALL active customer orders
  const activeOrders = orders.filter((o) => o.isCustomerOrder && !['completed', 'cancelled'].includes(o.status))

  if (activeOrders.length === 0 || isDismissed) return null

  // Ensure active order is stored in sessionStorage when clicked, so tracking page knows which one to track
  const handleTrackClick = (order) => {
    sessionStorage.setItem('skyyq_active_order_id', order._id)
    sessionStorage.setItem('skyyq_active_order', JSON.stringify(order))
    navigate(`/tracking/${order._id}`)
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        className={`fixed left-0 right-0 z-40 pointer-events-none md:fixed md:right-8 md:left-auto md:max-w-sm md:w-[350px] md:flex md:flex-col items-end transition-all duration-300 ${location.pathname === '/discovery' ? 'bottom-20 md:bottom-[90px]' : 'bottom-20 md:bottom-8'}`}
      >
        <div className="w-full overflow-x-auto md:overflow-visible flex flex-row md:flex-col gap-3 px-4 md:px-0 pb-2 md:pb-0 pt-2 md:pt-0 snap-x snap-mandatory hide-scrollbar">
          {activeOrders.map((activeOrder, index) => (
            <div
              key={activeOrder._id}
              onClick={() => handleTrackClick(activeOrder)}
              className="bg-white/95 backdrop-blur-xl border border-orange-200 text-slate-900 rounded-2xl p-3 shadow-xl shadow-orange-500/10 flex items-center justify-between w-[90%] md:w-80 max-w-sm shrink-0 snap-center pointer-events-auto cursor-pointer hover:bg-orange-50/50 transition-all"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-9 h-9 bg-orange-500 text-white rounded-xl flex items-center justify-center shrink-0 font-bold shadow-md shadow-orange-500/20">
                  <Clock size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-black text-xs text-slate-900 truncate">
                    {activeOrder.status === 'preparing' ? 'Chef is preparing your meal' : activeOrder.status === 'ready' ? 'Food is ready for pickup!' : 'Preparing for your arrival'}
                  </h4>
                  <p className="text-[10px] text-slate-500 font-semibold truncate flex items-center gap-1">
                    <span className="truncate max-w-[80px]">{activeOrder.restaurantName || 'Restaurant'}</span>
                    <span>•</span>
                    <span className="font-mono text-orange-600 font-black">₹{activeOrder.total?.toFixed(0) || activeOrder.total}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0 pl-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleTrackClick(activeOrder)
                  }}
                  className="flex items-center gap-1 bg-orange-500 hover:bg-orange-600 text-white text-xs font-black px-3 py-1.5 rounded-xl shadow-md shadow-orange-500/20 transition-all cursor-pointer"
                >
                  Track <ChevronRight size={14} />
                </button>
                {/* Only show dismiss button if it's a single order, or on the last element */}
                {activeOrders.length === 1 && (
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
                )}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
