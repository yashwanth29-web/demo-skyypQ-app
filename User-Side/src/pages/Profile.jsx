import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  User, Phone, Mail, LogOut, ShoppingBag,
  Clock, CheckCircle2, ChefHat, Package, ArrowRight, RefreshCw
} from 'lucide-react'
import useAuthStore from '../store/useAuthStore'
import useOrderStore from '../store/useOrderStore'

const STATUS_CONFIG = {
  pending:    { label: 'Pending',    color: 'bg-amber-100 text-amber-800 border-amber-200',   dot: 'bg-amber-500',   icon: Clock },
  preparing:  { label: 'Preparing',  color: 'bg-orange-100 text-orange-800 border-orange-200', dot: 'bg-orange-500',  icon: ChefHat },
  ready:      { label: 'Ready',      color: 'bg-emerald-100 text-emerald-800 border-emerald-200', dot: 'bg-emerald-500', icon: CheckCircle2 },
  completed:  { label: 'Completed',  color: 'bg-slate-100 text-slate-600 border-slate-200',   dot: 'bg-slate-400',   icon: Package },
  cancelled:  { label: 'Cancelled',  color: 'bg-red-100 text-red-700 border-red-200',         dot: 'bg-red-400',     icon: Package },
}

function OrderCard({ order }) {
  const navigate = useNavigate()
  const sc = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending
  const Icon = sc.icon

  const isActive = ['pending', 'preparing', 'ready'].includes(order.status)
  const date = new Date(order.createdAt)
  const dateStr = date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  const timeStr = date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
    >
      {/* Header */}
      <div className="px-5 py-4 flex items-start justify-between border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-black text-slate-900 font-mono text-sm">{order.displayId}</span>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black border ${sc.color}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
              {sc.label}
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
            <ShoppingBag size={11} className="text-orange-500" />
            {order.restaurantName}
          </p>
        </div>
        <div className="text-right">
          <p className="text-lg font-black text-orange-600 font-mono">₹{order.total}</p>
          <p className="text-[10px] text-slate-400 font-medium capitalize">{order.type}</p>
        </div>
      </div>

      {/* Items */}
      <div className="px-5 py-3 space-y-1">
        {order.items?.slice(0, 3).map((item, i) => (
          <div key={i} className="flex justify-between text-xs text-slate-600 font-medium">
            <span>{item.quantity}× {item.name}</span>
            <span className="font-mono text-slate-500">₹{item.price * item.quantity}</span>
          </div>
        ))}
        {order.items?.length > 3 && (
          <p className="text-xs text-slate-400 font-medium">+{order.items.length - 3} more items</p>
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
        <p className="text-[11px] text-slate-400 font-medium">{dateStr} · {timeStr}</p>
        {isActive ? (
          <button
            onClick={() => navigate('/tracking')}
            className="flex items-center gap-1 text-orange-600 font-black text-xs hover:text-orange-700 cursor-pointer"
          >
            Track Order <ArrowRight size={12} />
          </button>
        ) : (
          <p className="text-[11px] text-emerald-600 font-black flex items-center gap-1">
            <CheckCircle2 size={11} /> Delivered
          </p>
        )}
      </div>
    </motion.div>
  )
}

export default function ProfilePage() {
  const navigate = useNavigate()
  const { customer, logout, isAuthenticated } = useAuthStore()
  const { orders, fetchMyOrders, isLoading } = useOrderStore()

  useEffect(() => {
    if (!isAuthenticated) navigate('/login', { replace: true })
    else fetchMyOrders()
  }, [isAuthenticated])

  const handleLogout = () => {
    logout()
    navigate('/', { replace: true })
  }

  const activeOrders = orders.filter((o) => ['pending', 'preparing', 'ready'].includes(o.status))
  const pastOrders = orders.filter((o) => ['completed', 'cancelled'].includes(o.status))

  const totalSpent = pastOrders
    .filter((o) => o.status === 'completed')
    .reduce((sum, o) => sum + (o.total || 0), 0)

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-28 pt-16 md:pt-20">
      <main className="max-w-2xl mx-auto px-4 sm:px-6 space-y-6 pt-4">

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden"
        >
          {/* Orange header band */}
          <div className="h-24 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 relative">
            <div className="absolute inset-0 opacity-20"
              style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
          </div>

          {/* Avatar + Info */}
          <div className="px-6 pb-6 -mt-10 relative">
            <div className="w-20 h-20 bg-white rounded-3xl border-4 border-white shadow-xl flex items-center justify-center mb-4"
              style={{ background: 'linear-gradient(135deg, #ea580c, #f97316)' }}>
              <User size={36} className="text-white" />
            </div>

            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">{customer?.name || 'Customer'}</h1>
                <div className="flex flex-wrap gap-3 mt-2">
                  {customer?.phone && (
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                      <Phone size={12} className="text-orange-500" /> {customer.phone}
                    </span>
                  )}
                  {customer?.email && (
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                      <Mail size={12} className="text-orange-500" /> {customer.email}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-black text-xs px-3 py-2 rounded-xl cursor-pointer transition-colors"
              >
                <LogOut size={13} /> Sign Out
              </button>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3 mt-5">
              {[
                { label: 'Total Orders', value: orders.length },
                { label: 'Completed', value: pastOrders.filter((o) => o.status === 'completed').length },
                { label: 'Total Spent', value: `₹${totalSpent.toLocaleString()}` },
              ].map(({ label, value }) => (
                <div key={label} className="bg-orange-50 border border-orange-100 rounded-2xl p-3 text-center">
                  <p className="text-lg font-black text-orange-600 font-mono">{value}</p>
                  <p className="text-[10px] font-bold text-slate-500 mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Active Orders */}
        {activeOrders.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-black text-slate-900 flex items-center gap-2">
                <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                Active Orders
              </h2>
              <button onClick={() => navigate('/tracking')}
                className="text-xs font-black text-orange-600 hover:text-orange-700 cursor-pointer">
                Track →
              </button>
            </div>
            {activeOrders.map((order) => (
              <OrderCard key={order._id} order={order} />
            ))}
          </section>
        )}

        {/* Order History */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-black text-slate-900 flex items-center gap-2">
              <ShoppingBag size={16} className="text-orange-500" />
              Order History
            </h2>
            <button onClick={fetchMyOrders}
              className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-700 cursor-pointer">
              <RefreshCw size={12} className={isLoading ? 'animate-spin' : ''} /> Refresh
            </button>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="bg-white rounded-3xl border border-slate-200 p-5 animate-pulse space-y-3">
                  <div className="flex justify-between">
                    <div className="h-4 w-24 bg-slate-200 rounded-full" />
                    <div className="h-4 w-16 bg-slate-200 rounded-full" />
                  </div>
                  <div className="h-3 w-40 bg-slate-100 rounded-full" />
                  <div className="h-3 w-32 bg-slate-100 rounded-full" />
                </div>
              ))}
            </div>
          ) : pastOrders.length === 0 && activeOrders.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-10 text-center space-y-3 shadow-sm">
              <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto">
                <ShoppingBag size={28} className="text-orange-400" />
              </div>
              <h3 className="font-black text-slate-900">No orders yet</h3>
              <p className="text-sm text-slate-500 font-medium">
                Your order history will appear here once you place your first order.
              </p>
              <button
                onClick={() => navigate('/')}
                className="bg-orange-500 hover:bg-orange-600 text-white font-black text-sm px-6 py-3 rounded-2xl cursor-pointer transition-colors shadow-md shadow-orange-500/20 inline-flex items-center gap-2"
              >
                Browse Restaurants <ArrowRight size={15} />
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {pastOrders.map((order) => (
                <OrderCard key={order._id} order={order} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
