import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, useLocation } from 'react-router-dom'
import { Clock, ChevronRight, X, Rocket, Navigation } from 'lucide-react'
import useOrderStore from '../store/useOrderStore'
import { toast } from 'react-hot-toast'

export default function ActiveOrderWidget() {
  const navigate = useNavigate()
  const location = useLocation()
  const { orders, fetchMyOrders } = useOrderStore()
  const [isDismissed, setIsDismissed] = useState(false)
  
  // Track which order IDs have "Start Push" activated
  const [pushedOrders, setPushedOrders] = useState({})

  // Fetch orders when the widget mounts
  useEffect(() => {
    const token = localStorage.getItem('skyyq_customer_token')
    if (token) {
      fetchMyOrders()
    }
  }, [fetchMyOrders])

  // Find ALL active customer orders
  const activeOrders = orders.filter(
    (o) => o.isCustomerOrder && !['completed', 'cancelled'].includes(o.status)
  )

  if (activeOrders.length === 0 || isDismissed) return null

  // Store active order in sessionStorage & navigate to tracking page
  const handleTrackClick = (order) => {
    sessionStorage.setItem('skyyq_active_order_id', order._id)
    sessionStorage.setItem('skyyq_active_order', JSON.stringify(order))
    navigate(`/tracking/${order._id}`)
  }

  const handleStartPush = (e, orderId) => {
    e.stopPropagation()
    setPushedOrders((prev) => ({ ...prev, [orderId]: true }))
    toast.success('🚀 Push Started! Live ETA tracking activated.', {
      icon: '🚀',
      duration: 3000
    })
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 80, opacity: 0, x: '-50%' }}
        animate={{ y: 0, opacity: 1, x: '-50%' }}
        exit={{ y: 80, opacity: 0, x: '-50%' }}
        className="fixed bottom-6 sm:bottom-8 left-1/2 z-50 max-w-md w-[92vw] sm:w-[440px] pointer-events-none"
      >
        <div className="w-full flex flex-col gap-2.5">
          {activeOrders.map((activeOrder) => {
            const isPushed = pushedOrders[activeOrder._id]

            return (
              <div
                key={activeOrder._id}
                onClick={() => {
                  if (isPushed) {
                    handleTrackClick(activeOrder)
                  }
                }}
                className="bg-slate-900/95 backdrop-blur-2xl border border-orange-500/40 text-white rounded-2xl p-3 sm:p-3.5 shadow-2xl shadow-orange-500/20 flex items-center justify-between gap-3 w-full pointer-events-auto cursor-pointer hover:border-orange-500 transition-all group"
              >
                {/* Left Icon & Text Info */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-600 text-white rounded-xl flex items-center justify-center shrink-0 font-bold shadow-md shadow-orange-500/30 group-hover:scale-105 transition-transform">
                    {isPushed ? (
                      <Navigation size={20} className="animate-pulse text-white" />
                    ) : (
                      <Clock size={20} />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h4 className="font-black text-xs sm:text-sm text-white truncate flex items-center gap-1.5">
                      <span>
                        {activeOrder.status === 'preparing'
                          ? 'Chef is preparing your meal'
                          : activeOrder.status === 'ready'
                          ? 'Food is ready for pickup!'
                          : 'Preparing for your arrival'}
                      </span>
                    </h4>
                    <p className="text-[11px] text-slate-300 font-semibold truncate flex items-center gap-1.5 mt-0.5">
                      <span className="truncate max-w-[110px] text-orange-300 font-bold">
                        {activeOrder.restaurantName || 'Restaurant'}
                      </span>
                      <span className="text-slate-500">•</span>
                      <span className="font-mono text-white font-black">
                        ₹{activeOrder.total?.toFixed(0) || activeOrder.total}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Right Interactive CTA Button */}
                <div className="flex items-center gap-2 shrink-0">
                  {!isPushed ? (
                    <button
                      onClick={(e) => handleStartPush(e, activeOrder._id)}
                      className="flex items-center gap-1.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-black px-3.5 py-2 rounded-xl shadow-md shadow-orange-500/25 transition-all cursor-pointer active:scale-95"
                    >
                      <Rocket size={14} className="animate-bounce" />
                      <span>Start Push</span>
                    </button>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleTrackClick(activeOrder)
                      }}
                      className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black px-3.5 py-2 rounded-xl shadow-md shadow-emerald-600/30 transition-all cursor-pointer active:scale-95"
                    >
                      <span>Track</span>
                      <ChevronRight size={14} />
                    </button>
                  )}

                  {/* Dismiss Button (Only when 1 order) */}
                  {activeOrders.length === 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setIsDismissed(true)
                      }}
                      className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                      title="Dismiss"
                    >
                      <X size={15} />
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
