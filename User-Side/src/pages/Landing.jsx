import React, { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Search, MapPin, Navigation, Clock, Utensils, ChevronRight, ChevronDown, ChevronLeft,
  Flame, Award, Star, Bell, User, X, Check, Crosshair, Tag, Percent, Zap, ArrowRight,
  SlidersHorizontal, Mic, Leaf, Route, ShoppingBag, TrendingUp, Compass
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

import SearchBarWithAutocomplete from '../components/search/SearchBarWithAutocomplete'
import PremiumRestaurantCard from '../components/restaurant/PremiumRestaurantCard'
import FoodDiscoveryCarousel from '../components/restaurant/FoodDiscoveryCarousel'
import StickyFilterBar from '../components/restaurant/StickyFilterBar'
import ActiveOrderWidget from '../components/ActiveOrderWidget'

import mockRestaurants from '../mock/restaurants.json'
import hyderabadLocations from '../mock/hyderabad_locations.json'

// TRENDING / CARNIVAL BANNER ITEMS
const CARNIVAL_BANNERS = [
  {
    id: 'ban-1',
    title: 'MONTH END CARNIVAL',
    subtitle: 'Up to 60% OFF on Top Takeaway Outlets',
    tag: 'ORDER NOW >',
    bg: 'from-orange-600 via-amber-600 to-rose-600',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80',
    query: 'Pizza'
  },
  {
    id: 'ban-2',
    title: 'SKYPPQ EXPRESS',
    subtitle: 'Zero Waiting Time - Order Ahead & Pickup',
    tag: 'EXPLORE ROUTE >',
    bg: 'from-emerald-600 via-teal-600 to-cyan-700',
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80',
    query: 'Biryani'
  }
]

// FOOD CATEGORIES (Swiggy-Style)
const SWIGGY_FOOD_CATEGORIES = [
  { id: 'c-pizza', name: 'Pizza', query: 'Pizza', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300&h=300&fit=crop' },
  { id: 'c-biryani', name: 'Biryani', query: 'Biryani', image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=300&h=300&fit=crop' },
  { id: 'c-burgers', name: 'Burgers', query: 'Burger', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&h=300&fit=crop' },
  { id: 'c-south', name: 'South Indian', query: 'South Indian', image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=300&h=300&fit=crop' },
  { id: 'c-chinese', name: 'Chinese', query: 'Chinese', image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=300&h=300&fit=crop' },
  { id: 'c-shawarma', name: 'Shawarma', query: 'Shawarma', image: 'https://images.unsplash.com/photo-1561651823-34feb02250e4?w=300&h=300&fit=crop' },
  { id: 'c-momos', name: 'Momos', query: 'Momos', image: 'https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?w=300&h=300&fit=crop' },
  { id: 'c-cakes', name: 'Cake', query: 'Desserts', image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=300&h=300&fit=crop' },
  { id: 'c-coffee', name: 'Coffee', query: 'Starbucks', image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&h=300&fit=crop' },
  { id: 'c-icecream', name: 'Ice Cream', query: 'Ice Cream', image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=300&h=300&fit=crop' }
]

// TOP RESTAURANT CHAINS
const TOP_CHAINS = [
  { id: 'ch-1', name: 'Paradise Biryani', cuisine: 'Biryani, Kebabs', rating: '4.8', eta: '18 mins', image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=80' },
  { id: 'ch-2', name: 'Shah Ghouse Hotel', cuisine: 'Mutton Haleem, Biryani', rating: '4.8', eta: '16 mins', image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=500&auto=format&fit=crop&q=80' },
  { id: 'ch-3', name: 'Chutneys', cuisine: 'Ghee Roast Dosa, South Indian', rating: '4.9', eta: '12 mins', image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=500&auto=format&fit=crop&q=80' },
  { id: 'ch-4', name: 'Mehfil Restaurant', cuisine: 'Chicken Biryani, Tandoori', rating: '4.7', eta: '15 mins', image: 'https://images.unsplash.com/photo-1561651823-34feb02250e4?w=500&auto=format&fit=crop&q=80' },
  { id: 'ch-5', name: 'Bawarchi Restaurant', cuisine: 'Hyderabadi Dum Biryani', rating: '4.8', eta: '20 mins', image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=500&auto=format&fit=crop&q=80' }
]

// Uber/Google Maps style Autocomplete Dropdown List
const LocationAutocompleteDropdown = ({
  show,
  locations,
  onSelect,
  iconColor = 'text-orange-600',
  iconBg = 'bg-orange-50 border-orange-100'
}) => {
  if (!show || !locations || locations.length === 0) return null

  return (
    <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white rounded-2xl border border-slate-200 shadow-2xl max-h-56 overflow-y-auto p-1.5 space-y-0.5 animate-in fade-in zoom-in-95 duration-150">
      {locations.slice(0, 8).map((loc) => (
        <button
          key={loc.id}
          type="button"
          onMouseDown={(e) => {
            e.preventDefault()
            onSelect(loc)
          }}
          className="w-full text-left p-2.5 rounded-xl hover:bg-orange-50 transition-colors flex items-center justify-between group cursor-pointer"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`w-7 h-7 rounded-lg ${iconBg} ${iconColor} flex items-center justify-center shrink-0 border`}>
              <MapPin size={14} />
            </div>
            <div className="min-w-0">
              <p className="font-extrabold text-slate-900 text-xs truncate group-hover:text-orange-600">
                {loc.name}
              </p>
              <p className="text-[10px] text-slate-400 font-medium truncate">
                {loc.address}
              </p>
            </div>
          </div>
          <ChevronRight size={13} className="text-slate-300 group-hover:text-orange-500 shrink-0" />
        </button>
      ))}
    </div>
  )
}

export default function LandingPage() {
  const navigate = useNavigate()

  // Location state
  const [selectedLocation, setSelectedLocation] = useState('Financial District, Hyderabad')
  const [showLocationModal, setShowLocationModal] = useState(false)
  const [showNotificationsModal, setShowNotificationsModal] = useState(false)

  // Pure Veg switch toggle
  const [vegOnlyToggle, setVegOnlyToggle] = useState(false)

  // Discovery mode state: null | 'route' | 'nearby'
  const [selectedMode, setSelectedMode] = useState(null)
  const [radius, setRadius] = useState(5)

  // Location inputs
  const [startInputText, setStartInputText] = useState('')
  const [selectedStartLoc, setSelectedStartLoc] = useState(null)
  const [showStartAutocomplete, setShowStartAutocomplete] = useState(false)

  const [destInputText, setDestInputText] = useState('')
  const [selectedDestLoc, setSelectedDestLoc] = useState(null)
  const [showDestAutocomplete, setShowDestAutocomplete] = useState(false)

  const [nearInputText, setNearInputText] = useState('')
  const [selectedNearLoc, setSelectedNearLoc] = useState(null)
  const [showNearAutocomplete, setShowNearAutocomplete] = useState(false)

  // Restaurant Feed state
  const [activeFilters, setActiveFilters] = useState({})
  const [sortBy, setSortBy] = useState('Recommended')

  // Autocomplete filters
  const filteredStartLocations = useMemo(() => {
    if (!startInputText.trim()) return hyderabadLocations
    return hyderabadLocations.filter(
      (l) =>
        l.name.toLowerCase().includes(startInputText.toLowerCase()) ||
        l.address.toLowerCase().includes(startInputText.toLowerCase())
    )
  }, [startInputText])

  const filteredDestLocations = useMemo(() => {
    if (!destInputText.trim()) return hyderabadLocations
    return hyderabadLocations.filter(
      (l) =>
        l.name.toLowerCase().includes(destInputText.toLowerCase()) ||
        l.address.toLowerCase().includes(destInputText.toLowerCase())
    )
  }, [destInputText])

  const filteredNearLocations = useMemo(() => {
    if (!nearInputText.trim()) return hyderabadLocations
    return hyderabadLocations.filter(
      (l) =>
        l.name.toLowerCase().includes(nearInputText.toLowerCase()) ||
        l.address.toLowerCase().includes(nearInputText.toLowerCase())
    )
  }, [nearInputText])

  // Filtered Restaurant Feed
  const feedRestaurants = useMemo(() => {
    let list = [...mockRestaurants]

    if (vegOnlyToggle || activeFilters.vegOnly) {
      list = list.filter((r) => r.cuisine.toLowerCase().includes('vegetarian') || r.cuisine.toLowerCase().includes('south indian'))
    }
    if (activeFilters.hasOffers) {
      list = list.filter((r) => !!r.offer)
    }
    if (activeFilters.topRated) {
      list = list.filter((r) => parseFloat(r.rating) >= 4.7)
    }
    if (activeFilters.fastPickup) {
      list = list.filter((r) => (r.preparationTime || 15) <= 12)
    }
    if (activeFilters.nearMe) {
      list = list.filter((r) => parseFloat(r.distance) <= 1.5)
    }

    if (sortBy === 'Best Rated') {
      list.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating))
    } else if (sortBy === 'Nearest') {
      list.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance))
    }

    return list
  }, [activeFilters, sortBy, vegOnlyToggle])

  // Along Route Action
  const handleExploreRoute = () => {
    const sName = startInputText.trim() || selectedLocation
    const dName = destInputText.trim() || 'Charminar'

    const sLoc = selectedStartLoc ||
                 hyderabadLocations.find((l) => sName.toLowerCase().includes(l.name.toLowerCase()) || l.name.toLowerCase().includes(sName.toLowerCase())) ||
                 hyderabadLocations.find((l) => l.name.includes('Financial District')) ||
                 hyderabadLocations[0]

    const dLoc = selectedDestLoc ||
                 hyderabadLocations.find((l) => dName.toLowerCase().includes(l.name.toLowerCase()) || l.name.toLowerCase().includes(dName.toLowerCase())) ||
                 hyderabadLocations[0]

    navigate(
      `/discovery?mode=route&startName=${encodeURIComponent(sName)}&endName=${encodeURIComponent(dName)}&startLat=${sLoc.lat}&startLng=${sLoc.lng}&endLat=${dLoc.lat}&endLng=${dLoc.lng}`
    )
  }

  // Near Me Action
  const handleExploreNearMe = () => {
    const nLoc = selectedNearLoc || hyderabadLocations[0]
    navigate(
      `/discovery?mode=nearby&lat=${nLoc.lat}&lng=${nLoc.lng}&radius=${radius}`
    )
  }

  // Set current location helper
  const handleUseCurrentLocation = (setterInput, setterLoc, closeDropdown) => {
    setterInput(selectedLocation)
    setterLoc(hyderabadLocations[0])
    closeDropdown(false)
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pt-0 md:pt-16 pb-36 sm:pb-40 font-sans overflow-x-hidden">

      {/* ======================================================== */}
      {/* 1. MOBILE VIEW (Swiggy/Zomato Mobile Production UI)       */}
      {/* ======================================================== */}
      <div className="block md:hidden">
        {/* Header Hero Area */}
        <div className="bg-gradient-to-b from-orange-600 via-orange-500 to-amber-500 text-white pt-4 pb-6 px-4 space-y-4 shadow-sm rounded-b-[2rem]">
          {/* Location Bar + Profile Avatar */}
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={() => setShowLocationModal(true)}
              className="text-left flex items-center gap-2.5 min-w-0 flex-1 group"
            >
              <div className="w-9 h-9 rounded-2xl bg-white/20 backdrop-blur-md text-white flex items-center justify-center shrink-0 border border-white/20 shadow-2xs">
                <MapPin size={18} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <span className="font-black text-white text-base truncate">{selectedLocation.split(',')[0]}</span>
                  <ChevronDown size={14} className="text-white/90 shrink-0" />
                </div>
                <p className="text-[11px] text-orange-100 font-medium truncate -mt-0.5">
                  {selectedLocation}
                </p>
              </div>
            </button>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setShowNotificationsModal(true)}
                className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md flex items-center justify-center relative text-white border border-white/20"
              >
                <Bell size={17} />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-300 absolute top-1.5 right-1.5 ring-2 ring-orange-500" />
              </button>

              <Link
                to="/profile"
                className="w-9 h-9 rounded-full bg-white text-orange-600 font-black flex items-center justify-center text-sm shadow-md border-2 border-white/30"
              >
                Y
              </Link>
            </div>
          </div>

          {/* Search Input Bar + VEG Toggle Button */}
          <div className="flex items-center gap-2 pt-1">
            <div className="flex-1">
              <SearchBarWithAutocomplete placeholder='Search "Biryani", "Pizza" or outlets...' />
            </div>

            <button
              onClick={() => setVegOnlyToggle((prev) => !prev)}
              className={`px-3 py-2.5 rounded-2xl flex items-center gap-1.5 transition-all text-xs font-black shrink-0 border ${
                vegOnlyToggle
                  ? 'bg-emerald-500 text-white border-emerald-400 shadow-md ring-2 ring-emerald-300/40'
                  : 'bg-white/25 text-white border-white/30 backdrop-blur-md hover:bg-white/35'
              }`}
            >
              <Leaf size={14} className={vegOnlyToggle ? 'text-white' : 'text-emerald-300'} />
              <span>VEG</span>
            </button>
          </div>

          {/* DISCOVERY MODES NESTED INSIDE HEADER */}
          <div className="pt-2 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setSelectedMode((prev) => (prev === 'route' ? null : 'route'))}
                className={`p-3.5 rounded-2xl border text-left transition-all duration-200 flex items-center justify-between ${
                  selectedMode === 'route'
                    ? 'bg-white text-slate-900 border-orange-500 shadow-lg ring-2 ring-orange-500/20'
                    : 'bg-white text-slate-900 border-slate-100 shadow-md hover:shadow-lg'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-orange-50 border border-orange-100 text-orange-600 flex items-center justify-center font-bold text-base">
                    🚗
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-xs sm:text-sm">Along Route</h3>
                    <p className="text-slate-400 text-[10px] font-medium">On your way</p>
                  </div>
                </div>
                <ChevronDown
                  size={15}
                  className={`text-slate-400 transition-transform duration-200 ${
                    selectedMode === 'route' ? 'rotate-180 text-orange-600' : ''
                  }`}
                />
              </button>

              <button
                onClick={() => setSelectedMode((prev) => (prev === 'nearby' ? null : 'nearby'))}
                className={`p-3.5 rounded-2xl border text-left transition-all duration-200 flex items-center justify-between ${
                  selectedMode === 'nearby'
                    ? 'bg-white text-slate-900 border-orange-500 shadow-lg ring-2 ring-orange-500/20'
                    : 'bg-white text-slate-900 border-slate-100 shadow-md hover:shadow-lg'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-orange-50 border border-orange-100 text-orange-600 flex items-center justify-center font-bold text-base">
                    📍
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-xs sm:text-sm">Near Me</h3>
                    <p className="text-slate-400 text-[10px] font-medium">Nearby food</p>
                  </div>
                </div>
                <ChevronDown
                  size={15}
                  className={`text-slate-400 transition-transform duration-200 ${
                    selectedMode === 'nearby' ? 'rotate-180 text-orange-600' : ''
                  }`}
                />
              </button>
            </div>

            <AnimatePresence>
              {selectedMode === 'route' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-visible text-slate-900"
                >
                  <div className="p-4 bg-white rounded-2xl border border-orange-200 shadow-lg space-y-3">
                    <div className="space-y-3">
                      <div className="relative">
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-[10px] font-extrabold uppercase text-slate-400">Start Location</label>
                          <button
                            type="button"
                            onClick={() => handleUseCurrentLocation(setStartInputText, setSelectedStartLoc, setShowStartAutocomplete)}
                            className="text-[9px] font-black text-orange-600 bg-orange-50 px-2 py-0.5 rounded border border-orange-200"
                          >
                            🎯 Use Current
                          </button>
                        </div>
                        <input
                          type="text"
                          value={startInputText}
                          onFocus={() => setShowStartAutocomplete(true)}
                          onChange={(e) => {
                            setStartInputText(e.target.value)
                            setSelectedStartLoc(null)
                            setShowStartAutocomplete(true)
                          }}
                          placeholder="Where are you starting?"
                          className="w-full bg-slate-50 border border-slate-200 p-2.5 pl-8 rounded-xl text-xs font-bold outline-none"
                        />
                        <MapPin size={14} className="absolute left-2.5 top-8 text-emerald-600" />
                        <LocationAutocompleteDropdown
                          show={showStartAutocomplete}
                          locations={filteredStartLocations}
                          onSelect={(loc) => {
                            setStartInputText(`${loc.name}, Hyderabad`)
                            setSelectedStartLoc(loc)
                            setShowStartAutocomplete(false)
                          }}
                        />
                      </div>

                      <div className="relative">
                        <label className="text-[10px] font-extrabold uppercase text-slate-400 block mb-1">Destination</label>
                        <input
                          type="text"
                          value={destInputText}
                          onFocus={() => setShowDestAutocomplete(true)}
                          onChange={(e) => {
                            setDestInputText(e.target.value)
                            setSelectedDestLoc(null)
                            setShowDestAutocomplete(true)
                          }}
                          placeholder="Search destination"
                          className="w-full bg-slate-50 border border-slate-200 p-2.5 pl-8 rounded-xl text-xs font-bold outline-none"
                        />
                        <Navigation size={14} className="absolute left-2.5 top-8 text-rose-500" />
                        <LocationAutocompleteDropdown
                          show={showDestAutocomplete}
                          locations={filteredDestLocations}
                          iconColor="text-rose-600"
                          iconBg="bg-rose-50 border-rose-100"
                          onSelect={(loc) => {
                            setDestInputText(`${loc.name}, Hyderabad`)
                            setSelectedDestLoc(loc)
                            setShowDestAutocomplete(false)
                          }}
                        />
                      </div>
                    </div>

                    <button
                      onClick={handleExploreRoute}
                      className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-extrabold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-sm"
                    >
                      <Utensils size={14} />
                      <span>Explore Restaurants Along Route</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </motion.div>
              )}

              {selectedMode === 'nearby' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-visible text-slate-900"
                >
                  <div className="p-4 bg-white rounded-2xl border border-orange-200 shadow-lg space-y-3">
                    <div className="relative">
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-[10px] font-extrabold uppercase text-slate-400">Current Location</label>
                        <button
                          type="button"
                          onClick={() => handleUseCurrentLocation(setNearInputText, setSelectedNearLoc, setShowNearAutocomplete)}
                          className="text-[9px] font-black text-orange-600 bg-orange-50 px-2 py-0.5 rounded border border-orange-200"
                        >
                          🎯 Use Current
                        </button>
                      </div>
                      <input
                        type="text"
                        value={nearInputText}
                        onFocus={() => setShowNearAutocomplete(true)}
                        onChange={(e) => {
                          setNearInputText(e.target.value)
                          setSelectedNearLoc(null)
                          setShowNearAutocomplete(true)
                        }}
                        placeholder="Enter current location"
                        className="w-full bg-slate-50 border border-slate-200 p-2.5 pl-8 rounded-xl text-xs font-bold outline-none"
                      />
                      <MapPin size={14} className="absolute left-2.5 top-8 text-orange-500" />
                      <LocationAutocompleteDropdown
                        show={showNearAutocomplete}
                        locations={filteredNearLocations}
                        onSelect={(loc) => {
                          setNearInputText(`${loc.name}, Hyderabad`)
                          setSelectedNearLoc(loc)
                          setShowNearAutocomplete(false)
                        }}
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-[10px] font-extrabold uppercase text-slate-400">Radius</label>
                        <span className="text-xs font-black text-orange-600">{radius} km</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="15"
                        value={radius}
                        onChange={(e) => setRadius(parseInt(e.target.value))}
                        className="w-full accent-orange-500"
                      />
                    </div>

                    <button
                      onClick={handleExploreNearMe}
                      className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-extrabold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-sm"
                    >
                      <Flame size={14} />
                      <span>Explore Nearby Restaurants</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* FOOD CATEGORIES */}
        <div className="px-4 mt-5">
          <div className="flex items-center gap-3 overflow-x-auto hide-scrollbar pb-2">
            <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-indigo-700 text-white p-3 rounded-2xl shrink-0 w-28 flex flex-col justify-between shadow-md border border-blue-400/30">
              <span className="text-[8px] font-black uppercase bg-white/20 backdrop-blur-xs px-1.5 py-0.5 rounded-full w-fit tracking-wider">
                MEALS UNDER
              </span>
              <p className="text-xl font-black tracking-tight leading-none mt-1">₹200</p>
              <span className="text-[10px] font-extrabold underline tracking-wide text-blue-100 hover:text-white mt-1">
                Explore &gt;
              </span>
            </div>

            {SWIGGY_FOOD_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => navigate(`/discovery?search=${encodeURIComponent(cat.query)}`)}
                className="flex flex-col items-center gap-1.5 group shrink-0"
              >
                <div className="w-15 h-15 rounded-full overflow-hidden border-2 border-white shadow-xs ring-1 ring-slate-200 group-hover:border-orange-500 group-hover:shadow-md transition-all">
                  <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                </div>
                <span className="text-xs font-black text-slate-800 group-hover:text-orange-600 transition-colors">
                  {cat.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* 🌟 PREMIUM HORIZONTAL FOOD DISCOVERY CAROUSEL */}
        <div className="px-4 mt-2">
          <FoodDiscoveryCarousel />
        </div>

        {/* RESTAURANT FEED (Mobile) */}
        <div className="px-4 mt-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
            <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Utensils size={15} className="text-orange-500" />
              <span>{feedRestaurants.length} RESTAURANTS DELIVERING TO YOU</span>
            </h2>
          </div>

          <div className="space-y-6 sm:space-y-8">
            {feedRestaurants.map((restaurant) => (
              <PremiumRestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))}
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. DESKTOP & TABLET / IPAD VIEW (Responsive Layout)      */}
      {/* ======================================================== */}
      <div className="hidden md:block">
        {/* DESKTOP HERO & DISCOVERY BAR */}
        <section className="bg-gradient-to-b from-orange-50/80 via-amber-50/40 to-slate-50 pt-8 pb-12 px-4 sm:px-8 border-b border-orange-100">
          <div className="max-w-7xl mx-auto space-y-8">
            
            {/* Top Control Bar: Location Selector + Search + Veg Toggle */}
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-white/90 backdrop-blur-md p-4 rounded-3xl border border-slate-200/80 shadow-md">
              {/* Location Picker */}
              <button
                onClick={() => setShowLocationModal(true)}
                className="text-left flex items-center gap-3 group shrink-0 lg:min-w-[240px] lg:border-r border-slate-200 lg:pr-4"
              >
                <div className="w-10 h-10 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0 border border-orange-100 shadow-2xs group-hover:scale-105 transition-transform">
                  <MapPin size={20} />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider -mb-0.5">
                    LOCATION
                  </span>
                  <span className="font-black text-slate-900 text-sm truncate flex items-center gap-1 group-hover:text-orange-600 transition-colors">
                    <span className="truncate">{selectedLocation}</span>
                    <ChevronDown size={14} className="text-slate-400 shrink-0" />
                  </span>
                </div>
              </button>

              {/* Main Search Bar */}
              <div className="flex-1 w-full max-w-2xl">
                <SearchBarWithAutocomplete placeholder="Search for restaurant, food item or cuisine..." />
              </div>

              {/* Pure Veg Switch Toggle */}
              <button
                onClick={() => setVegOnlyToggle((prev) => !prev)}
                className={`px-4 py-2.5 rounded-2xl flex items-center justify-center gap-2 transition-all text-xs font-black shrink-0 border ${
                  vegOnlyToggle
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
                    : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                }`}
              >
                <Leaf size={16} className={vegOnlyToggle ? 'text-white' : 'text-emerald-600'} />
                <span>PURE VEG</span>
              </button>
            </div>

            {/* SkYppQ Investor Pitch Headline */}
            <div className="text-center max-w-4xl mx-auto pt-2 space-y-3">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight bg-gradient-to-r from-orange-600 via-amber-600 to-rose-600 bg-clip-text text-transparent">
                Synchronizing kitchen preparation with your live drive ETA for instant pickup & dining.
              </h1>
            </div>

            {/* ROUTEBITE DISCOVERY CARDS (Along My Route & Near Me Desktop/Tablet Cards) */}
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
                {/* Card A: Along My Route */}
                <button
                  onClick={() => setSelectedMode((prev) => (prev === 'route' ? null : 'route'))}
                  className={`p-5 lg:p-6 rounded-3xl border text-left transition-all duration-300 flex items-center justify-between group ${
                    selectedMode === 'route'
                      ? 'bg-white border-orange-500 shadow-xl ring-2 ring-orange-500/20'
                      : 'bg-white border-slate-200/90 hover:border-orange-300 shadow-md hover:shadow-lg'
                  }`}
                >
                  <div className="flex items-center gap-3 lg:gap-4">
                    <div className="w-11 h-11 lg:w-12 lg:h-12 rounded-2xl bg-orange-50 border border-orange-100 text-orange-600 flex items-center justify-center font-bold text-xl lg:text-2xl group-hover:scale-110 transition-transform shrink-0">
                      🚗
                    </div>
                    <div>
                      <h3 className="font-black text-slate-900 text-base lg:text-lg group-hover:text-orange-600 transition-colors">
                        Along My Route
                      </h3>
                      <p className="text-slate-500 text-xs font-medium mt-0.5">Find food between start & destination</p>
                    </div>
                  </div>
                  <ChevronDown
                    size={20}
                    className={`text-slate-400 transition-transform duration-300 ${
                      selectedMode === 'route' ? 'rotate-180 text-orange-600' : ''
                    }`}
                  />
                </button>

                {/* Card B: Near Me */}
                <button
                  onClick={() => setSelectedMode((prev) => (prev === 'nearby' ? null : 'nearby'))}
                  className={`p-5 lg:p-6 rounded-3xl border text-left transition-all duration-300 flex items-center justify-between group ${
                    selectedMode === 'nearby'
                      ? 'bg-white border-orange-500 shadow-xl ring-2 ring-orange-500/20'
                      : 'bg-white border-slate-200/90 hover:border-orange-300 shadow-md hover:shadow-lg'
                  }`}
                >
                  <div className="flex items-center gap-3 lg:gap-4">
                    <div className="w-11 h-11 lg:w-12 lg:h-12 rounded-2xl bg-orange-50 border border-orange-100 text-orange-600 flex items-center justify-center font-bold text-xl lg:text-2xl group-hover:scale-110 transition-transform shrink-0">
                      📍
                    </div>
                    <div>
                      <h3 className="font-black text-slate-900 text-base lg:text-lg group-hover:text-orange-600 transition-colors">
                        Near Me
                      </h3>
                      <p className="text-slate-500 text-xs font-medium mt-0.5">Explore takeaway spots near your location</p>
                    </div>
                  </div>
                  <ChevronDown
                    size={20}
                    className={`text-slate-400 transition-transform duration-300 ${
                      selectedMode === 'nearby' ? 'rotate-180 text-orange-600' : ''
                    }`}
                  />
                </button>
              </div>

              {/* Expandable Inputs Form (Desktop/Tablet) */}
              <AnimatePresence>
                {selectedMode === 'route' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-visible text-left"
                  >
                    <div className="p-6 bg-white rounded-3xl border border-orange-200 shadow-xl space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="relative">
                          <div className="flex justify-between items-center mb-1">
                            <label className="text-[11px] font-black uppercase text-slate-400">Start Location</label>
                            <button
                              type="button"
                              onClick={() => handleUseCurrentLocation(setStartInputText, setSelectedStartLoc, setShowStartAutocomplete)}
                              className="text-[10px] font-black text-orange-600 hover:text-orange-700 flex items-center gap-1 bg-orange-50 px-2.5 py-0.5 rounded-lg border border-orange-200"
                            >
                              <Crosshair size={11} />
                              <span>Use Current Location</span>
                            </button>
                          </div>
                          <input
                            type="text"
                            value={startInputText}
                            onFocus={() => setShowStartAutocomplete(true)}
                            onChange={(e) => {
                              setStartInputText(e.target.value)
                              setSelectedStartLoc(null)
                              setShowStartAutocomplete(true)
                            }}
                            placeholder="Where are you starting?"
                            className="w-full bg-slate-50 border border-slate-200 p-3 pl-9 rounded-2xl text-xs font-bold outline-none focus:border-orange-500 focus:bg-white transition-all"
                          />
                          <MapPin size={16} className="absolute left-3 top-3.5 text-emerald-600" />
                          <LocationAutocompleteDropdown
                            show={showStartAutocomplete}
                            locations={filteredStartLocations}
                            onSelect={(loc) => {
                              setStartInputText(`${loc.name}, Hyderabad`)
                              setSelectedStartLoc(loc)
                              setShowStartAutocomplete(false)
                            }}
                          />
                        </div>

                        <div className="relative">
                          <label className="text-[11px] font-black uppercase text-slate-400 block mb-1">Destination</label>
                          <input
                            type="text"
                            value={destInputText}
                            onFocus={() => setShowDestAutocomplete(true)}
                            onChange={(e) => {
                              setDestInputText(e.target.value)
                              setSelectedDestLoc(null)
                              setShowDestAutocomplete(true)
                            }}
                            placeholder="Search destination"
                            className="w-full bg-slate-50 border border-slate-200 p-3 pl-9 rounded-2xl text-xs font-bold outline-none focus:border-orange-500 focus:bg-white transition-all"
                          />
                          <Navigation size={16} className="absolute left-3 top-3.5 text-rose-500" />
                          <LocationAutocompleteDropdown
                            show={showDestAutocomplete}
                            locations={filteredDestLocations}
                            iconColor="text-rose-600"
                            iconBg="bg-rose-50 border-rose-100"
                            onSelect={(loc) => {
                              setDestInputText(`${loc.name}, Hyderabad`)
                              setSelectedDestLoc(loc)
                              setShowDestAutocomplete(false)
                            }}
                          />
                        </div>
                      </div>

                      <button
                        onClick={handleExploreRoute}
                        className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white font-black rounded-2xl text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
                      >
                        <Utensils size={18} />
                        <span>Explore Restaurants Along Route</span>
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  </motion.div>
                )}

                {selectedMode === 'nearby' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-visible text-left"
                  >
                    <div className="p-6 bg-white rounded-3xl border border-orange-200 shadow-xl space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="relative">
                          <div className="flex justify-between items-center mb-1">
                            <label className="text-[11px] font-black uppercase text-slate-400">Current Location</label>
                            <button
                              type="button"
                              onClick={() => handleUseCurrentLocation(setNearInputText, setSelectedNearLoc, setShowNearAutocomplete)}
                              className="text-[10px] font-black text-orange-600 hover:text-orange-700 flex items-center gap-1 bg-orange-50 px-2.5 py-0.5 rounded-lg border border-orange-200"
                            >
                              <Crosshair size={11} />
                              <span>Use Current</span>
                            </button>
                          </div>
                          <input
                            type="text"
                            value={nearInputText}
                            onFocus={() => setShowNearAutocomplete(true)}
                            onChange={(e) => {
                              setNearInputText(e.target.value)
                              setSelectedNearLoc(null)
                              setShowNearAutocomplete(true)
                            }}
                            placeholder="Enter current location"
                            className="w-full bg-slate-50 border border-slate-200 p-3 pl-9 rounded-2xl text-xs font-bold outline-none focus:border-orange-500 focus:bg-white transition-all"
                          />
                          <MapPin size={16} className="absolute left-3 top-3.5 text-orange-500" />
                          <LocationAutocompleteDropdown
                            show={showNearAutocomplete}
                            locations={filteredNearLocations}
                            onSelect={(loc) => {
                              setNearInputText(`${loc.name}, Hyderabad`)
                              setSelectedNearLoc(loc)
                              setShowNearAutocomplete(false)
                            }}
                          />
                        </div>

                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <label className="text-[11px] font-black uppercase text-slate-400">Search Radius</label>
                            <span className="text-xs font-black text-orange-600">{radius} km</span>
                          </div>
                          <input
                            type="range"
                            min="1"
                            max="15"
                            value={radius}
                            onChange={(e) => setRadius(parseInt(e.target.value))}
                            className="w-full accent-orange-500 cursor-pointer pt-2"
                          />
                        </div>
                      </div>

                      <button
                        onClick={handleExploreNearMe}
                        className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white font-black rounded-2xl text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
                      >
                        <Flame size={18} />
                        <span>Explore Nearby Restaurants</span>
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </section>

        {/* SWIGGY DESKTOP/TABLET CAROUSEL 1: "What's on your mind?" */}
        <section className="max-w-7xl mx-auto px-4 sm:px-8 mt-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                What's on your mind?
              </h2>
              <p className="text-slate-500 text-xs font-medium mt-0.5">Explore delicious dishes by category</p>
            </div>
          </div>

          <div className="flex items-center gap-6 overflow-x-auto hide-scrollbar pb-3 pt-1">
            {SWIGGY_FOOD_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => navigate(`/discovery?search=${encodeURIComponent(cat.query)}`)}
                className="flex flex-col items-center gap-2 group shrink-0 transition-transform hover:scale-105"
              >
                <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-full overflow-hidden border-2 border-white shadow-sm ring-1 ring-slate-200 group-hover:border-orange-500 group-hover:shadow-md transition-all shrink-0">
                  <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                </div>
                <span className="text-xs font-extrabold text-slate-800 group-hover:text-orange-600 transition-colors text-center whitespace-nowrap">
                  {cat.name}
                </span>
              </button>
            ))}
          </div>

          {/* 🌟 PREMIUM HORIZONTAL FOOD DISCOVERY CAROUSEL */}
          <div className="mt-8">
            <FoodDiscoveryCarousel />
          </div>
        </section>

        {/* SWIGGY DESKTOP/TABLET CAROUSEL 2: "Top Restaurant Chains in Hyderabad" */}
        <section className="max-w-7xl mx-auto px-4 sm:px-8 mt-14">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <Flame size={24} className="text-orange-500" />
                <span>Top Restaurant Chains in Hyderabad</span>
              </h2>
              <p className="text-slate-500 text-xs font-medium mt-0.5">Iconic dining and takeaway outlets</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-6">
            {TOP_CHAINS.map((chain) => (
              <div
                key={chain.id}
                onClick={() => navigate(`/discovery?search=${encodeURIComponent(chain.name)}`)}
                className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 cursor-pointer group flex flex-col justify-between"
              >
                <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                  <img
                    src={chain.image}
                    alt={chain.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3 bg-emerald-600 text-white text-xs font-black px-2 py-0.5 rounded-lg flex items-center gap-1 shadow-md">
                    <Star size={12} className="fill-white" />
                    <span>{chain.rating}</span>
                  </div>
                </div>
                <div className="p-4 space-y-1">
                  <h3 className="font-black text-slate-900 text-sm lg:text-base group-hover:text-orange-600 transition-colors truncate">
                    {chain.name}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium truncate">{chain.cuisine}</p>
                  <p className="text-[11px] font-bold text-orange-600 flex items-center gap-1 pt-1">
                    <Clock size={12} />
                    <span>{chain.eta} ETA</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* DESKTOP/TABLET RESTAURANT FEED WITH STICKY FILTER BAR */}
        <section className="max-w-7xl mx-auto px-4 sm:px-8 mt-14">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <Utensils size={24} className="text-orange-500" />
                <span>Explore Restaurants</span>
              </h2>
              <p className="text-slate-500 text-xs font-medium mt-0.5">Discover takeaway spots with live pickup ETAs</p>
            </div>
          </div>

          <div className="mb-6">
            <StickyFilterBar
              activeFilters={activeFilters}
              onFilterToggle={(id) => setActiveFilters((prev) => ({ ...prev, [id]: !prev[id] }))}
              sortBy={sortBy}
              onSortChange={setSortBy}
              totalResults={feedRestaurants.length}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {feedRestaurants.map((restaurant) => (
              <PremiumRestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))}
          </div>
        </section>
      </div>

      {/* LOCATION SELECTOR MODAL */}
      <AnimatePresence>
        {showLocationModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-2xl p-5 space-y-4 max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                  <MapPin size={18} className="text-orange-500" />
                  <span>Select Delivery / Pickup Area</span>
                </h3>
                <button
                  onClick={() => setShowLocationModal(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-full"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-1">
                {hyderabadLocations.map((loc) => {
                  const isSelected = selectedLocation.includes(loc.name)
                  return (
                    <button
                      key={loc.id}
                      onClick={() => {
                        setSelectedLocation(`${loc.name}, Hyderabad`)
                        setShowLocationModal(false)
                      }}
                      className={`w-full text-left p-3 rounded-xl flex items-center justify-between text-xs transition-colors ${
                        isSelected ? 'bg-orange-50 font-bold text-orange-700' : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <MapPin size={15} className={isSelected ? 'text-orange-600' : 'text-slate-400'} />
                        <div>
                          <p className="font-bold text-slate-900">{loc.name}</p>
                          <p className="text-[10px] text-slate-400">{loc.address}</p>
                        </div>
                      </div>
                      {isSelected && <Check size={14} className="text-orange-600" />}
                    </button>
                  )
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* NOTIFICATIONS MODAL */}
      <AnimatePresence>
        {showNotificationsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-2xl p-5 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                  <Bell size={18} className="text-orange-500" />
                  <span>Notifications</span>
                </h3>
                <button
                  onClick={() => setShowNotificationsModal(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-full"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 text-center text-slate-500 space-y-1">
                <Bell size={24} className="mx-auto text-slate-300 mb-2" />
                <p className="font-bold text-slate-800 text-sm">No new notifications</p>
                <p className="text-xs text-slate-400">You're all caught up for today!</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Order Widget */}
      <ActiveOrderWidget />
    </div>
  )
}
