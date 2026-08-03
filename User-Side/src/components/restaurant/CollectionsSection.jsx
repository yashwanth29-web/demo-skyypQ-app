import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Percent, Zap, Star, Utensils } from 'lucide-react'

const COLLECTIONS = [
  {
    id: 'trending',
    title: 'Top Rated Restaurants',
    subtitle: 'Popular places with ratings above 4.5',
    icon: Star,
    bgClass: 'bg-amber-500/10 text-amber-800 border-amber-200'
  },
  {
    id: 'offers',
    title: 'Best Deals Near You',
    subtitle: 'Flat discounts & special combo deals',
    icon: Percent,
    bgClass: 'bg-emerald-500/10 text-emerald-800 border-emerald-200'
  },
  {
    id: 'fast',
    title: 'Ready in Under 15 Minutes',
    subtitle: 'Quick prep & instant zero-wait pickup',
    icon: Zap,
    bgClass: 'bg-blue-500/10 text-blue-800 border-blue-200'
  },
  {
    id: 'recommended',
    title: 'Meals Under ₹250',
    subtitle: 'Budget-friendly delicious meals',
    icon: Utensils,
    bgClass: 'bg-orange-500/10 text-orange-800 border-orange-200'
  }
]

export default function CollectionsSection({ onSelectCollection, selectedId }) {
  const navigate = useNavigate()

  const handleCardClick = (item) => {
    if (onSelectCollection) {
      onSelectCollection(item.id)
    }
    navigate(
      `/discovery?collection=${item.id}&title=${encodeURIComponent(item.title)}&desc=${encodeURIComponent(item.subtitle)}`
    )
  }

  return (
    <div className="my-6">
      <div className="mb-3 px-1">
        <h2 className="text-lg font-black text-slate-900 tracking-tight">
          Handpicked Collections
        </h2>
        <p className="text-xs text-slate-500 font-medium">Explore curated food spots for quick takeaway</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {COLLECTIONS.map((item) => {
          const Icon = item.icon
          const isSelected = selectedId === item.id

          return (
            <button
              key={item.id}
              onClick={() => handleCardClick(item)}
              className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${item.bgClass} ${
                isSelected 
                  ? 'ring-2 ring-orange-500 font-semibold shadow-md' 
                  : 'hover:border-slate-300 hover:shadow-xs'
              }`}
            >
              <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-2xs mb-2 border border-slate-100">
                <Icon size={17} className="text-orange-500" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-sm leading-snug">{item.title}</h3>
              <p className="text-slate-500 text-xs font-medium mt-0.5 line-clamp-1">{item.subtitle}</p>
            </button>
          )
        })}
      </div>
    </div>
  )
}
