import React, { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import {
  ShoppingBag, Sparkles, Car, CheckCircle2, ArrowRight, Gift,
  Check, Lock, Unlock, X, ChevronRight, Star, Tag, Award,
  Flame, Zap, ShieldCheck, Plus
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import useCartStore from '../../store/useCartStore'
import menuData from '../../mock/menu.json'

export default function RightUtilityPanel() {
  const navigate = useNavigate()
  const { cart, getTotalItems, removeFromCart, addToCart } = useCartStore()

  const totalItems = getTotalItems()

  // Calculate real-time subtotal from cart items
  const subtotal = Object.entries(cart).reduce((sum, [itemId, qty]) => {
    const item = menuData.find((m) => m.id === itemId)
    return sum + (item ? item.price * qty : 0)
  }, 0)

  const TARGET_GOAL = 25.0
  const isUnlocked = subtotal >= TARGET_GOAL
  const discountAmount = isUnlocked ? subtotal * 0.20 : 0
  const finalTotal = Math.max(0, subtotal - discountAmount)

  // Track unlock modal trigger state
  const [showUnlockModal, setShowUnlockModal] = useState(false)
  const [showRewardsModal, setShowRewardsModal] = useState(false)
  const [showGuaranteeModal, setShowGuaranteeModal] = useState(false)
  const [hasTriggeredUnlock, setHasTriggeredUnlock] = useState(false)
  const [wasRelocked, setWasRelocked] = useState(false)

  const prevSubtotalRef = useRef(subtotal)

  useEffect(() => {
    const prevSub = prevSubtotalRef.current

    // Trigger unlock modal when subtotal reaches or crosses $25 for the first time
    if (subtotal >= TARGET_GOAL && prevSub < TARGET_GOAL) {
      setShowUnlockModal(true)
      setHasTriggeredUnlock(true)
      setWasRelocked(false)
    }

    // Handle relock state when subtotal drops back below $25
    if (subtotal < TARGET_GOAL && prevSub >= TARGET_GOAL) {
      setHasTriggeredUnlock(false)
      setShowUnlockModal(false)
      setWasRelocked(true)
    }

    prevSubtotalRef.current = subtotal
  }, [subtotal])

  // Dynamic progress text computation
  const remainingAmount = Math.max(0, TARGET_GOAL - subtotal).toFixed(2)

  let progressText = ''
  if (wasRelocked && subtotal < TARGET_GOAL) {
    progressText = `Your rewards are no longer unlocked. Add $${remainingAmount} more to unlock them again.`
  } else if (subtotal < 8.0) {
    progressText = `Add $${remainingAmount} more to unlock Premium Valet + 20% OFF`
  } else if (subtotal < 20.0) {
    progressText = `Only $${remainingAmount} left to unlock your rewards!`
  } else if (subtotal < TARGET_GOAL) {
    progressText = `Almost there! Add just $${remainingAmount} more.`
  } else {
    progressText = '🎉 Rewards Unlocked! 20% OFF Applied + FREE Valet Included'
  }

  const progressPercentage = Math.min(100, (subtotal / TARGET_GOAL) * 100)

  return (
    <aside className="w-full space-y-6 sticky top-24">
      {/* ========================================================= */}
      {/* 1. ORDER BASKET CARD (Top Priority) */}
      {/* ========================================================= */}
      <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200/80 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
            <ShoppingBag size={15} className="text-rose-500" /> Your Order Basket
          </h4>
          <span className="text-[10px] font-extrabold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
            {totalItems} {totalItems === 1 ? 'Item' : 'Items'}
          </span>
        </div>

        {totalItems === 0 ? (
          <div className="text-center py-6 text-slate-400 space-y-1.5">
            <ShoppingBag size={28} className="mx-auto opacity-30 text-slate-400" />
            <p className="text-xs font-bold text-slate-600">Basket is empty</p>
            <p className="text-[10px] text-slate-400">Add takeaway dishes to preview order</p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Cart Items List Preview */}
            <div className="space-y-2 max-h-44 overflow-y-auto pr-1 hide-scrollbar">
              {Object.entries(cart).map(([itemId, qty]) => {
                const item = menuData.find((m) => m.id === itemId)
                if (!item) return null
                return (
                  <div key={itemId} className="flex items-center justify-between text-xs py-1 border-b border-slate-50">
                    <div className="min-w-0 flex-1 pr-2">
                      <p className="font-bold text-slate-800 truncate">{item.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">${item.price.toFixed(2)} × {qty}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => removeFromCart({ id: itemId })}
                        className="w-5 h-5 rounded-md bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-black hover:bg-rose-50 hover:text-rose-600"
                      >
                        -
                      </button>
                      <span className="font-mono text-xs font-bold w-4 text-center">{qty}</span>
                      <button
                        onClick={() => addToCart({ id: itemId, price: item.price, restaurantId: 'r1' })}
                        className="w-5 h-5 rounded-md bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-black hover:bg-indigo-50 hover:text-indigo-600"
                      >
                        +
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Calculations Breakdown */}
            <div className="pt-2 border-t border-slate-100 space-y-1.5">
              <div className="flex justify-between items-center text-xs font-bold text-slate-600">
                <span>Basket Subtotal</span>
                <span className="font-mono">${subtotal.toFixed(2)}</span>
              </div>

              {isUnlocked && (
                <div className="flex justify-between items-center text-xs font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-100">
                  <span className="flex items-center gap-1">
                    <Tag size={12} /> 20% Unlocked Discount
                  </span>
                  <span className="font-mono">-${discountAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between items-center text-sm font-black text-slate-900 pt-1.5 border-t border-slate-100">
                <span>Final Total</span>
                <span className="font-mono text-base text-indigo-600">${finalTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={() => navigate('/checkout')}
          disabled={totalItems === 0}
          className={`w-full py-3 rounded-2xl font-extrabold text-xs transition-all flex items-center justify-center gap-2 shadow-lg ${
            totalItems > 0
              ? 'bg-gradient-to-r from-indigo-600 to-rose-600 text-white hover:from-indigo-700 hover:to-rose-700 shadow-indigo-500/20 active:scale-95 cursor-pointer'
              : 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
          }`}
        >
          Proceed to Checkout <ArrowRight size={14} />
        </button>
      </div>

      {/* ========================================================= */}
      {/* 2. SAVINGS PROGRESS CARD (Dynamic $0.00 / $25.00 Goal) */}
      {/* ========================================================= */}
      <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200/80 space-y-3 relative overflow-hidden">
        {!isUnlocked ? (
          /* PRE-UNLOCK PROGRESS STATE */
          <div className="space-y-2.5">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="flex items-center gap-1.5 text-slate-800">
                <Sparkles size={14} className="text-indigo-600" /> Savings Progress
              </span>
              <span className="text-indigo-600 font-mono font-black">
                ${subtotal.toFixed(2)} / ${TARGET_GOAL.toFixed(2)}
              </span>
            </div>

            <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">
              {progressText}
            </p>

            {/* Smooth Animated Gradient Progress Bar */}
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden relative shadow-inner">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-rose-500 rounded-full relative"
              >
                {/* Floating Sparkles when > 75% */}
                {progressPercentage > 75 && (
                  <span className="absolute right-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full animate-ping" />
                )}
              </motion.div>
            </div>
          </div>
        ) : (
          /* POST-UNLOCK SUCCESS STATE */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-3 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent p-1 rounded-2xl"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-emerald-700 flex items-center gap-1.5">
                <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/30">
                  <Check size={14} />
                </div>
                Rewards Unlocked
              </span>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
                Applied Automatically
              </span>
            </div>

            <div className="bg-white p-3 rounded-2xl border border-emerald-200/80 shadow-sm space-y-2">
              <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                <span className="flex items-center gap-1">
                  <Tag size={12} className="text-emerald-500" /> 20% OFF Entire Order
                </span>
                <span className="font-mono text-emerald-600 font-black">-${discountAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-xs font-bold text-slate-800 pt-1.5 border-t border-slate-100">
                <span className="flex items-center gap-1">
                  <Car size={12} className="text-amber-500" /> FREE Premium Valet
                </span>
                <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  INCLUDED
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* ========================================================= */}
      {/* 3. VALET SERVICE CARD (Hidden until cart has >= 1 item) */}
      {/* ========================================================= */}
      <AnimatePresence>
        {totalItems > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            transition={{ type: 'spring', stiffness: 200, damping: 22 }}
            className={`p-5 rounded-3xl shadow-xl relative overflow-hidden border transition-all duration-500 ${
              isUnlocked
                ? 'bg-slate-900 border-emerald-500/50 shadow-emerald-500/10'
                : 'bg-slate-900 border-amber-500/30'
            }`}
          >
            {/* Soft Ambient Radial Glow */}
            <div className={`absolute -right-10 -top-10 w-32 h-32 rounded-full blur-2xl pointer-events-none ${
              isUnlocked ? 'bg-emerald-500/20' : 'bg-amber-500/15'
            }`} />

            <div className="space-y-3 relative z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <motion.div
                    animate={{ x: isUnlocked ? [0, 4, 0] : 0 }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shadow-md ${
                      isUnlocked
                        ? 'bg-emerald-500/20 border border-emerald-400/30 text-emerald-400'
                        : 'bg-amber-400/20 border border-amber-400/30 text-amber-300'
                    }`}
                  >
                    <Car size={18} />
                  </motion.div>
                  <h4 className="text-xs font-black text-white">
                    {isUnlocked ? 'Premium Valet Parking Unlocked' : 'Unlock Premium Valet Parking'}
                  </h4>
                </div>

                {isUnlocked ? (
                  <span className="text-[9px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                    ✅ FREE VALET UNLOCKED
                  </span>
                ) : (
                  <span className="text-[9px] font-bold text-amber-300 bg-amber-400/10 border border-amber-400/20 px-2.5 py-0.5 rounded-full">
                    🅿️ 14 Slots Available
                  </span>
                )}
              </div>

              <p className="text-[10px] text-slate-300 font-medium leading-relaxed">
                {isUnlocked
                  ? 'Enjoy complimentary valet parking with this order. Our watchman will park & retrieve your car at the gate.'
                  : `Add $${remainingAmount} more to your cart to unlock complimentary valet parking.`}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* 4. UNIFIED VIP GOLD PASS & CHEF PERKS CARD */}
      {/* ========================================================= */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 text-white rounded-3xl p-5 border border-amber-500/30 shadow-xl space-y-5 relative overflow-hidden">
        {/* Ambient Gold Glow */}
        <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />

        {/* Top Header: Gold VIP Member & Points */}
        <div
          onClick={() => setShowRewardsModal(true)}
          className="flex items-center justify-between pb-3 border-b border-white/10 cursor-pointer group hover:bg-white/5 p-2 -mx-2 rounded-2xl transition-colors"
        >
          <div className="space-y-1.5 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-black uppercase tracking-widest text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/20">
                Gold VIP Member
              </span>
              <span className="text-[10px] font-bold text-slate-400 font-mono">250 / 500 Pts</span>
            </div>
            <h5 className="text-xs font-black text-white truncate flex items-center gap-1 group-hover:text-amber-300 transition-colors">
              Route Rewards Dashboard <ChevronRight size={14} />
            </h5>
          </div>

          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-500 text-slate-950 flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/20 font-black">
            <Gift size={22} />
          </div>
        </div>

        {/* Middle Section: Chef's Daily Pick with HD Image */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-rose-400 bg-rose-500/20 px-2.5 py-0.5 rounded-full border border-rose-500/30 flex items-center gap-1">
              <Flame size={12} className="fill-rose-400 text-rose-400" /> Chef's Daily Perk
            </span>
            <span className="text-[10px] font-bold text-amber-300 flex items-center gap-0.5">
              <Star size={10} className="fill-amber-400 text-amber-400" /> 4.9 (512)
            </span>
          </div>

          <div className="bg-white/5 p-3 rounded-2xl border border-white/10 space-y-2.5">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl overflow-hidden shrink-0 border border-white/20 bg-slate-800 shadow-md">
                <img
                  src="https://images.unsplash.com/photo-1576107232684-1279f390859f?w=400&auto=format&fit=crop&q=80"
                  alt="Truffle Parmesan Fries"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <h5 className="text-xs font-black text-white truncate">Truffle Parmesan Fries</h5>
                <p className="text-[10px] text-slate-300 font-medium line-clamp-1">Tossed in truffle oil & parmesan</p>
                <div className="flex justify-between items-center pt-1">
                  <span className="font-mono font-black text-amber-300 text-xs">₹120</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      addToCart({ id: 'm3', price: 120, restaurantId: 'r1' })
                    }}
                    className="px-3 py-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-[10px] rounded-xl shadow-md flex items-center gap-1 active:scale-95 transition-all cursor-pointer"
                  >
                    <Plus size={12} /> Add to Order
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Live Service Metrics Bar */}
        <div className="grid grid-cols-2 gap-2 text-[10px] font-bold text-slate-300 pt-1">
          <div className="p-2.5 bg-white/5 rounded-xl border border-white/10 flex items-center gap-1.5">
            <Zap size={13} className="text-amber-400 shrink-0" />
            <span>12m Avg Prep</span>
          </div>
          <div className="p-2.5 bg-white/5 rounded-xl border border-white/10 flex items-center gap-1.5">
            <Car size={13} className="text-indigo-400 shrink-0" />
            <span>Tracked Valet</span>
          </div>
        </div>

        {/* Bottom Footer: Service Guarantee */}
        <div
          onClick={() => setShowGuaranteeModal(true)}
          className="pt-3 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-300 font-bold cursor-pointer hover:text-white transition-colors"
        >
          <span className="flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-emerald-400" /> 100% On-Time & Valet Guarantee
          </span>
          <span className="text-amber-400 text-[9px] font-black underline">Details</span>
        </div>
      </div>

      {/* 5. LIVE CONCIERGE HELP CARD */}
      <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-200/80 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold shrink-0">
            💬
          </div>
          <div className="min-w-0">
            <h5 className="text-xs font-black text-slate-900 truncate">24/7 Route Concierge</h5>
            <p className="text-[10px] text-slate-400 font-medium truncate">Instant live help for your takeaway</p>
          </div>
        </div>
        <button
          onClick={() => setShowGuaranteeModal(true)}
          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-[10px] font-black rounded-xl transition-colors shrink-0"
        >
          Chat
        </button>
      </div>

      {/* ========================================================= */}
      {/* 5. REWARD UNLOCK EXPERIENCE MODAL (PORTAL TO DOCUMENT.BODY) */}
      {/* ========================================================= */}
      {createPortal(
        <AnimatePresence>
          {showUnlockModal && (
            <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4">
              {/* Dimmed Blurred Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowUnlockModal(false)}
                className="absolute inset-0 bg-slate-950/85 backdrop-blur-md z-0"
              />

              {/* 💥 CHAMPIONSHIP VICTORY PARTY POPPER CANNON BLAST (360° RADIAL CONFETTI EXPLOSION) */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center z-10">
                {Array.from({ length: 90 }).map((_, i) => {
                  const angle = (i / 90) * 360 + (Math.random() * 15 - 7.5)
                  const distance = Math.random() * 550 + 200
                  const targetX = Math.cos((angle * Math.PI) / 180) * distance
                  const targetY = Math.sin((angle * Math.PI) / 180) * distance + 250 // gravity drop
                  const colors = ['#f59e0b', '#ef4444', '#10b981', '#6366f1', '#ec4899', '#8b5cf6', '#3b82f6', '#eab308']
                  const color = colors[i % colors.length]
                  const isEmoji = i % 12 === 0
                  const isRibbon = i % 4 === 0

                  return (
                    <motion.div
                      key={i}
                      initial={{
                        x: 0,
                        y: 0,
                        opacity: 1,
                        scale: Math.random() * 0.7 + 0.6,
                        rotate: 0
                      }}
                      animate={{
                        x: targetX,
                        y: targetY,
                        opacity: [1, 1, 0.9, 0],
                        scale: [0.6, 1.3, 0.9, 0.4],
                        rotate: Math.random() * 1080 - 540
                      }}
                      transition={{
                        duration: Math.random() * 1.8 + 1.8,
                        ease: [0.15, 0.85, 0.35, 1.2],
                        delay: Math.random() * 0.15
                      }}
                      className="absolute font-bold select-none"
                      style={{ color }}
                    >
                      {isEmoji ? (
                        <span className="text-lg">{['🎉', '⭐', '✨', '🏆', '🎊'][i % 5]}</span>
                      ) : isRibbon ? (
                        <div
                          className="w-2.5 h-6 rounded-full shadow-lg"
                          style={{ backgroundColor: color }}
                        />
                      ) : (
                        <div
                          className="w-3 h-3 rounded-sm shadow-md"
                          style={{ backgroundColor: color }}
                        />
                      )}
                    </motion.div>
                  )
                })}
              </div>

              {/* Luxury Spring-Animated Coupon Voucher Paper */}
              <motion.div
                initial={{ opacity: 0, y: -180, scale: 0.8, rotate: -3 }}
                animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, y: 50, scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 220, damping: 18 }}
                className="relative w-full max-w-sm bg-gradient-to-b from-amber-500 via-amber-400 to-yellow-500 rounded-3xl p-1 shadow-[0_25px_60px_rgba(0,0,0,0.75)] z-20"
              >
                {/* Inner Luxury Card Content */}
                <div className="bg-slate-950 text-white rounded-[1.35rem] p-6 space-y-5 relative overflow-hidden border border-amber-400/30 text-center">
                  {/* Close Dismiss Button */}
                  <button
                    onClick={() => setShowUnlockModal(false)}
                    className="absolute top-3 right-3 text-slate-400 hover:text-white p-1 rounded-full bg-slate-900 border border-slate-800 transition-colors"
                  >
                    <X size={16} />
                  </button>

                  {/* Top Glowing Trophy Icon */}
                  <div className="w-16 h-16 rounded-3xl bg-amber-400/20 border border-amber-400/40 text-amber-300 mx-auto flex items-center justify-center shadow-xl shadow-amber-500/20">
                    <Award size={36} className="animate-bounce" />
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">
                      🎉 CONGRATULATIONS!
                    </span>
                    <h3 className="text-xl font-black tracking-tight text-white pt-2">
                      Rewards Unlocked!
                    </h3>
                    <p className="text-xs text-slate-400 font-medium">
                      Your basket reached <span className="font-mono text-amber-300 font-bold">₹250+</span>
                    </p>
                  </div>

                  {/* Torn Ticket Coupon Voucher */}
                  <div className="bg-gradient-to-r from-amber-500/20 via-slate-900 to-amber-500/20 border border-dashed border-amber-400/50 p-4 rounded-2xl space-y-2 text-left relative">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                      <span className="text-xs font-black text-white">20% OFF Entire Order</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                      <span className="text-xs font-black text-white">FREE Premium Valet Parking</span>
                    </div>
                    <p className="text-[10px] text-amber-300 font-mono text-center pt-1 border-t border-amber-400/20">
                      Status: Applied Automatically
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2 pt-2">
                    <button
                      onClick={() => {
                        setShowUnlockModal(false)
                        navigate('/checkout')
                      }}
                      className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
                    >
                      Checkout Now <ArrowRight size={14} />
                    </button>

                    <button
                      onClick={() => setShowUnlockModal(false)}
                      className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 font-extrabold text-xs rounded-xl transition-all border border-slate-800 cursor-pointer"
                    >
                      Continue Shopping
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* ========================================================= */}
      {/* 6. REWARDS DASHBOARD MODAL */}
      {/* ========================================================= */}
      {createPortal(
        <AnimatePresence>
          {showRewardsModal && (
            <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowRewardsModal(false)}
                className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-md bg-slate-900 text-white rounded-3xl p-6 border border-amber-500/30 shadow-2xl z-10 space-y-4"
              >
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold">
                      <Gift size={18} />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-white">Route Rewards Dashboard</h3>
                      <p className="text-[10px] text-slate-400">Balance: 250 Route Points</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowRewardsModal(false)}
                    className="p-1 text-slate-400 hover:text-white rounded-full bg-slate-800"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="space-y-2.5">
                  <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex justify-between items-center">
                    <div>
                      <p className="text-xs font-bold text-white">₹100 Off Next Takeaway Order</p>
                      <p className="text-[10px] text-amber-400 font-mono">200 Points Required</p>
                    </div>
                    <button
                      onClick={() => setShowRewardsModal(false)}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all cursor-pointer"
                    >
                      Redeem
                    </button>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex justify-between items-center">
                    <div>
                      <p className="text-xs font-bold text-white">Free Artisan Espresso Pass</p>
                      <p className="text-[10px] text-amber-400 font-mono">300 Points Required</p>
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-800 px-2.5 py-1 rounded-lg">
                      Need 50 pts
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setShowRewardsModal(false)}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Close
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* ========================================================= */}
      {/* 7. SERVICE GUARANTEE MODAL */}
      {/* ========================================================= */}
      {createPortal(
        <AnimatePresence>
          {showGuaranteeModal && (
            <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowGuaranteeModal(false)}
                className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-md bg-slate-900 text-white rounded-3xl p-6 border border-emerald-500/30 shadow-2xl z-10 space-y-4"
              >
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                      <ShieldCheck size={18} />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-white">SkYppQ Service Guarantees</h3>
                      <p className="text-[10px] text-emerald-400">100% On-Time & Zero Gate Delay</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowGuaranteeModal(false)}
                    className="p-1 text-slate-400 hover:text-white rounded-full bg-slate-800"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
                    <p className="font-bold text-white flex items-center gap-1.5 text-emerald-400">
                      <Zap size={14} /> 12m Average Counter Prep
                    </p>
                    <p className="text-[11px] text-slate-300">
                      Restaurant partners start cooking the exact moment you place your order so it's ready when you reach the counter.
                    </p>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
                    <p className="font-bold text-white flex items-center gap-1.5 text-amber-400">
                      <Car size={14} /> Live Tracked Valet Parking
                    </p>
                    <p className="text-[11px] text-slate-300">
                      Duty watchmen receive real-time alerts when you click "Request Vehicle" and bring your car to Exit Gate 1.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setShowGuaranteeModal(false)}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Got it!
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </aside>
  )
}
