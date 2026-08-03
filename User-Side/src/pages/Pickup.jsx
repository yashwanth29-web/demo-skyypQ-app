import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Home, CheckCircle2, Utensils, ShoppingBag, ArrowLeft, Clock, MapPin, Shield, Copy, Check } from 'lucide-react'
import { motion } from 'framer-motion'
import useOrderStore from '../store/useOrderStore'
import useCartStore from '../store/useCartStore'

// Real QR code via external API — encodes SKYYQ:PICKUP:{pickupToken}
function PickupQR({ pickupToken, size = 200 }) {
  const [loaded, setLoaded] = useState(false)
  if (!pickupToken) {
    return (
      <div style={{ width: size, height: size }}
        className="bg-slate-100 rounded-2xl flex items-center justify-center animate-pulse">
        <span className="text-slate-400 text-xs font-medium">Generating...</span>
      </div>
    )
  }
  const payload = encodeURIComponent(`SKYYQ:PICKUP:${pickupToken}`)
  const src = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${payload}&margin=2&color=0f172a&bgcolor=ffffff&qzone=2`
  return (
    <div className="relative" style={{ width: size, height: size }}>
      {!loaded && (
        <div className="absolute inset-0 bg-slate-100 rounded-2xl animate-pulse" />
      )}
      <img src={src} alt="Pickup QR" width={size} height={size}
        className="rounded-2xl block"
        onLoad={() => setLoaded(true)}
        style={{ opacity: loaded ? 1 : 0, transition: 'opacity 0.3s' }}
      />
    </div>
  )
}

// Format token into readable groups: a3f9c1b2 d4e8f0a1 b2c3d4e5
function formatToken(token) {
  if (!token) return '— — — —'
  return token.match(/.{1,4}/g)?.join(' ') || token
}

// Short code: first 8 chars uppercase
function shortCode(token) {
  return token ? token.slice(0, 8).toUpperCase() : '——'
}

export default function PickupPage() {
  const navigate = useNavigate()
  const { orders, fetchMyOrders } = useOrderStore()
  const [activeOrder, setActiveOrder] = useState(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const cached = sessionStorage.getItem('skyyq_active_order')
    if (cached) setActiveOrder(JSON.parse(cached))
    fetchMyOrders()
  }, [])

  useEffect(() => {
    const fromStore = orders.find((o) => o.isCustomerOrder && o.status !== 'completed') || orders[0]
    if (fromStore) setActiveOrder(fromStore)
  }, [orders])

  const isDineIn = activeOrder?.type === 'dine-in'
  const restaurantName = activeOrder?.restaurantName || 'Your Restaurant'
  const arrivalTime = activeOrder?.slot || '—'
  const pickupToken = activeOrder?.pickupToken || ''
  const code = shortCode(pickupToken)

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDone = () => {
    sessionStorage.removeItem('skyyq_active_order')
    sessionStorage.removeItem('skyyq_active_order_id')
    useCartStore.getState().clearCart()
    navigate('/')
  }

  const isCompleted = activeOrder?.status === 'completed'

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 py-8 font-sans">
      <main className="w-full max-w-sm mx-auto">
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white border border-slate-200 rounded-3xl shadow-xl overflow-hidden"
        >
          {/* Dark header */}
          <div className="bg-slate-900 p-6 text-center space-y-3 relative overflow-hidden">
            {/* Dot grid texture */}
            <div className="absolute inset-0 opacity-10"
              style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '16px 16px' }} />

            <div className="relative z-10">
              {/* Back */}
              <button onClick={() => navigate('/tracking')}
                className="absolute left-0 top-0 flex items-center gap-1 text-slate-500 hover:text-slate-300 text-xs font-bold cursor-pointer transition-colors">
                <ArrowLeft size={14} /> Back
              </button>

              <span className="inline-block text-[10px] font-black uppercase tracking-widest text-orange-400 bg-orange-500/15 border border-orange-500/30 px-3 py-1 rounded-full mb-3">
                Pickup Pass
              </span>

              <div className="w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-orange-500/30 mb-3">
                {isCompleted
                  ? <CheckCircle2 size={30} className="text-white" />
                  : isDineIn ? <Utensils size={28} className="text-white" /> : <ShoppingBag size={28} className="text-white" />}
              </div>

              <h1 className="text-xl font-black text-white">
                {isCompleted ? '✅ Picked Up!' : isDineIn ? 'Dine-In Pass' : 'Takeaway Pass'}
              </h1>
              <p className="text-xs text-slate-400 font-medium mt-1">
                {isCompleted
                  ? 'Your order has been handed over.'
                  : 'Show this to restaurant staff for instant pickup.'}
              </p>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 space-y-5">
            {!isCompleted ? (
              <>
                {/* QR Code */}
                <div className="flex flex-col items-center gap-3">
                  <div className="p-3 border-2 border-slate-200 rounded-2xl bg-white shadow-sm">
                    <PickupQR pickupToken={pickupToken} size={180} />
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium text-center">
                    Staff will scan this QR to verify and complete your order
                  </p>
                </div>

                {/* Auth code */}
                <div className="bg-slate-900 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Shield size={13} className="text-orange-400" />
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Auth Code</span>
                    </div>
                    <button onClick={handleCopy}
                      className="flex items-center gap-1 text-[10px] font-black text-slate-400 hover:text-white cursor-pointer transition-colors">
                      {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                      {copied ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <p className="font-mono text-2xl font-black text-white text-center tracking-[0.15em]">
                    {code}
                  </p>
                  <p className="text-[10px] text-slate-600 font-medium text-center">
                    If scanning fails, give this code to the staff
                  </p>
                </div>

                {/* Order info */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between py-2.5 border-b border-slate-100">
                    <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                      <MapPin size={12} className="text-orange-500" /> Restaurant
                    </span>
                    <span className="text-xs font-black text-slate-900">{restaurantName}</span>
                  </div>
                  <div className="flex items-center justify-between py-2.5 border-b border-slate-100">
                    <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                      <Clock size={12} className="text-orange-500" /> Arrival
                    </span>
                    <span className="text-xs font-black text-orange-600">{arrivalTime}</span>
                  </div>
                  <div className="flex items-center justify-between py-2.5">
                    <span className="text-xs font-bold text-slate-500">Order ID</span>
                    <span className="text-xs font-black text-slate-900 font-mono">{activeOrder?.displayId || '—'}</span>
                  </div>
                </div>

                {/* Items */}
                {activeOrder?.items?.length > 0 && (
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 space-y-1.5">
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2">Your Order</p>
                    {activeOrder.items.map((item, i) => (
                      <div key={i} className="flex justify-between text-xs font-bold text-slate-700">
                        <span>{item.quantity}× {item.name}</span>
                        <span className="font-mono text-slate-900">₹{item.price * item.quantity}</span>
                      </div>
                    ))}
                    <div className="border-t border-slate-200 pt-2 mt-1 flex justify-between text-xs font-black text-slate-900">
                      <span>Total</span>
                      <span className="text-orange-600 font-mono">₹{activeOrder.total}</span>
                    </div>
                  </div>
                )}

                {/* Security notice */}
                <div className="flex items-start gap-2.5 bg-blue-50 border border-blue-200 rounded-2xl p-3">
                  <Shield size={14} className="text-blue-500 shrink-0 mt-0.5" />
                  <p className="text-[11px] font-medium text-blue-700 leading-relaxed">
                    Your pickup code is unique and single-use. Only the person with this code can collect the order.
                  </p>
                </div>
              </>
            ) : (
              /* Completed state */
              <div className="text-center space-y-4 py-4">
                <div className="w-20 h-20 bg-emerald-100 rounded-3xl flex items-center justify-center mx-auto">
                  <CheckCircle2 size={40} className="text-emerald-500" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900">Order Collected!</h2>
                  <p className="text-sm text-slate-500 font-medium mt-1">Enjoy your meal 🍽️</p>
                </div>
              </div>
            )}

            {/* Done button */}
            <button onClick={handleDone}
              className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-black text-sm rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer">
              <Home size={16} /> Done & Return Home
            </button>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
