import React, { useState, useMemo } from 'react'
import { ArrowLeft, Clock, MapPin, User, Navigation, Utensils, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import LOCATIONS from '../mock/hyderabad_locations.json'

export default function RoutePlannerPage() {
  const navigate = useNavigate()

  const [startInputText, setStartInputText] = useState('')
  const [selectedStartLoc, setSelectedStartLoc] = useState(null)
  const [showStartAutocomplete, setShowStartAutocomplete] = useState(false)

  const [destInputText, setDestInputText] = useState('')
  const [selectedDestLoc, setSelectedDestLoc] = useState(null)
  const [showDestAutocomplete, setShowDestAutocomplete] = useState(false)

  const [showForWho, setShowForWho] = useState(false)
  const [forWho, setForWho] = useState('For me')

  const [showPickupTime, setShowPickupTime] = useState(false)
  const [pickupTime, setPickupTime] = useState('After 10 min')

  const filteredStartLocations = useMemo(() => {
    if (!startInputText.trim()) return LOCATIONS
    return LOCATIONS.filter(
      (loc) => loc.name.toLowerCase().includes(startInputText.toLowerCase()) || loc.address.toLowerCase().includes(startInputText.toLowerCase())
    )
  }, [startInputText])

  const filteredDestLocations = useMemo(() => {
    if (!destInputText.trim()) return LOCATIONS
    return LOCATIONS.filter(
      (loc) => loc.name.toLowerCase().includes(destInputText.toLowerCase()) || loc.address.toLowerCase().includes(destInputText.toLowerCase())
    )
  }, [destInputText])

  const handleExploreRoute = () => {
    const sLoc = selectedStartLoc || LOCATIONS[0]
    const dLoc = selectedDestLoc || LOCATIONS[1]
    navigate(`/discovery?mode=route&startLat=${sLoc.lat}&startLng=${sLoc.lng}&endLat=${dLoc.lat}&endLng=${dLoc.lng}`)
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans pt-16">
      {/* Header */}
      <header className="p-4 flex items-center justify-center relative bg-white border-b border-slate-200">
        <button
          onClick={() => navigate(-1)}
          className="absolute left-4 p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-700"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-base font-extrabold flex items-center gap-2 text-slate-900">
          <Navigation size={18} className="text-orange-500" />
          <span>Plan Your Pickup Route</span>
        </h1>
      </header>

      {/* Controls */}
      <div className="px-4 py-3 flex gap-2 relative bg-white border-b border-slate-200">
        <div className="relative">
          <button
            onClick={() => setShowPickupTime(!showPickupTime)}
            className="bg-white border border-slate-200 text-xs font-bold px-3.5 py-2 rounded-full flex items-center gap-2 hover:bg-slate-50 text-slate-700"
          >
            <Clock size={14} className="text-slate-500" /> {pickupTime}{' '}
            <span className="text-[10px] ml-0.5 text-slate-400">▼</span>
          </button>

          {showPickupTime && (
            <div className="absolute top-full left-0 mt-2 w-40 bg-white border border-slate-100 rounded-xl shadow-xl overflow-hidden z-50">
              {['After 10 min', 'After 20 min', 'After 30 min'].map((option) => (
                <button
                  key={option}
                  onClick={() => {
                    setPickupTime(option)
                    setShowPickupTime(false)
                  }}
                  className="w-full text-left px-4 py-2.5 text-xs hover:bg-slate-50 text-slate-700 font-medium"
                >
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => setShowForWho(!showForWho)}
            className="bg-white border border-slate-200 text-xs font-bold px-3.5 py-2 rounded-full flex items-center gap-2 hover:bg-slate-50 text-slate-700"
          >
            <User size={14} className="text-slate-500" /> {forWho}{' '}
            <span className="text-[10px] ml-0.5 text-slate-400">▼</span>
          </button>

          {showForWho && (
            <div className="absolute top-full left-0 mt-2 w-40 bg-white border border-slate-100 rounded-xl shadow-xl overflow-hidden z-50">
              {['For me', 'Friend', 'Family', 'Other'].map((option) => (
                <button
                  key={option}
                  onClick={() => {
                    setForWho(option)
                    setShowForWho(false)
                  }}
                  className="w-full text-left px-4 py-2.5 text-xs hover:bg-slate-50 text-slate-700 font-medium"
                >
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Google Maps Style Location Autocomplete Form */}
      <div className="p-4 bg-white border-b border-slate-200 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="relative">
            <label className="text-[11px] font-extrabold uppercase text-slate-400 block mb-1">
              Start Location
            </label>
            <div className="relative">
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
                className="w-full bg-slate-50 border border-slate-200 focus:border-orange-500 p-3 pl-9 rounded-2xl text-xs font-bold text-slate-800 outline-none transition-colors"
              />
              <MapPin size={16} className="absolute left-3 top-3.5 text-emerald-600" />
            </div>

            {showStartAutocomplete && filteredStartLocations.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden max-h-56 overflow-y-auto divide-y divide-slate-100">
                {filteredStartLocations.map((loc) => (
                  <button
                    key={loc.id}
                    onClick={() => {
                      setSelectedStartLoc(loc)
                      setStartInputText(loc.name)
                      setShowStartAutocomplete(false)
                    }}
                    className="w-full text-left p-3 hover:bg-orange-50 flex items-center justify-between text-xs transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-slate-400 shrink-0" />
                      <div>
                        <p className="font-bold text-slate-800">{loc.name}</p>
                        <p className="text-[10px] text-slate-400">{loc.address}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative">
            <label className="text-[11px] font-extrabold uppercase text-slate-400 block mb-1">
              Destination
            </label>
            <div className="relative">
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
                className="w-full bg-slate-50 border border-slate-200 focus:border-orange-500 p-3 pl-9 rounded-2xl text-xs font-bold text-slate-800 outline-none transition-colors"
              />
              <Navigation size={16} className="absolute left-3 top-3.5 text-rose-500" />
            </div>

            {showDestAutocomplete && filteredDestLocations.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden max-h-56 overflow-y-auto divide-y divide-slate-100">
                {filteredDestLocations.map((loc) => (
                  <button
                    key={loc.id}
                    onClick={() => {
                      setSelectedDestLoc(loc)
                      setDestInputText(loc.name)
                      setShowDestAutocomplete(false)
                    }}
                    className="w-full text-left p-3 hover:bg-orange-50 flex items-center justify-between text-xs transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Navigation size={14} className="text-slate-400 shrink-0" />
                      <div>
                        <p className="font-bold text-slate-800">{loc.name}</p>
                        <p className="text-[10px] text-slate-400">{loc.address}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <button
          onClick={handleExploreRoute}
          className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-extrabold rounded-2xl text-xs sm:text-sm tracking-wide shadow-sm active:scale-98 transition-all flex items-center justify-center gap-2"
        >
          <Utensils size={16} />
          <span>Explore Restaurants Along Route</span>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}
