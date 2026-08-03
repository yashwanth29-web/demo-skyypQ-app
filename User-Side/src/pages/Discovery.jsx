import React, { useState, useEffect, useMemo, Suspense, lazy } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Search, Navigation, Utensils, Flame, Map, RefreshCw, ChevronRight } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'

import SearchBarWithAutocomplete from '../components/search/SearchBarWithAutocomplete'
import PremiumRestaurantCard from '../components/restaurant/PremiumRestaurantCard'
import FoodItemCard from '../components/restaurant/FoodItemCard'
import StickyFilterBar from '../components/restaurant/StickyFilterBar'
import CollectionsSection from '../components/restaurant/CollectionsSection'
import ActiveOrderWidget from '../components/ActiveOrderWidget'

import { fetchRestaurants, fetchAllMenuData } from '../api/restaurantApi'
import { fetchRoute } from '../api/routingApi'
import { generateRouteWaypoints, mapRestaurantsAlongRoute } from '../utils/routeUtils'
import hyderabadLocations from '../mock/hyderabad_locations.json'

// Lazy Load Map Component
const LazyRouteMap = lazy(() => import('../components/map/LazyRouteMap'))
import useOrderStore from '../store/useOrderStore'

export default function DiscoveryPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()

  const mode = searchParams.get('mode') || 'nearby'
  const searchQuery = searchParams.get('search') || ''
  const radius = parseFloat(searchParams.get('radius')) || 5

  const nearbyLat = parseFloat(searchParams.get('lat'))
  const nearbyLng = parseFloat(searchParams.get('lng'))

  const startLat = searchParams.get('startLat')
  const startLng = searchParams.get('startLng')
  const endLat = searchParams.get('endLat')
  const endLng = searchParams.get('endLng')
  const startNameParam = searchParams.get('startName')
  const endNameParam = searchParams.get('endName')

  // Map visibility modal state
  const [showMapModal, setShowMapModal] = useState(false)
  const { orders } = useOrderStore()
  
  const hasActiveOrders = orders.some((o) => o.isCustomerOrder && !['completed', 'cancelled'].includes(o.status))

  // Filters & Sorting state
  const [activeFilters, setActiveFilters] = useState({})
  const [sortBy, setSortBy] = useState('Recommended')
  const collectionParam = searchParams.get('collection')
  const [selectedCollection, setSelectedCollection] = useState(collectionParam || null)

  // Keep selectedCollection in sync with URL param
  React.useEffect(() => {
    if (collectionParam) {
      setSelectedCollection(collectionParam)
    }
  }, [collectionParam])

  // Fetch Restaurants Data
  const { data: restaurantsData, isLoading: restaurantsLoading } = useQuery({
    queryKey: ['restaurants'],
    queryFn: fetchRestaurants
  })

  // Fetch Menu Items Data
  const { data: menuData } = useQuery({
    queryKey: ['allMenuData'],
    queryFn: fetchAllMenuData
  })

  // Fetch Route Data if mode is route
  const { data: routeCoordinates } = useQuery({
    queryKey: ['route', startLng, startLat, endLng, endLat],
    queryFn: () => fetchRoute(startLng, startLat, endLng, endLat),
    enabled: !!(startLat && startLng && endLat && endLng && mode === 'route')
  })

  const handleFilterToggle = (filterId) => {
    setActiveFilters((prev) => ({
      ...prev,
      [filterId]: !prev[filterId]
    }))
  }

  // Base list
  const baseRestaurants = useMemo(() => {
    if (!restaurantsData) return []

    let list = [...restaurantsData]

    if (mode === 'nearby' && nearbyLat && nearbyLng) {
      const count = Math.min(list.length, 10)
      const selected = list.slice(0, count)
      list = selected.map((r, idx) => {
        // Enforce radial separation so pins radiate evenly in 360 degrees without overlapping
        const angle = (idx / count) * 2 * Math.PI
        const minRadialOffset = 0.009 + (idx % 3) * 0.004
        return {
          ...r,
          coordinates: {
            lat: nearbyLat + minRadialOffset * Math.cos(angle),
            lng: nearbyLng + minRadialOffset * Math.sin(angle) * 1.3
          }
        }
      })
    } else if (mode === 'route') {
      const sLat = startLat ? parseFloat(startLat) : 17.4143
      const sLng = startLng ? parseFloat(startLng) : 78.3432
      const eLat = endLat ? parseFloat(endLat) : 17.3616
      const eLng = endLng ? parseFloat(endLng) : 78.4747

      const activeRouteCoords = (routeCoordinates && routeCoordinates.length > 5)
        ? routeCoordinates
        : generateRouteWaypoints(sLat, sLng, eLat, eLng)

      list = mapRestaurantsAlongRoute(list, activeRouteCoords)
    }

    return list
  }, [restaurantsData, mode, nearbyLat, nearbyLng, radius, routeCoordinates, startLat, startLng, endLat, endLng])

  // Filter & Search Logic
  const { filteredRestaurants, matchingDishes } = useMemo(() => {
    let resultRestaurants = [...baseRestaurants]
    let resultDishes = []

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      const allRestaurants = restaurantsData || baseRestaurants

      if (menuData) {
        resultDishes = menuData.filter(
          (m) =>
            m.name.toLowerCase().includes(q) ||
            m.category?.toLowerCase().includes(q) ||
            m.description?.toLowerCase().includes(q)
        )
      }

      resultRestaurants = allRestaurants.filter((r) => {
        const nameMatch = r.name.toLowerCase().includes(q) ||
          r.cuisine.toLowerCase().includes(q) ||
          (r.offer && r.offer.toLowerCase().includes(q))
        const dishMatch = resultDishes.some((d) => d.restaurantId === r.id)
        return nameMatch || dishMatch
      })

      if (resultRestaurants.length === 0 && resultDishes.length > 0) {
        const restIds = new Set(resultDishes.map(d => d.restaurantId))
        resultRestaurants = allRestaurants.filter(r => restIds.has(r.id))
      }
    }

    if (activeFilters.vegOnly) {
      resultRestaurants = resultRestaurants.filter((r) => r.cuisine.toLowerCase().includes('vegetarian'))
    }
    if (activeFilters.hasOffers) {
      resultRestaurants = resultRestaurants.filter((r) => !!r.offer)
    }
    if (activeFilters.topRated) {
      resultRestaurants = resultRestaurants.filter((r) => parseFloat(r.rating) >= 4.5)
    }
    if (activeFilters.fastPickup) {
      resultRestaurants = resultRestaurants.filter((r) => (r.preparationTime || 15) <= 15)
    }
    if (activeFilters.nearMe) {
      resultRestaurants = resultRestaurants.filter((r) => parseFloat(r.distance) <= 2.0)
    }

    if (selectedCollection === 'trending') {
      resultRestaurants = resultRestaurants.filter((r) => parseFloat(r.rating) >= 4.5)
    } else if (selectedCollection === 'offers') {
      resultRestaurants = resultRestaurants.filter((r) => !!r.offer)
    } else if (selectedCollection === 'fast') {
      resultRestaurants = resultRestaurants.filter((r) => (r.preparationTime || 15) <= 15)
    } else if (selectedCollection === 'recommended') {
      resultRestaurants = resultRestaurants.filter((r) => r.priceForTwo ? r.priceForTwo <= 400 : parseFloat(r.rating) >= 4.5)
    }

    if (sortBy === 'Best Rated') {
      resultRestaurants.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating))
    } else if (sortBy === 'Nearest') {
      resultRestaurants.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance))
    } else if (sortBy === 'Trending' || sortBy === 'Most Popular') {
      resultRestaurants.sort((a, b) => (b.preparationTime || 0) - (a.preparationTime || 0))
    }

    return {
      filteredRestaurants: resultRestaurants,
      matchingDishes: resultDishes
    }
  }, [baseRestaurants, searchQuery, menuData, activeFilters, selectedCollection, sortBy])

  const mapCenterPoint = useMemo(() => {
    if (nearbyLat && nearbyLng) return [nearbyLat, nearbyLng]
    if (startLat && startLng) return [parseFloat(startLat), parseFloat(startLng)]
    return [17.395, 78.465]
  }, [nearbyLat, nearbyLng, startLat, startLng])

  const routeStartLabel = useMemo(() => {
    if (startNameParam) return startNameParam
    if (!startLat || !startLng) return 'Financial District'
    const match = hyderabadLocations.find(
      (l) => Math.abs(l.lat - parseFloat(startLat)) < 0.005 && Math.abs(l.lng - parseFloat(startLng)) < 0.005
    )
    return match ? match.name : 'Origin Location'
  }, [startNameParam, startLat, startLng])

  const routeEndLabel = useMemo(() => {
    if (endNameParam) return endNameParam
    if (!endLat || !endLng) return 'Charminar'
    const match = hyderabadLocations.find(
      (l) => Math.abs(l.lat - parseFloat(endLat)) < 0.005 && Math.abs(l.lng - parseFloat(endLng)) < 0.005
    )
    return match ? match.name : 'Destination'
  }, [endNameParam, endLat, endLng])

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pt-0 md:pt-20 pb-36 sm:pb-40 font-sans">
      {/* Clean Production Header & Search Bar */}
      <div className="bg-white border-b border-slate-200 py-3.5 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto space-y-3">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="p-2 hover:bg-slate-100 text-slate-700 rounded-lg transition-colors"
            >
              <ArrowLeft size={18} />
            </Link>

            <div className="flex-1 max-w-2xl">
              <SearchBarWithAutocomplete
                initialQuery={searchQuery}
                placeholder="Search for restaurant, item or cuisine"
                onSelect={(term) => {
                  setSearchParams({ search: term })
                }}
              />
            </div>
          </div>

          {/* Route Summary (Only when mode === 'route') */}
          {mode === 'route' && (
            <div className="p-3 bg-slate-100 rounded-xl border border-slate-200 max-w-2xl flex items-center justify-between gap-3 text-xs font-semibold text-slate-800">
              <div className="flex items-center gap-2">
                <Navigation size={15} className="text-orange-500 shrink-0" />
                <span>
                  {routeStartLabel} <span className="text-slate-400">➔</span> {routeEndLabel}
                </span>
              </div>
              <div className="flex items-center gap-2 text-slate-500 font-medium">
                <span>18 km</span>
                <span>•</span>
                <span>22 mins</span>
                <span className="font-bold text-orange-600">({filteredRestaurants.length} places)</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sticky Filter Bar */}
      <StickyFilterBar
        activeFilters={activeFilters}
        onFilterToggle={handleFilterToggle}
        sortBy={sortBy}
        onSortChange={setSortBy}
        totalResults={filteredRestaurants.length}
      />

      {/* Main Feed Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 mt-4">
        {/* Curated Collections */}
        {!searchQuery && (
          <CollectionsSection
            selectedId={selectedCollection}
            onSelectCollection={(id) =>
              setSelectedCollection((prev) => (prev === id ? null : id))
            }
          />
        )}

        {/* Dedicated Collection Header Banner */}
        {searchParams.get('collection') && (
          <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-rose-600 text-white p-5 sm:p-7 rounded-3xl mb-6 shadow-xl border border-orange-400/40 relative overflow-hidden">
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate('/')}
                    className="p-1.5 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-xl text-white transition-colors cursor-pointer shrink-0"
                    title="Back to Home"
                  >
                    <ArrowLeft size={16} />
                  </button>
                  <h1 className="text-xl sm:text-3xl font-black tracking-tight drop-shadow-xs">
                    {searchParams.get('title') || 'Curated Food Collection'}
                  </h1>
                </div>
                <p className="text-xs sm:text-sm text-orange-100 font-medium pl-0.5">
                  {searchParams.get('desc') || 'Explore handpicked takeaway restaurants matching your choice'}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="bg-white/25 backdrop-blur-md text-white text-xs font-black px-3 py-1.5 rounded-xl border border-white/30 shadow-xs">
                  {filteredRestaurants.length} {filteredRestaurants.length === 1 ? 'restaurant' : 'restaurants'} found
                </span>
                <button
                  onClick={() => setSearchParams({})}
                  className="px-3.5 py-1.5 bg-white text-orange-600 hover:bg-orange-50 rounded-xl text-xs font-black transition-all cursor-pointer shadow-md active:scale-95"
                >
                  View All
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Section Heading */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-lg font-bold text-slate-900">
              {searchQuery ? (
                <span>Results for "{searchQuery}"</span>
              ) : searchParams.get('collection') ? (
                <span>{searchParams.get('title') || 'Curated Collection'}</span>
              ) : mode === 'route' ? (
                <span>Restaurants Along Your Route</span>
              ) : (
                <span>Popular Restaurants Near You</span>
              )}
            </h1>
          </div>

          {(searchQuery || searchParams.get('collection')) && (
            <button
              onClick={() => setSearchParams({})}
              className="text-xs font-semibold text-orange-600 hover:underline cursor-pointer"
            >
              Clear all
            </button>
          )}
        </div>

        {/* Dish Matching Results */}
        {searchQuery && matchingDishes.length > 0 && (
          <div className="mb-8 space-y-3">
            <h2 className="text-sm font-bold text-slate-800">
              Top Matching Dishes ({matchingDishes.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {matchingDishes.slice(0, 6).map((item) => (
                <FoodItemCard
                  key={item.id}
                  item={item}
                  restaurantName={
                    restaurantsData?.find((r) => r.id === item.restaurantId)?.name || 'Paradise Biryani'
                  }
                />
              ))}
            </div>
          </div>
        )}

        {/* Restaurant Feed */}
        {restaurantsLoading ? (
          <div className={searchParams.get('collection') ? "flex flex-col space-y-6 max-w-3xl mx-auto" : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"}>
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="h-72 bg-slate-200/60 rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : filteredRestaurants.length > 0 ? (
          <div className={
            searchParams.get('collection')
              ? "flex flex-col space-y-6 sm:space-y-8 max-w-3xl mx-auto"
              : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
          }>
            {filteredRestaurants.map((restaurant) => (
              <PremiumRestaurantCard
                key={restaurant.id}
                restaurant={restaurant}
                isRouteView={mode === 'route'}
              />
            ))}
          </div>
        ) : (
          <div className="p-10 text-center bg-white rounded-2xl border border-slate-200 max-w-md mx-auto my-8">
            <h3 className="text-base font-bold text-slate-900">No matching restaurants found</h3>
            <p className="text-xs text-slate-500 mt-1">
              Try adjusting your search query or filters.
            </p>
            <button
              onClick={() => {
                setActiveFilters({})
                setSearchParams({})
              }}
              className="mt-4 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-xs font-semibold transition-colors"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Floating Action Button for Map */}
      <div className={`fixed right-6 z-30 transition-all duration-300 ${hasActiveOrders ? 'bottom-[160px] md:bottom-[240px]' : 'bottom-20 md:bottom-8'}`}>
        <button
          onClick={() => setShowMapModal(true)}
          className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-full font-bold text-xs shadow-lg flex items-center gap-2 transition-transform hover:scale-105 active:scale-95"
        >
          <Map size={15} />
          <span>{mode === 'route' ? 'View Route Map' : 'View Nearby Map'}</span>
        </button>
      </div>

      {/* Lazy Loaded Map Overlay */}
      {showMapModal && (
        <Suspense
          fallback={
            <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center text-white font-bold">
              <div className="flex items-center gap-3 bg-white text-slate-900 p-4 rounded-2xl shadow-lg">
                <RefreshCw size={18} className="animate-spin text-orange-500" />
                <span>Loading Map...</span>
              </div>
            </div>
          }
        >
          <LazyRouteMap
            restaurants={filteredRestaurants}
            mode={mode}
            radius={radius}
            centerPoint={mapCenterPoint}
            routeCoordinates={routeCoordinates}
            startLat={startLat}
            startLng={startLng}
            endLat={endLat}
            endLng={endLng}
            onClose={() => setShowMapModal(false)}
          />
        </Suspense>
      )}

      {/* Active Order Widget */}
      <ActiveOrderWidget />
    </div>
  )
}
