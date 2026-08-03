import React from 'react'
import { MapPin, Star, Clock, Tag } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function RestaurantCard({ restaurant, onClick }) {
  const navigate = useNavigate()

  if (!restaurant) return null

  const priceForTwo = restaurant.priceForTwo || '₹400 for two'
  const prepTime = restaurant.preparationTime || 12

  const handleClick = (e) => {
    if (onClick) {
      onClick(e)
    }
    navigate(`/restaurant/${restaurant.id}`)
  }

  return (
    <div
      onClick={handleClick}
      className="bg-white rounded-3xl overflow-hidden shadow-xs border border-slate-200/80 hover:shadow-xl transition-all duration-300 cursor-pointer min-w-[300px] w-[300px] flex-shrink-0 flex flex-col justify-between group"
    >
      {/* Hero Image */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-100">
        <img
          src={restaurant.image}
          alt={restaurant.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />

        {restaurant.offer && (
          <div className="absolute bottom-3 left-3 bg-gradient-to-r from-orange-600 to-amber-600 text-white text-[10px] font-black px-2.5 py-1 rounded-xl flex items-center gap-1 shadow-md uppercase tracking-wider">
            <Tag size={11} className="text-amber-200" />
            <span>{restaurant.offer}</span>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
        <div>
          {/* Restaurant Name */}
          <h3 className="font-black text-slate-900 text-xl group-hover:text-orange-600 transition-colors tracking-tight truncate">
            {restaurant.name}
          </h3>

          {/* ⭐ Rating & Preparation Time Directly Below Name */}
          <div className="flex items-center gap-2 text-xs font-black text-slate-900 mt-1 flex-wrap">
            <span className="flex items-center gap-1 bg-emerald-600 text-white font-extrabold px-2 py-0.5 rounded-lg text-xs shadow-2xs">
              <Star size={11} className="fill-white" /> {restaurant.rating || '4.8'}
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-orange-600 font-extrabold flex items-center gap-1">
              <Clock size={12} className="text-orange-500" /> Ready in {prepTime} mins
            </span>
          </div>

          {/* Cuisines Tag */}
          <p className="text-xs font-bold text-slate-500 mt-1.5 truncate">
            {restaurant.cuisine}
          </p>

          {/* Subtle gray price for two */}
          <p className="text-xs font-semibold text-slate-400 mt-1">
            {priceForTwo}
          </p>
        </div>

        {/* 🟠 ONE SINGLE USP PILL */}
        <div className="pt-2 border-t border-slate-100">
          <span className="inline-flex items-center gap-1 bg-orange-50 text-orange-700 border border-orange-200 px-2.5 py-0.5 rounded-full text-[11px] font-black">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse shrink-0" />
            <span>Ready before you arrive</span>
          </span>
        </div>
      </div>
    </div>
  )
}
