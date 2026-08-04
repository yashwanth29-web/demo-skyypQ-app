import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Star, Clock, Heart, Tag } from 'lucide-react'

export default function PremiumRestaurantCard({ restaurant, isRouteView = false, compact = false }) {
  const navigate = useNavigate()
  const [isFavorite, setIsFavorite] = useState(false)

  if (!restaurant) return null

  const priceForTwo = restaurant.priceForTwo || '₹300 for two'
  const isVegOnly = restaurant.cuisine?.toLowerCase().includes('vegetarian') || false
  const isClosed = restaurant.status === 'closed'
  const prepTime = restaurant.preparationTime || 12

  const handleCardClick = (e) => {
    e.stopPropagation()
    navigate(`/restaurant/${restaurant.id}`)
  }

  const toggleFavorite = (e) => {
    e.stopPropagation()
    setIsFavorite((prev) => !prev)
  }

  return (
    <div
      onClick={handleCardClick}
      className={`bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-2xs hover:shadow-xl transition-all duration-300 cursor-pointer group flex flex-col h-full ${
        compact ? 'w-60 sm:w-64 lg:w-68 shrink-0' : 'w-full'
      }`}
    >
      {/* 1. HERO FOOD PHOTO BANNER (Swiggy/Zomato Aspect Ratio & Offer Overlay) */}
      <div className="relative h-36 sm:h-40 w-full overflow-hidden bg-slate-100">
        <img
          src={restaurant.image}
          alt={restaurant.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

        {/* Favorite Heart Button */}
        <button
          onClick={toggleFavorite}
          className={`absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center transition-transform active:scale-90 shadow-sm ${
            isFavorite ? 'text-rose-500' : 'text-slate-700 hover:text-slate-900'
          }`}
        >
          <Heart size={14} className={isFavorite ? 'fill-rose-500' : ''} />
        </button>

        {/* Swiggy/Zomato Style Bottom Image Offer Overlay */}
        {restaurant.offer ? (
          <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center gap-1 text-white font-black text-xs sm:text-sm drop-shadow-md truncate">
            <Tag size={13} className="text-amber-400 shrink-0" />
            <span className="truncate uppercase tracking-tight">{restaurant.offer}</span>
          </div>
        ) : (
          <div className="absolute bottom-2 left-2.5 text-white/90 font-bold text-[11px] drop-shadow-sm">
            {priceForTwo}
          </div>
        )}

        {/* Closed Overlay */}
        {isClosed && (
          <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center z-10">
            <span className="bg-white text-slate-950 text-[10px] font-black uppercase px-3 py-1 rounded-full shadow-lg">
              Closed
            </span>
          </div>
        )}
      </div>

      {/* 2. COMPACT CARD CONTENT */}
      <div className="p-3 sm:p-3.5 flex-1 flex flex-col justify-between space-y-1.5">
        <div>
          {/* Restaurant Name */}
          <div className="flex items-center justify-between gap-1.5">
            <h3 className="font-black text-slate-900 text-sm sm:text-base group-hover:text-orange-600 transition-colors tracking-tight truncate">
              {restaurant.name}
            </h3>
            {isVegOnly && (
              <span className="w-3.5 h-3.5 border-2 border-emerald-600 flex items-center justify-center p-0.5 rounded-xs shrink-0" title="Pure Veg">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 block" />
              </span>
            )}
          </div>

          {/* ⭐ Rating & Preparation Time & Distance */}
          <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-slate-800 mt-1 flex-wrap">
            <span className="flex items-center gap-0.5 bg-emerald-600 text-white font-black px-1.5 py-0.5 rounded text-[10px] shadow-2xs">
              <Star size={10} className="fill-white" /> {restaurant.rating || '4.8'}
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-orange-600 font-extrabold flex items-center gap-0.5">
              <Clock size={11} className="text-orange-500" /> {prepTime}–{prepTime + 3} mins
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500 font-bold">
              {isRouteView ? `${restaurant.distance || '1.2'} km off route` : `${restaurant.distance || '1.2'} km`}
            </span>
          </div>

          {/* Cuisine Tags */}
          <p className="text-[11px] font-medium text-slate-500 mt-1 truncate">
            {restaurant.cuisine || 'South Indian • Biryani'}
          </p>
        </div>

        {/* 🟠 Compact Express Pickup Tag */}
        <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px] font-bold">
          <span className="inline-flex items-center gap-1 text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200/80">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse shrink-0" />
            <span>Ready before you arrive</span>
          </span>
          <span className="text-slate-400 font-semibold">{priceForTwo}</span>
        </div>
      </div>
    </div>
  )
}
