import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, ChevronRight, Flame } from 'lucide-react'

const DISCOVERY_CAROUSEL_ITEMS = [
  {
    id: 'trending',
    title: 'Trending Today',
    subtitle: 'Trending near you',
    badge: '🔥 HOT NEARBY',
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&q=80&w=600&h=400',
    query: 'biryani',
    collection: 'trending'
  },
  {
    id: 'biryani',
    title: 'Biryani Specials',
    subtitle: 'Starts from ₹199',
    badge: '🍗 BESTSELLERS',
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&q=80&w=600&h=400',
    query: 'biryani',
    collection: 'recommended'
  },
  {
    id: 'pizza',
    title: 'Pizza Deals',
    subtitle: 'Best sellers nearby',
    badge: '🍕 CHEESE BURST',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=600&h=400',
    query: 'pizza',
    collection: 'offers'
  },
  {
    id: 'budget',
    title: 'Meals Under ₹200',
    subtitle: 'Pocket friendly feasts',
    badge: '🥘 UNDER ₹200',
    image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&q=80&w=600&h=400',
    query: 'dosa',
    collection: 'offers'
  },
  {
    id: 'fast-prep',
    title: 'Ready in 10 Minutes',
    subtitle: 'Ready before you arrive',
    badge: '⚡ 10 MIN PREP',
    image: 'https://images.unsplash.com/photo-1561651823-34feb02250e4?auto=format&fit=crop&q=80&w=600&h=400',
    query: 'shawarma',
    collection: 'fast'
  },
  {
    id: 'burger',
    title: 'Burger Combos',
    subtitle: 'Juicy flame-grilled burgers',
    badge: '🍔 FLAME GRILLED',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=600&h=400',
    query: 'burger',
    collection: 'recommended'
  },
  {
    id: 'beverages',
    title: 'Cold Drinks & Shakes',
    subtitle: 'Chilled refreshing beverages',
    badge: '🥤 CHILLED SHAKES',
    image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80&w=600&h=400',
    query: 'coffee',
    collection: 'recommended'
  },
  {
    id: 'desserts',
    title: 'Desserts & Sweets',
    subtitle: 'Perfect sweet cravings',
    badge: '🍰 SWEET CRAVINGS',
    image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&q=80&w=600&h=400',
    query: 'ice cream',
    collection: 'recommended'
  }
]

export default function FoodDiscoveryCarousel() {
  const navigate = useNavigate()

  const handleCardClick = (item) => {
    navigate(`/discovery?collection=${item.collection}&search=${encodeURIComponent(item.query)}`)
  }

  return (
    <section className="space-y-3.5 my-6">
      {/* Section Header */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Sparkles size={18} className="text-orange-500" />
            <span>Discover Food Collections</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium">Curated deals and instant pickup favorites</p>
        </div>

        <span className="text-xs font-bold text-orange-600 flex items-center gap-0.5 hover:underline cursor-pointer">
          Swipe <ChevronRight size={14} />
        </span>
      </div>

      {/* Horizontal Scrollable Carousel Container */}
      <div className="flex gap-4 sm:gap-5 overflow-x-auto hide-scrollbar pb-2 pt-1 px-1">
        {DISCOVERY_CAROUSEL_ITEMS.map((item) => (
          <div
            key={item.id}
            onClick={() => handleCardClick(item)}
            className="w-56 sm:w-64 shrink-0 bg-white rounded-3xl overflow-hidden border border-slate-200/90 shadow-2xs hover:shadow-xl transition-all duration-300 cursor-pointer group flex flex-col justify-between"
          >
            {/* Real Food Image Container */}
            <div className="relative h-36 sm:h-40 w-full overflow-hidden bg-slate-100">
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/15 to-transparent" />

              {/* Real-time Badge Tag */}
              <div className="absolute top-2.5 left-2.5 bg-slate-950/80 backdrop-blur-xs text-amber-300 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-amber-400/30 tracking-wide uppercase">
                {item.badge}
              </div>
            </div>

            {/* Card Information Header */}
            <div className="p-3.5 space-y-0.5 text-left">
              <h3 className="font-black text-slate-900 text-base group-hover:text-orange-600 transition-colors tracking-tight line-clamp-1">
                {item.title}
              </h3>
              <p className="text-xs font-bold text-slate-500 line-clamp-1">
                {item.subtitle}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
