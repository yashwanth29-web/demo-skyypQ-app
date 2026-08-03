import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Store, ShoppingBag, Clock, ShieldCheck, Sparkles, Tag, ArrowLeft, CheckCircle2, CreditCard, Trash2, Plus, Minus, UtensilsCrossed, Zap } from 'lucide-react'
import useCartStore from '../../store/useCartStore'
import menuData from '../../mock/menu.json'
import toast from 'react-hot-toast'

export default function OrderReviewStep({ restaurant, onConfirmOrder, onBack }) {
  const { cart, addToCart, removeFromCart, clearCart, getTotalPrice, orderType, arrivalMode, selectedSlot, tableNumber, estimatedFoodReadyTime } = useCartStore()
  
  const [promoCode, setPromoCode] = useState('')
  const [appliedDiscount, setAppliedDiscount] = useState(0)

  const cartItemEntries = Object.entries(cart).filter(([_, qty]) => qty > 0)
  const itemsTotal = getTotalPrice(menuData)
  const taxesAndFees = itemsTotal > 0 ? 1.5 : 0
  const deliveryFee = itemsTotal > 0 ? 3.99 : 0
  const deliveryDiscount = itemsTotal > 0 ? 3.99 : 0
  const totalBeforeDiscount = itemsTotal + taxesAndFees + deliveryFee - deliveryDiscount
  const finalTotal = Math.max(0, totalBeforeDiscount - appliedDiscount)

  const isDineIn = orderType === 'dine-in'

  const handleApplyPromo = () => {
    if (promoCode.trim().toUpperCase() === 'TAKEAWAY10' || promoCode.trim().toUpperCase() === 'SKYPPQ') {
      setAppliedDiscount(50)
      toast.success('Promo code applied! Saved ₹50', { icon: '🎉' })
    } else {
      toast.error('Invalid Promo Code. Try "TAKEAWAY10"')
    }
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
        <span className="text-[10px] font-black tracking-widest uppercase bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full border border-indigo-200">
          STEP 3 OF 4 • FINAL ORDER REVIEW
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Review & Confirm Your Visit
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-md mx-auto">
          Double check your order items and zero-wait timing telemetry before payment.
        </p>
      </div>

      {/* ⚡ ZERO-WAIT PLEDGE BANNER */}
      <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-indigo-500/10 border border-emerald-500/30 text-emerald-950 p-4 rounded-3xl flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-600 flex items-center justify-center font-bold shrink-0">
            <Zap size={20} className="animate-pulse" />
          </div>
          <div>
            <h4 className="font-extrabold text-sm text-slate-900">Zero-Wait Guarantee Active</h4>
            <p className="text-xs font-bold text-emerald-700">"There will be no waiting."</p>
          </div>
        </div>
        <span className="text-[10px] font-black uppercase bg-emerald-600 text-white px-3 py-1 rounded-full shadow-sm shrink-0">
          SkYppQ Telemetry
        </span>
      </div>

      {/* Main Grid: Left Items List + Right Summary & Payment Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Order Items & Restaurant Header */}
        <div className="md:col-span-2 space-y-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-md space-y-4">
            {/* Restaurant Info Bar */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-orange-50 border border-orange-100 text-orange-600 flex items-center justify-center font-bold">
                  <Store size={20} />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">{restaurant?.name || 'Chutneys'}</h3>
                  <p className="text-xs text-slate-400 font-medium">Financial District • Multi-Cuisine</p>
                </div>
              </div>

              <span className={`text-xs font-extrabold px-3 py-1 rounded-full border uppercase ${
                isDineIn ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-orange-50 text-orange-700 border-orange-200'
              }`}>
                {isDineIn ? '🍽️ Dine-In' : '🛍️ Takeaway'}
              </span>
            </div>

            {/* Cart Items List */}
            <div className="space-y-3">
              <AnimatePresence>
                {cartItemEntries.map(([itemId, qty]) => {
                  const item = menuData.find((m) => m.id === itemId)
                  if (!item) return null

                  return (
                    <motion.div
                      key={itemId}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/70 flex items-center gap-3.5 hover:border-slate-300 transition-all"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-14 h-14 rounded-xl object-cover border border-slate-200 shadow-xs shrink-0"
                      />

                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-slate-900 text-sm truncate">{item.name}</h4>
                        <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500 font-medium">
                          <span className="font-mono text-indigo-600 font-bold">${item.price.toFixed(2)} / item</span>
                          <span>•</span>
                          <span className="text-amber-700 font-extrabold flex items-center gap-1">
                            <Clock size={11} /> Prep: {item.prepTime || '15 mins'}
                          </span>
                        </div>
                      </div>

                      {/* Quantity Pill */}
                      <div className="flex items-center bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden shrink-0">
                        <button
                          type="button"
                          onClick={() => removeFromCart({ id: item.id })}
                          className="p-1.5 text-slate-600 hover:bg-slate-100"
                        >
                          {qty === 1 ? <Trash2 size={13} className="text-rose-500" /> : <Minus size={13} />}
                        </button>
                        <span className="px-2.5 text-xs font-mono font-black text-slate-900">{qty}</span>
                        <button
                          type="button"
                          onClick={() => addToCart({ id: item.id, restaurantId: item.restaurantId })}
                          className="p-1.5 text-indigo-600 hover:bg-indigo-50"
                        >
                          <Plus size={13} />
                        </button>
                      </div>

                      <div className="text-right shrink-0 min-w-[50px]">
                        <span className="font-black text-slate-900 text-sm font-mono">${(item.price * qty).toFixed(2)}</span>
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Right Column: Timing Telemetry, Pricing & Payment */}
        <div className="space-y-4">
          {/* Timing Telemetry Box */}
          <div className="bg-slate-900 text-white p-5 rounded-3xl shadow-xl space-y-3 relative overflow-hidden border border-slate-800">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2.5">
              <span className="text-[10px] font-black uppercase text-indigo-400 tracking-wider">
                TIMING & TELEMETRY
              </span>
              <span className="text-xs font-mono text-emerald-400 font-extrabold">Synced ⚡</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Estimated Kitchen Prep:</span>
                <span className="font-mono font-bold text-amber-400">15–18 mins</span>
              </div>

              {isDineIn ? (
                <>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-medium">Reserved Table:</span>
                    <span className="font-mono font-bold text-emerald-400">Table #{tableNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-medium">Food Ready Time:</span>
                    <span className="font-mono font-bold text-white">{estimatedFoodReadyTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-medium">Table Seating Time:</span>
                    <span className="font-mono font-bold text-white">{selectedSlot}</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-medium">Arrival Mode:</span>
                    <span className="font-mono font-bold text-white capitalize">{arrivalMode.replace('-', ' ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-medium">Expected Pickup Window:</span>
                    <span className="font-mono font-bold text-white">{selectedSlot}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Pricing Breakdown Card */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-md space-y-3">
            <h4 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-2">Price Breakdown</h4>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-600 font-medium">
                <span>Subtotal</span>
                <span className="font-mono text-slate-900">${itemsTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600 font-medium">
                <span>Taxes & Service</span>
                <span className="font-mono text-slate-900">${taxesAndFees.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-emerald-600 font-bold">
                <span>Convenience Fee (Waived)</span>
                <span className="font-mono">FREE</span>
              </div>
              {appliedDiscount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Coupon Discount</span>
                  <span className="font-mono">-${appliedDiscount.toFixed(2)}</span>
                </div>
              )}
              <div className="border-t border-slate-200 pt-2 flex justify-between items-center">
                <span className="font-black text-slate-900 text-sm">Total to Pay</span>
                <span className="text-xl font-black font-mono text-indigo-600">${finalTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment Method Stub */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <CreditCard size={18} className="text-indigo-600" />
              <div>
                <p className="font-bold text-slate-900">Apple Pay / One-Touch</p>
                <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                  <ShieldCheck size={11} /> Verified & Encrypted
                </p>
              </div>
            </div>
            <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
              Instant
            </span>
          </div>
        </div>
      </div>

      {/* Step Controls (Back & Confirm Payment) */}
      <div className="pt-4 flex items-center justify-between">
        <button
          onClick={onBack}
          className="px-5 py-3 text-slate-600 hover:bg-slate-100 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5"
        >
          <ArrowLeft size={16} /> Back
        </button>

        <button
          onClick={() => onConfirmOrder(finalTotal)}
          disabled={cartItemEntries.length === 0}
          className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-sm rounded-2xl shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
        >
          <Sparkles size={18} />
          <span>Confirm & Authorize Order (${finalTotal.toFixed(2)})</span>
        </button>
      </div>
    </motion.div>
  )
}
