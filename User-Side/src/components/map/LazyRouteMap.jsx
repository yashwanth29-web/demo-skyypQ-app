import React, { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline, Circle } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { X, Navigation, MapPin, Utensils, Route, Compass } from 'lucide-react'
import PremiumRestaurantCard from '../restaurant/PremiumRestaurantCard'
import { generateRouteWaypoints } from '../../utils/routeUtils'

// Fix Leaflet's default icon path issues with Vite
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png'
})

// Identity-driven directional map marker (zero overlap guaranteed)
const createIdentityIcon = (restaurant, isSelected) => {
  const cuisineLower = (restaurant.cuisine || '').toLowerCase()
  const iconSymbol = cuisineLower.includes('pizza') ? '🍕'
    : cuisineLower.includes('burger') ? '🍔'
    : cuisineLower.includes('sushi') ? '🍣'
    : cuisineLower.includes('coffee') || cuisineLower.includes('pastries') ? '☕'
    : cuisineLower.includes('indian') || cuisineLower.includes('dining') ? '🍲'
    : cuisineLower.includes('mexican') || cuisineLower.includes('taco') ? '🌮'
    : '🍽'

  const rawName = restaurant.name || 'Outlet'
  const shortName = rawName.length > 13 ? rawName.substring(0, 12) + '…' : rawName
  const rating = restaurant.rating || '4.8'

  const isLeft = restaurant.side === 'left'

  return L.divIcon({
    className: 'restaurant-identity-marker',
    html: `<div style="
      background-color: white;
      color: #0f172a;
      padding: 4px 8px;
      border-radius: 9999px;
      box-shadow: ${isSelected ? '0 8px 24px rgba(249, 115, 22, 0.4)' : '0 2px 10px rgba(0, 0, 0, 0.15)'};
      border: ${isSelected ? '2px solid #f97316' : '1.5px solid #cbd5e1'};
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 11px;
      font-weight: 800;
      white-space: nowrap;
      transform: scale(${isSelected ? 1.15 : 1});
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      cursor: pointer;
      z-index: ${isSelected ? 1000 : 500};
    ">
      <span>${iconSymbol} ${shortName}</span>
      <span style="color: #d97706; font-size: 10px;">⭐ ${rating}</span>
    </div>`,
    iconSize: [115, 28],
    // Left pins anchor to their right edge (extend leftwards away from route line)
    // Right pins anchor to their left edge (extend rightwards away from route line)
    iconAnchor: isLeft ? [110, 14] : [-5, 14],
    popupAnchor: [0, -14]
  })
}

const FlyToMarker = ({ selectedPin, restaurants }) => {
  const map = useMap()
  useEffect(() => {
    if (selectedPin && restaurants) {
      const restaurant = restaurants.find((r) => r.id === selectedPin)
      if (restaurant && restaurant.coordinates) {
        map.flyTo([restaurant.coordinates.lat, restaurant.coordinates.lng], 15, {
          animate: true,
          duration: 1
        })
      }
    }
  }, [selectedPin, restaurants, map])
  return null
}

const FitRouteBounds = ({ routeCoordinates }) => {
  const map = useMap()
  useEffect(() => {
    if (routeCoordinates && routeCoordinates.length > 0) {
      const bounds = L.latLngBounds(routeCoordinates)
      map.fitBounds(bounds, { padding: [60, 60] })
    }
  }, [routeCoordinates ? routeCoordinates.length : 0, map])
  return null
}

const FitNearbyBounds = ({ restaurants, centerPoint }) => {
  const map = useMap()
  useEffect(() => {
    if (restaurants && restaurants.length > 0) {
      const points = restaurants.map((r) => [r.coordinates.lat, r.coordinates.lng])
      if (centerPoint) points.push(centerPoint)
      const bounds = L.latLngBounds(points)
      map.fitBounds(bounds, { padding: [60, 60] })
    }
  }, [restaurants, centerPoint, map])
  return null
}

export default function LazyRouteMap({
  restaurants = [],
  mode = 'nearby',
  radius = 3,
  centerPoint = [17.395, 78.465],
  routeCoordinates = [],
  startLat,
  startLng,
  endLat,
  endLng,
  onClose
}) {
  const [selectedPin, setSelectedPin] = useState(null)
  const selectedRestaurant = restaurants.find((r) => r.id === selectedPin)

  const sLat = startLat ? parseFloat(startLat) : 17.4156
  const sLng = startLng ? parseFloat(startLng) : 78.3425
  const eLat = endLat ? parseFloat(endLat) : 17.3616
  const eLng = endLng ? parseFloat(endLng) : 78.4747

  // Unified Route Waypoints connecting exact Start -> End coordinates
  const activeRoute = (routeCoordinates && routeCoordinates.length > 5)
    ? routeCoordinates
    : generateRouteWaypoints(sLat, sLng, eLat, eLng)

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex flex-col justify-end sm:justify-center p-0 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full h-[90vh] sm:h-[85vh] bg-white sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col border border-slate-200">
        {/* Map Header */}
        <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
          <div className="bg-white/95 backdrop-blur-md text-slate-900 px-4 py-2.5 rounded-2xl shadow-md border border-slate-200 flex items-center gap-3 pointer-events-auto">
            <div className="w-8 h-8 rounded-xl bg-orange-50 border border-orange-100 text-orange-600 flex items-center justify-center font-bold">
              {mode === 'route' ? <Route size={18} /> : <Compass size={18} />}
            </div>
            <div>
              <p className="text-xs font-black tracking-wide uppercase text-orange-600 flex items-center gap-1.5">
                <span>{mode === 'route' ? 'Route Corridor Map' : 'Nearby Outlets Map'}</span>
                <span className="text-[9px] font-extrabold bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-md border border-orange-200">
                  {mode === 'route' ? '2-KM CORRIDOR' : `${radius} KM RADIUS`}
                </span>
              </p>
              <p className="text-[11px] text-slate-500 font-bold">
                {restaurants.length} outlets mapped within {mode === 'route' ? '2-KM route corridor' : `${radius}km search area`}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 bg-white hover:bg-slate-100 text-slate-800 rounded-full flex items-center justify-center shadow-md border border-slate-200 pointer-events-auto transition-transform active:scale-95"
          >
            <X size={20} />
          </button>
        </div>

        {/* Canvas */}
        <div className="w-full h-full relative z-0">
          <MapContainer
            center={centerPoint}
            zoom={13}
            zoomControl={false}
            className="w-full h-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            />
            <FlyToMarker selectedPin={selectedPin} restaurants={restaurants} />

            {/* NEARBY MODE — RADIUS CIRCLE OVERLAY & FIT BOUNDS */}
            {mode === 'nearby' && (
              <>
                <Circle
                  center={centerPoint}
                  radius={Math.max(radius * 1000, 1800)}
                  pathOptions={{
                    color: '#f97316',
                    fillColor: '#f97316',
                    fillOpacity: 0.08,
                    weight: 2,
                    dashArray: '6, 6'
                  }}
                />
                <Marker
                  position={centerPoint}
                  icon={L.divIcon({
                    className: 'user-center-pin',
                    html: `<div style="
                      background-color: #3b82f6;
                      color: white;
                      padding: 4px 8px;
                      border-radius: 9999px;
                      font-size: 10px;
                      font-weight: 900;
                      box-shadow: 0 2px 10px rgba(59, 130, 246, 0.4);
                      border: 2px solid white;
                      white-space: nowrap;
                    ">🎯 Your Location</div>`,
                    iconSize: [90, 24],
                    iconAnchor: [45, 12]
                  })}
                />
                <FitNearbyBounds restaurants={restaurants} centerPoint={centerPoint} />
              </>
            )}

            {/* ROUTE MODE — 2-KM CORRIDOR & DRIVING POLYLINE */}
            {mode === 'route' && activeRoute && activeRoute.length > 0 && (
              <>
                {/* 1. 2-KM Outer Route Corridor Buffer Band */}
                <Polyline
                  positions={activeRoute}
                  pathOptions={{
                    color: '#f97316',
                    weight: 56,
                    opacity: 0.18,
                    lineCap: 'round',
                    lineJoin: 'round'
                  }}
                />

                {/* 2. Outer Route Line Shadow */}
                <Polyline
                  positions={activeRoute}
                  pathOptions={{
                    color: '#ea580c',
                    weight: 10,
                    opacity: 0.35,
                    lineCap: 'round',
                    lineJoin: 'round'
                  }}
                />

                {/* 3. Inner Active Directional Travel Polyline */}
                <Polyline
                  positions={activeRoute}
                  pathOptions={{
                    color: '#f97316',
                    weight: 5,
                    opacity: 0.95,
                    dashArray: '10, 10',
                    lineCap: 'round',
                    lineJoin: 'round'
                  }}
                />

                <FitRouteBounds routeCoordinates={activeRoute} />

                {/* Origin Marker */}
                <Marker
                  position={activeRoute[0]}
                  icon={L.divIcon({
                    className: 'route-origin-pin',
                    html: `<div style="background-color: #10b981; color: white; padding: 4px 8px; border-radius: 8px; font-size: 10px; font-weight: 900; box-shadow: 0 2px 8px rgba(0,0,0,0.3); border: 2px solid white; white-space: nowrap;">📍 Start</div>`,
                    iconSize: [50, 24],
                    iconAnchor: [25, 12]
                  })}
                />

                {/* Destination Marker */}
                <Marker
                  position={activeRoute[activeRoute.length - 1]}
                  icon={L.divIcon({
                    className: 'route-dest-pin',
                    html: `<div style="background-color: #ef4444; color: white; padding: 4px 8px; border-radius: 8px; font-size: 10px; font-weight: 900; box-shadow: 0 2px 8px rgba(0,0,0,0.3); border: 2px solid white; white-space: nowrap;">🏁 Destination</div>`,
                    iconSize: [80, 24],
                    iconAnchor: [40, 12]
                  })}
                />
              </>
            )}

            {/* Identity-Driven Restaurant Markers */}
            {restaurants.map((r) => {
              if (!r.coordinates || !r.coordinates.lat) return null
              return (
                <Marker
                  key={r.id}
                  position={[r.coordinates.lat, r.coordinates.lng]}
                  icon={createIdentityIcon(r, selectedPin === r.id)}
                  eventHandlers={{
                    click: () => setSelectedPin(r.id)
                  }}
                >
                  <Popup className="font-sans font-bold shadow-md rounded-xl">
                    <div className="p-1 text-center">
                      <p className="font-extrabold text-slate-900">{r.name}</p>
                      <p className="text-xs text-orange-600 font-bold">{r.cuisine}</p>
                      <p className="text-[11px] text-slate-400 font-semibold">{r.eta || '15 mins pickup'}</p>
                    </div>
                  </Popup>
                </Marker>
              )
            })}
          </MapContainer>
        </div>

        {/* Selected Restaurant Floating Bottom Card */}
        {selectedRestaurant && (
          <div className="absolute bottom-4 left-4 right-4 z-20 max-w-md mx-auto">
            <PremiumRestaurantCard restaurant={selectedRestaurant} isRouteView={mode === 'route'} />
          </div>
        )}
      </div>
    </div>
  )
}
