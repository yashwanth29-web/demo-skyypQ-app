import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Star, Clock, MapPin, Tag, Heart, Sparkles, Zap } from 'lucide-react'

export default function PremiumRestaurantCard({ restaurant, isRouteView = false }) {
  const navigate = useNavigate()
  const [isFavorite, setIsFavorite] = useState(false)

  if (!restaurant) return null

  const priceForTwo = restaurant.priceForTwo || '₹400 for two'
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
      className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-xs hover:shadow-xl transition-all duration-300 cursor-pointer group flex flex-col h-full"
    >
      {/* 1. HERO FOOD PHOTO BANNER (Taller, Edge-to-Edge Swiggy/Zomato style) */}
      <div className="relative h-52 sm:h-56 w-full overflow-hidden bg-slate-100">
        <img
          src={restaurant.image}
          alt={restaurant.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/10 to-transparent" />

        {/* Favorite Button */}
        <button
          onClick={toggleFavorite}
          className={`absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center transition-transform active:scale-90 shadow-md ${
            isFavorite ? 'text-rose-500' : 'text-slate-700 hover:text-slate-900'
          }`}
        >
          <Heart size={18} className={isFavorite ? 'fill-rose-500' : ''} />
        </button>

        {/* Offer Ribbon Overlay */}
        {restaurant.offer && (
          <div className="absolute bottom-3 left-3 bg-gradient-to-r from-orange-600 to-amber-600 text-white text-[11px] font-black px-3 py-1 rounded-xl flex items-center gap-1.5 shadow-md uppercase tracking-wider">
            <Tag size={12} className="text-amber-200" />
            <span>{restaurant.offer}</span>
          </div>
        )}

        {/* Closed Overlay */}
        {isClosed && (
          <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center z-10">
            <span className="bg-white text-slate-950 text-xs font-black uppercase px-4 py-1.5 rounded-full shadow-lg">
              Closed for Pickup
            </span>
          </div>
        )}
      </div>

      {/* 2. CARD CONTENT */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Restaurant Name */}
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-black text-slate-900 text-xl sm:text-2xl group-hover:text-orange-600 transition-colors tracking-tight line-clamp-1">
              {restaurant.name}
            </h3>
            {isVegOnly && (
              <span className="w-4 h-4 border-2 border-emerald-600 flex items-center justify-center p-0.5 rounded-xs shrink-0" title="Pure Veg">
                <span className="w-2 h-2 rounded-full bg-emerald-600 block" />
              </span>
            )}
          </div>

          {/* ⭐ Rating & Preparation Time Directly Below Name */}
          <div className="flex items-center gap-2 text-xs font-black text-slate-900 mt-1 flex-wrap">
            <span className="flex items-center gap-1 bg-emerald-600 text-white font-extrabold px-2 py-0.5 rounded-lg text-xs shadow-2xs">
              <Star size={11} className="fill-white" /> {restaurant.rating || '4.8'}
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-orange-600 font-extrabold flex items-center gap-1">
              <Clock size={13} className="text-orange-500" /> Ready in {prepTime}–{prepTime + 3} mins
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500 font-bold">
              {isRouteView ? `${restaurant.distance} km off route` : `${restaurant.distance} km`}
            </span>
          </div>

          {/* Cuisine Tags */}
          <p className="text-xs font-bold text-slate-500 mt-2 truncate">
            {restaurant.cuisine || 'South Indian • Biryani • Thali'}
          </p>

          {/* ₹400 for two using subtle gray typography */}
          <p className="text-xs font-semibold text-slate-400 mt-1">
            {priceForTwo}
          </p>
        </div>

        {/* 🟠 ONE SINGLE USP PILL */}
        <div className="pt-2 border-t border-slate-100">
          <span className="inline-flex items-center gap-1.5 bg-orange-50 text-orange-700 border border-orange-200 px-3 py-1 rounded-full text-xs font-black shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse shrink-0" />
            <span>Ready before you arrive</span>
          </span>
        </div>
      </div>
    </div>
  )
}
