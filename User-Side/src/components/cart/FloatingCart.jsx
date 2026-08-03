import React from 'react'
import { motion } from 'framer-motion'
import { ShoppingBag, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import useCartStore from '../../store/useCartStore'
import menuData from '../../mock/menu.json'

export default function FloatingCart({ menu }) {
  const navigate = useNavigate()
  const { getTotalItems, getTotalPrice } = useCartStore()

  const totalItems = getTotalItems()
  const activeMenu = menu || menuData
  const totalPrice = getTotalPrice(activeMenu)

  if (totalItems === 0) return null

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      className="fixed bottom-20 left-0 right-0 px-4 z-40 max-w-lg mx-auto md:hidden"
    >
      <button
        onClick={() => navigate('/checkout')}
        className="w-full bg-orange-500 text-white p-4 rounded-2xl shadow-xl shadow-orange-500/30 flex items-center justify-between hover:bg-orange-600 transition-all active:scale-[0.98] group cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 text-white flex items-center justify-center font-bold">
            <ShoppingBag size={20} />
          </div>
          <div className="flex flex-col text-left">
            <span className="font-extrabold text-sm tracking-wide text-white">
              {totalItems} Item{totalItems > 1 ? 's' : ''} added
            </span>
            <span className="text-xs text-orange-100 font-medium">Zero-Wait Guaranteed</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="font-black text-lg font-mono text-white">₹{totalPrice.toFixed(0)}</span>
          <div className="w-8 h-8 rounded-full bg-white/20 group-hover:bg-white text-orange-600 flex items-center justify-center transition-colors">
            <ArrowRight size={16} />
          </div>
        </div>
      </button>
    </motion.div>
  )
}
