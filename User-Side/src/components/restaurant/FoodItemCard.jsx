import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Star, Plus, Check, ShoppingBag, Utensils, Clock, Zap } from 'lucide-react'
import useCartStore from '../../store/useCartStore'
import { motion } from 'framer-motion'

export default function FoodItemCard({ item, restaurantName = 'Popular Kitchen' }) {
  const navigate = useNavigate()
  const addToCart = useCartStore((state) => state.addToCart)
  const cart = useCartStore((state) => state.cart)

  if (!item) return null

  const isVeg = item.type === 'veg'
  const isAdded = Array.isArray(cart) ? cart.some((c) => c.id === item.id) : Boolean(cart && cart[item.id])
  const prepTimeText = item.prepTime || '12–15 min'

  const handleAdd = (e) => {
    e.stopPropagation()
    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      restaurantId: item.restaurantId || 'r1',
      restaurantName: restaurantName
    })
  }

  const handleCardClick = () => {
    navigate(`/restaurant/${item.restaurantId || 'r1'}`)
  }

  return (
    <motion.div
      whileHover={{ y: -2 }}
      onClick={handleCardClick}
      className="bg-white rounded-3xl p-3.5 border border-slate-100 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer flex gap-4 items-center group"
    >
      {/* Dish Image */}
      <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden shrink-0 bg-slate-100">
        <img
          src={item.image || 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&fit=crop'}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        {/* Veg/Non-Veg Badge */}
        <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-xs p-1 rounded-md shadow-xs">
          {isVeg ? (
            <span className="w-3.5 h-3.5 border border-emerald-600 flex items-center justify-center p-0.5 rounded-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 block" />
            </span>
          ) : (
            <span className="w-3.5 h-3.5 border border-rose-600 flex items-center justify-center p-0.5 rounded-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-600 block" />
            </span>
          )}
        </div>
      </div>

      {/* Info & CTA */}
      <div className="flex-1 min-w-0 flex flex-col justify-between h-full py-0.5">
        <div>
          <div className="flex items-center justify-between gap-2">
            <h4 className="font-extrabold text-slate-900 text-base truncate group-hover:text-orange-600 transition-colors">
              {item.name}
            </h4>
            <div className="flex items-center gap-1 text-xs font-bold bg-amber-50 text-amber-800 px-2 py-0.5 rounded-lg border border-amber-200/60 shrink-0">
              <Star size={12} className="text-amber-500 fill-amber-500" />
              <span>{item.rating || '4.8'}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-xs text-orange-600 font-bold truncate flex items-center gap-1">
              <Utensils size={12} />
              <span>{restaurantName}</span>
            </p>
            <span className="text-slate-300">•</span>
            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
              <Clock size={10} className="text-amber-600" /> {prepTimeText} prep
            </span>
          </div>

          <p className="text-xs text-slate-400 mt-1 line-clamp-1">
            {item.description || 'Prepared fresh with premium ingredients'}
          </p>
        </div>

        <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100">
          <span className="text-base font-black text-slate-900">
            ₹{typeof item.price === 'number' ? item.price : item.price}
          </span>

          <button
            onClick={handleAdd}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              isAdded
                ? 'bg-emerald-600 text-white'
                : 'bg-orange-50 hover:bg-orange-500 text-orange-600 hover:text-white border border-orange-200 hover:border-orange-500'
            }`}
          >
            {isAdded ? (
              <>
                <Check size={14} />
                <span>Added</span>
              </>
            ) : (
              <>
                <Plus size={14} />
                <span>ADD</span>
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  )
}
