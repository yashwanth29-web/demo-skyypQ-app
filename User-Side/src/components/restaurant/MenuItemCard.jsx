import React from 'react'
import { Star, Clock } from 'lucide-react'
import useCartStore from '../../store/useCartStore'

const FoodTypeIcon = ({ type }) => {
  const isVeg = type === 'veg'
  const color = isVeg ? 'border-emerald-600' : 'border-rose-600'
  const innerColor = isVeg ? 'bg-emerald-600' : 'bg-rose-600'
  return (
    <div className={`w-4 h-4 border-2 flex items-center justify-center rounded-xs ${color} shrink-0`}>
      <div className={`w-2 h-2 rounded-full ${innerColor}`} />
    </div>
  )
}

export default function MenuItemCard({ item, idx }) {
  const { cart, addToCart, removeFromCart } = useCartStore()

  const prepTimeText = item.prepTime || '12–15 min'

  return (
    <div className={`py-2.5 flex gap-3 ${idx !== 0 ? 'border-t border-slate-100' : ''} group transition-all w-full`}>
      {/* Info Section */}
      <div className="flex-1 flex flex-col justify-between min-w-0">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <FoodTypeIcon type={item.type || 'veg'} />
            {item.bestseller && (
              <span className="inline-flex items-center gap-1 text-orange-700 bg-orange-50 border border-orange-200 px-1.5 py-0.2 rounded-md text-[9px] font-extrabold uppercase tracking-wide">
                <Star size={9} className="fill-orange-500 text-orange-500" /> Bestseller
              </span>
            )}
          </div>

          <h3 className="font-extrabold text-slate-900 text-sm sm:text-base leading-tight group-hover:text-orange-600 transition-colors line-clamp-1">
            {item.name}
          </h3>

          {/* 💰 PRICE, ⭐️ RATING, & ⏱️ PREP TIME IN THE SAME PROMINENT LINE */}
          <div className="flex items-center gap-1.5 flex-wrap font-black text-slate-900 text-sm py-0.5">
            <span className="text-slate-900 font-black font-mono text-sm">
              ₹{typeof item.price === 'number' ? item.price : item.price}
            </span>

            {item.rating && (
              <span className="flex items-center gap-0.5 text-[11px] font-extrabold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200/60">
                <Star size={10} className="fill-emerald-600 text-emerald-600" /> {item.rating}
              </span>
            )}

            <span className="flex items-center gap-0.5 text-[11px] font-extrabold text-orange-700 bg-orange-50 px-1.5 py-0.2 rounded border border-orange-200">
              <Clock size={10} className="text-orange-600" /> {prepTimeText}
            </span>
          </div>

          <p className="text-[11px] text-slate-500 leading-snug line-clamp-2 pr-1">
            {item.description}
          </p>
        </div>
      </div>

      {/* Image & Interactive Orange CTA Section */}
      <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/60 shadow-2xs">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-20 sm:w-22 z-10">
          {!cart[item.id] ? (
            <button
              onClick={() => addToCart(item)}
              className="w-full bg-white text-orange-600 font-black text-[11px] py-1 rounded-xl shadow-md border border-orange-200 hover:bg-orange-500 hover:text-white transition-all active:scale-95 flex items-center justify-center gap-1 cursor-pointer"
            >
              <span>ADD</span>
              <span className="text-[9px] text-orange-500 group-hover:text-white font-mono">+</span>
            </button>
          ) : (
            <div className="w-full bg-orange-500 text-white font-extrabold text-xs py-1.5 rounded-xl shadow-md flex items-center justify-between px-2.5 border border-orange-400">
              <button
                onClick={() => removeFromCart(item)}
                className="w-6 h-6 flex items-center justify-center hover:bg-orange-600 rounded-md font-mono text-sm leading-none cursor-pointer"
              >
                −
              </button>
              <span className="font-mono font-black text-sm">{cart[item.id]}</span>
              <button
                onClick={() => addToCart(item)}
                className="w-6 h-6 flex items-center justify-center hover:bg-orange-600 rounded-md font-mono text-sm leading-none cursor-pointer"
              >
                +
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
