import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Percent, Zap, Star, Utensils, ChevronRight, Sparkles } from 'lucide-react'

const COLLECTIONS = [
  {
    id: 'trending',
    title: 'Top Rated Spots',
    subtitle: 'Places rated 4.7+ • Iconic Dining',
    tag: '12 Places',
    icon: Star,
    bgImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop&q=80',
    gradient: 'from-amber-950/80 via-amber-900/60 to-black/70',
    badgeBg: 'bg-amber-500 text-white border-amber-300/30'
  },
  {
    id: 'offers',
    title: 'Best Deals Near You',
    subtitle: 'Flat discounts & special combos',
    tag: 'Up to 50% OFF',
    icon: Percent,
    bgImage: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80',
    gradient: 'from-emerald-950/80 via-teal-900/60 to-black/70',
    badgeBg: 'bg-emerald-500 text-white border-emerald-300/30'
  },
  {
    id: 'fast',
    title: 'Ready in <15 Mins',
    subtitle: 'Instant zero-wait takeaway',
    tag: 'Express Pickup',
    icon: Zap,
    bgImage: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&auto=format&fit=crop&q=80',
    gradient: 'from-blue-950/80 via-indigo-900/60 to-black/70',
    badgeBg: 'bg-blue-500 text-white border-blue-300/30'
  },
  {
    id: 'recommended',
    title: 'Meals Under ₹250',
    subtitle: 'Budget-friendly delicious bites',
    tag: 'Pocket Friendly',
    icon: Utensils,
    bgImage: 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?w=600&auto=format&fit=crop&q=80',
    gradient: 'from-orange-950/80 via-rose-900/60 to-black/70',
    badgeBg: 'bg-orange-500 text-white border-orange-300/30'
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
    <div className="my-8">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Sparkles size={22} className="text-orange-500 fill-orange-500" />
            <span>Handpicked Collections</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Zomato-style curated food spots for quick takeaway
          </p>
        </div>
      </div>

      {/* Zomato-Style Cards Horizontal Scrollable Row (1 Single Row Side-wise Scroll) */}
      <div className="flex items-center gap-3.5 sm:gap-5 overflow-x-auto hide-scrollbar pb-3 pt-1 -mx-4 px-4 sm:mx-0 sm:px-0 scroll-smooth">
        {COLLECTIONS.map((item) => {
          const Icon = item.icon
          const isSelected = selectedId === item.id

          return (
            <button
              key={item.id}
              onClick={() => handleCardClick(item)}
              className={`relative h-44 sm:h-52 w-48 sm:w-60 lg:w-64 shrink-0 rounded-3xl overflow-hidden text-left transition-all duration-300 group cursor-pointer border shadow-sm hover:shadow-xl hover:-translate-y-1 ${
                isSelected ? 'ring-4 ring-orange-500 border-orange-500 shadow-xl' : 'border-slate-200/80'
              }`}
            >
              {/* Background Image */}
              <img
                src={item.bgImage}
                alt={item.title}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />

              {/* Gradient Overlay */}
              <div className={`absolute inset-0 bg-gradient-to-t ${item.gradient} group-hover:opacity-90 transition-opacity`} />

              {/* Card Contents */}
              <div className="relative z-10 h-full p-4 flex flex-col justify-between text-white">
                {/* Top Badge Row */}
                <div className="flex items-center justify-between">
                  <div className={`w-8 h-8 rounded-xl ${item.badgeBg} flex items-center justify-center shadow-md border backdrop-blur-xs`}>
                    <Icon size={16} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/30">
                    {item.tag}
                  </span>
                </div>

                {/* Bottom Title & Subtitle Row */}
                <div className="space-y-1">
                  <h3 className="font-black text-white text-base sm:text-lg leading-snug drop-shadow-sm flex items-center justify-between group-hover:text-amber-300 transition-colors">
                    <span>{item.title}</span>
                    <ChevronRight size={16} className="text-white/80 group-hover:translate-x-1 transition-transform" />
                  </h3>
                  <p className="text-slate-200 text-xs font-medium line-clamp-1 drop-shadow-xs">
                    {item.subtitle}
                  </p>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
