import React, { useState, useRef } from 'react'
import { useParams, Link, useSearchParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Star, Clock, Search, ShieldCheck, Car, Sparkles, ShoppingBag,
  Plus, Minus, Zap, MapPin, Heart, Share2, CheckCircle2, ThumbsUp, Flame, Tag, Leaf
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { fetchRestaurantById, fetchMenuByRestaurantId } from '../api/restaurantApi'

import MenuItemCard from '../components/restaurant/MenuItemCard'
import FloatingCart from '../components/cart/FloatingCart'
import useCartStore from '../store/useCartStore'
import useOrderStore from '../store/useOrderStore'
import { toast } from 'react-hot-toast'

// Realistic Demo Customer Reviews for SkYppQ
const DEMO_REVIEWS = [
  {
    id: 'rev-1',
    name: 'Ananya Sharma',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120',
    rating: 5,
    date: '2 days ago',
    comment: 'Food was ready exactly when I arrived! Zero waiting at the counter. The Biryani was piping hot and fresh.',
    orderedItem: 'Hyderabadi Special Dum Biryani',
    verified: true
  },
  {
    id: 'rev-2',
    name: 'Rahul Verma',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120',
    rating: 5,
    date: '1 week ago',
    comment: 'The Valet feature is a game changer! They brought the order directly to my car bay as soon as I pulled up.',
    orderedItem: 'Ghee Roast Dosa & 7 Chutneys',
    verified: true
  },
  {
    id: 'rev-3',
    name: 'Vikram Reddy',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120',
    rating: 5,
    date: '2 weeks ago',
    comment: 'Prep time synchronization with drive ETA is 100% accurate. Saved me 25 minutes of waiting in peak lunch hour.',
    orderedItem: 'Butter Chicken & Garlic Naan Combo',
    verified: true
  }
]

export default function RestaurantDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const { cart, addToCart, removeFromCart } = useCartStore()

  const { data: restaurant, isLoading: isLoadingRestaurant } = useQuery({
    queryKey: ['restaurant', id],
    queryFn: () => fetchRestaurantById(id)
  })

  const { data: menu, isLoading: isLoadingMenu } = useQuery({
    queryKey: ['menu', id],
    queryFn: () => fetchMenuByRestaurantId(id)
  })

  const [vegFilter, setVegFilter] = useState(null)
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearchInput, setShowSearchInput] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)

  const categoryRefs = useRef({})

  if (isLoadingRestaurant || isLoadingMenu) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-extrabold text-slate-600">Loading menu & restaurant...</p>
        </div>
      </div>
    )
  }

  if (!restaurant || !menu) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
        <p className="text-base font-bold text-slate-800">Restaurant not found.</p>
        <Link to="/" className="px-4 py-2 bg-orange-500 text-white rounded-xl text-xs font-bold">
          Return Home
        </Link>
      </div>
    )
  }

  // Filter menu logic
  const filteredMenu = menu.filter((m) => {
    if (vegFilter && m.type !== vegFilter) return false
    if (categoryFilter !== 'All' && m.category !== categoryFilter) return false
    if (
      searchQuery &&
      !m.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !m.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false
    return true
  })

  const categories = ['All', ...new Set(menu.map((m) => m.category))]
  const activeCategories =
    categoryFilter === 'All' ? [...new Set(filteredMenu.map((m) => m.category))] : [categoryFilter]

  // Highlighted Most Loved Items (First 6 items or items with high rating/bestseller)
  const mostLovedItems = menu.slice(0, 6)

  // Desktop sidebar cart items calculation
  const cartEntries = Object.entries(cart).map(([itemId, quantity]) => {
    const item = menu.find((m) => m.id === itemId)
    return { itemId, item, quantity }
  }).filter((entry) => entry.item && entry.quantity > 0)

  const cartTotal = cartEntries.reduce((sum, entry) => sum + entry.item.price * entry.quantity, 0)
  const totalItemsCount = cartEntries.reduce((sum, entry) => sum + entry.quantity, 0)
  const gstCharges = cartTotal > 0 ? 30 : 0

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: restaurant.name,
        text: `Order zero-wait takeaway from ${restaurant.name} on SkYppQ!`,
        url: window.location.href
      }).catch(() => {})
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success('Restaurant link copied to clipboard!')
    }
  }

  const scrollToCategory = (cat) => {
    setCategoryFilter(cat)
    if (cat !== 'All' && categoryRefs.current[cat]) {
      categoryRefs.current[cat].scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-36 sm:pb-40 font-sans">
      {/* SECTION 1 – RICH HERO FOOD COVER IMAGE & FLOATING NAV */}
      <div className="relative w-full h-64 sm:h-72 lg:h-80 bg-slate-950 overflow-hidden">
        <img
          src={restaurant.image}
          alt={restaurant.name}
          className="w-full h-full object-cover opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-slate-950/20" />

        {/* Floating Top Control Bar */}
        <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-slate-950/60 backdrop-blur-md text-white flex items-center justify-center border border-white/20 hover:bg-slate-950/80 transition-all cursor-pointer shadow-lg active:scale-95"
          >
            <ArrowLeft size={20} />
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="w-10 h-10 rounded-full bg-slate-950/60 backdrop-blur-md text-white flex items-center justify-center border border-white/20 hover:bg-slate-950/80 transition-all cursor-pointer shadow-lg active:scale-95"
            >
              <Share2 size={18} />
            </button>
            <button
              onClick={() => setIsFavorite((prev) => !prev)}
              className={`w-10 h-10 rounded-full bg-slate-950/60 backdrop-blur-md flex items-center justify-center border border-white/20 transition-all cursor-pointer shadow-lg active:scale-95 ${
                isFavorite ? 'text-rose-500' : 'text-white hover:text-rose-400'
              }`}
            >
              <Heart size={18} className={isFavorite ? 'fill-rose-500' : ''} />
            </button>
          </div>
        </div>

        {/* Restaurant Header Information Overlay */}
        <div className="absolute bottom-4 left-4 right-4 z-10 text-white max-w-6xl mx-auto space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight drop-shadow-md">
                  {restaurant.name}
                </h1>
                <span className="bg-emerald-500/90 text-white backdrop-blur-xs text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-emerald-400/40 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> Open Now
                </span>
              </div>

              {/* Rating, Cuisine, Distance, Prep Time */}
              <div className="flex items-center gap-2 text-xs sm:text-sm font-extrabold text-slate-200 flex-wrap">
                <span className="flex items-center gap-1 bg-emerald-600 text-white font-extrabold px-2.5 py-0.5 rounded-lg text-xs shadow-md">
                  <Star size={12} className="fill-white" /> {restaurant.rating || '4.8'} (1,200+ reviews)
                </span>
                <span className="text-slate-400">•</span>
                <span>{restaurant.cuisine || 'South Indian • Biryani'}</span>
                <span className="text-slate-400">•</span>
                <span>{restaurant.distance || '2.4'} km away</span>
                <span className="text-slate-400">•</span>
                <span className="text-amber-300 font-black flex items-center gap-1">
                  <Clock size={13} className="text-amber-400" /> Ready in {restaurant.preparationTime || 12} mins
                </span>
              </div>
            </div>

            {/* Zero-Wait Express Pickup Promise Badge */}
            <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white backdrop-blur-md px-4 py-2 rounded-2xl border border-orange-400/40 text-xs font-black flex items-center gap-2 shrink-0 shadow-lg">
              <Zap size={16} className="text-amber-200 animate-pulse shrink-0" />
              <span>Zero-Wait Pickup Guaranteed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-3 space-y-4">
        
        {/* SECTION 2 – OFFERS & MOST LOVED CAROUSEL */}
        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Flame size={16} className="text-orange-500" />
              <span>Most Loved & Offers</span>
            </h2>
            <span className="text-xs font-bold text-slate-400">Swipe ➔</span>
          </div>

          <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-1.5 pt-0.5">
            {mostLovedItems.map((item, idx) => {
              const currentQty = cart[item.id] || 0
              const originalPrice = Math.round(item.price * 1.25)
              const offerBadges = [
                '🏷️ 20% OFF • FLAT DEAL',
                '⚡ BUY 1 GET 1 FREE',
                '🔥 25% OFF • BESTSELLER',
                '🏷️ FLAT ₹50 OFF',
                '⭐ 4.9 • LIMITED OFFER',
                '👑 SIGNATURE SPECIAL'
              ]
              const currentBadge = offerBadges[idx % offerBadges.length]

              return (
                <div
                  key={item.id}
                  className="w-52 sm:w-60 shrink-0 bg-white rounded-2xl overflow-hidden border border-slate-200/90 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="relative h-28 sm:h-32 w-full overflow-hidden bg-slate-100">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    {/* Offer Tag */}
                    <div className="absolute top-2 left-2 bg-gradient-to-r from-slate-950/90 to-slate-900/90 backdrop-blur-xs text-amber-300 text-[10px] font-black px-2 py-0.5 rounded-full border border-amber-400/40 uppercase tracking-wide flex items-center gap-1 shadow-md">
                      <Tag size={10} className="text-amber-400 shrink-0" />
                      <span>{currentBadge}</span>
                    </div>

                    {/* Highly Visible Prep Time Overlay Badge */}
                    <div className="absolute bottom-2 right-2 bg-slate-950/85 backdrop-blur-xs text-white text-[10px] font-black px-2 py-0.5 rounded-lg border border-white/20 flex items-center gap-1 shadow-md">
                      <Clock size={10} className="text-orange-400 shrink-0" />
                      <span>{item.prepTime || '10–12 min'}</span>
                    </div>
                  </div>

                  <div className="p-3 space-y-2">
                    <div>
                      <div className="flex items-center justify-between gap-1">
                        <h3 className="font-black text-slate-900 text-xs sm:text-sm line-clamp-1">{item.name}</h3>
                        <span className={`w-3 h-3 border flex items-center justify-center p-0.5 rounded-xs shrink-0 ${
                          item.type === 'veg' ? 'border-emerald-600' : 'border-rose-600'
                        }`}>
                          <span className={`w-1 h-1 rounded-full ${item.type === 'veg' ? 'bg-emerald-600' : 'bg-rose-600'}`} />
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                        <span className="text-xs font-mono font-black text-slate-900">₹{item.price}</span>
                        <span className="line-through text-slate-400 font-mono text-[11px]">₹{originalPrice}</span>
                        <span className="text-[9px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-1.5 py-0.2 rounded">
                          20% OFF
                        </span>
                      </div>
                    </div>

                    <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-1 text-[11px] font-black text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200/80">
                        <Clock size={11} className="text-orange-500 shrink-0" />
                        <span>Ready in {item.prepTime || '10 min'}</span>
                      </div>

                      {currentQty === 0 ? (
                        <button
                          onClick={() => addToCart(item)}
                          className="px-3.5 py-1 bg-orange-50 text-orange-600 hover:bg-orange-500 hover:text-white border border-orange-200 rounded-xl text-xs font-black transition-colors cursor-pointer flex items-center gap-1 active:scale-95 shadow-2xs"
                        >
                          <Plus size={13} /> ADD
                        </button>
                      ) : (
                        <div className="flex items-center gap-2 bg-orange-500 text-white px-2 py-0.5 rounded-xl text-xs font-black shadow-xs">
                          <button onClick={() => removeFromCart(item)} className="hover:opacity-80"><Minus size={11} /></button>
                          <span className="font-mono text-xs">{currentQty}</span>
                          <button onClick={() => addToCart(item)} className="hover:opacity-80"><Plus size={11} /></button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* SECTION 3 – STICKY MENU CATEGORY CHIPS & SEARCH */}
        <div className="sticky top-0 z-30 bg-slate-50/95 backdrop-blur-md py-1.5">
          <div className="flex items-center justify-between gap-2">
            {/* Category Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar flex-1 py-0.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => scrollToCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer ${
                    categoryFilter === cat
                      ? 'bg-orange-500 text-white shadow-sm shadow-orange-500/20'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Veg / Non-Veg Toggle */}
            <button
              onClick={() => setVegFilter((prev) => (prev === 'veg' ? null : 'veg'))}
              className={`px-3 py-1.5 rounded-xl flex items-center gap-1 text-xs font-black border shrink-0 cursor-pointer ${
                vegFilter === 'veg'
                  ? 'bg-emerald-600 text-white border-emerald-500'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Leaf size={13} className={vegFilter === 'veg' ? 'text-white' : 'text-emerald-600'} />
              <span>VEG</span>
            </button>
          </div>
        </div>

        {/* SECTION 4 – MENU ITEMS GROUPED BY CATEGORY */}
        <div className="flex gap-5 items-start">
          <div className="flex-1 min-w-0 space-y-5">
            {activeCategories.map((category) => {
              const categoryItems = filteredMenu.filter((m) => m.category === category)
              if (categoryItems.length === 0) return null

              return (
                <div
                  key={category}
                  ref={(el) => (categoryRefs.current[category] = el)}
                  className="space-y-4 scroll-mt-24"
                >
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                    <h3 className="font-black text-slate-900 text-xl tracking-tight flex items-center gap-2">
                      {category}
                      <span className="text-xs font-bold text-slate-400 bg-slate-200/60 px-2.5 py-0.5 rounded-full">
                        {categoryItems.length}
                      </span>
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                    {categoryItems.map((item) => (
                      <div
                        key={item.id}
                        className="bg-white p-4 sm:p-5 rounded-3xl shadow-2xs border border-slate-200/90 hover:shadow-md transition-all flex justify-between gap-4"
                      >
                        <MenuItemCard item={item} idx={0} />
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>

          {/* DESKTOP STICKY ORDER BASKET SIDEBAR */}
          <aside className="hidden lg:block w-80 xl:w-96 shrink-0 sticky top-20 self-start bg-white border border-slate-200/90 rounded-3xl p-5 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                <ShoppingBag size={18} className="text-orange-500" />
                Your Basket
              </h3>
              <span className="text-xs font-extrabold bg-orange-50 text-orange-600 px-2.5 py-0.5 rounded-full border border-orange-200">
                {totalItemsCount} items
              </span>
            </div>

            {cartEntries.length === 0 ? (
              <div className="text-center py-10 space-y-2 text-slate-400">
                <ShoppingBag size={36} className="mx-auto opacity-30" />
                <p className="text-xs font-bold text-slate-600">Your basket is empty</p>
                <p className="text-[11px] text-slate-400">Add delicious items from the menu to start</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="max-h-60 overflow-y-auto space-y-3 pr-1">
                  {cartEntries.map(({ item, quantity }) => (
                    <div key={item.id} className="flex items-center justify-between gap-3 text-xs">
                      <div className="min-w-0 flex-1">
                        <h4 className="font-extrabold text-slate-900 truncate">{item.name}</h4>
                        <p className="text-slate-400 font-mono">₹{(item.price * quantity).toFixed(0)}</p>
                      </div>

                      <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl shrink-0 font-extrabold">
                        <button
                          onClick={() => removeFromCart(item)}
                          className="w-6 h-6 flex items-center justify-center bg-white rounded-lg hover:bg-slate-200 text-slate-800 shadow-xs cursor-pointer"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="w-5 text-center text-slate-900 font-mono">{quantity}</span>
                        <button
                          onClick={() => addToCart(item)}
                          className="w-6 h-6 flex items-center justify-center bg-orange-500 text-white rounded-lg hover:bg-orange-600 shadow-xs cursor-pointer"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-slate-100 pt-3 space-y-2 text-xs font-semibold">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal</span>
                    <span className="font-mono text-slate-900">₹{cartTotal.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>GST & Packaging</span>
                    <span className="font-mono text-slate-900">₹{gstCharges}</span>
                  </div>
                  <div className="flex justify-between font-black text-slate-900 text-sm pt-2 border-t border-slate-100">
                    <span>Total Amount</span>
                    <span className="font-mono text-orange-600">₹{(cartTotal + gstCharges).toFixed(0)}</span>
                  </div>
                </div>

                <button
                  onClick={() => navigate('/checkout')}
                  className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
                >
                  <span>Proceed to Checkout</span>
                  <Sparkles size={14} />
                </button>
              </div>
            )}
          </aside>
        </div>

        {/* SECTION 5 – REALISTIC CUSTOMER REVIEWS */}
        <section className="bg-white rounded-3xl border border-slate-200/90 p-6 space-y-6 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <Star size={20} className="text-amber-500 fill-amber-500" />
                <span>Customer Experience & Reviews</span>
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Verified pickup reviews from SkYppQ diners</p>
            </div>

            <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-200 text-xs font-black">
              <span>⭐ 4.8 Rating</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {DEMO_REVIEWS.map((rev) => (
              <div key={rev.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <img src={rev.avatar} alt={rev.name} className="w-10 h-10 rounded-full object-cover border border-slate-200" />
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-sm leading-tight">{rev.name}</h4>
                      <p className="text-[10px] text-slate-400 font-medium">{rev.date}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-amber-500 text-xs">
                    {'★'.repeat(rev.rating)}
                  </div>

                  <p className="text-xs text-slate-700 font-medium italic leading-relaxed">
                    "{rev.comment}"
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                  <span className="font-bold text-slate-500 truncate">Ordered: {rev.orderedItem}</span>
                  <span className="text-emerald-600 font-extrabold shrink-0 flex items-center gap-1">
                    <CheckCircle2 size={12} /> Verified
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Floating Cart Button for Mobile View */}
      <FloatingCart menu={menu} />
    </div>
  )
}
