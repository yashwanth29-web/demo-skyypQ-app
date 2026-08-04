import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Clock, TrendingUp, X, ChevronRight, Rocket } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

// Production Search Suggestions (Swiggy / Zomato style)
const TOP_20_SEARCHES = [
  { text: 'Pizza', type: 'Dish', subtitle: 'Pizzas, Cheese Burst & Garlic Bread' },
  { text: 'Chicken Biryani', type: 'Dish', subtitle: 'Paradise, Bawarchi, Shah Ghouse' },
  { text: 'Burger', type: 'Dish', subtitle: 'McDonald\'s, Burger King, KFC' },
  { text: 'Shawarma', type: 'Dish', subtitle: 'Mehfil, Shah Ghouse & Arabic' },
  { text: 'Momos', type: 'Dish', subtitle: 'Steamed & Fried Gourmet Momos' },
  { text: 'Dosa', type: 'Dish', subtitle: 'Chutneys & South Indian Tiffin' },
  { text: 'Fried Rice', type: 'Dish', subtitle: 'Indo-Chinese Special' },
  { text: 'Paneer Butter Masala', type: 'Dish', subtitle: 'North Indian Curry' },
  { text: 'Coffee', type: 'Beverage', subtitle: 'Starbucks & Artisan Cafes' },
  { text: 'Ice Cream', type: 'Dessert', subtitle: 'Sundaes & Gelato' },
  { text: "Domino's", type: 'Restaurant', subtitle: 'Pizzas & Garlic Bread • 15 mins' },
  { text: 'KFC', type: 'Restaurant', subtitle: 'Fried Chicken & Zinger Burgers' },
  { text: "McDonald's", type: 'Restaurant', subtitle: 'McSpicy Burgers & Fries' },
  { text: 'Burger King', type: 'Restaurant', subtitle: 'Whoppers & Crispy Chicken' },
  { text: 'Starbucks', type: 'Restaurant', subtitle: 'Iced Coffees & Bakery' },
  { text: 'Paradise', type: 'Restaurant', subtitle: 'World Famous Hyderabadi Biryani' },
  { text: 'South Indian', type: 'Cuisine', subtitle: 'Dosa, Idli & Chutneys' },
  { text: 'Chinese', type: 'Cuisine', subtitle: 'Noodles, Dim Sum & Fried Rice' },
  { text: 'North Indian', type: 'Cuisine', subtitle: 'Butter Chicken & Naan' },
  { text: 'Italian', type: 'Cuisine', subtitle: 'Pastas, Pizzas & Risotto' }
]

const RECENT_SEARCHES = ['Chicken Biryani', 'KFC', "Domino's", 'Paradise', 'Shawarma']

export default function SearchBarWithAutocomplete({ 
  placeholder = 'Search for restaurant, item or cuisine', 
  initialQuery = '', 
  className = '',
  onSelect
}) {
  const [query, setQuery] = useState(initialQuery)
  const [isOpen, setIsOpen] = useState(false)
  const wrapperRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    setQuery(initialQuery)
  }, [initialQuery])

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filteredSuggestions = query.trim()
    ? TOP_20_SEARCHES.filter(item =>
        item.text.toLowerCase().includes(query.toLowerCase()) ||
        item.subtitle.toLowerCase().includes(query.toLowerCase()) ||
        item.type.toLowerCase().includes(query.toLowerCase())
      )
    : TOP_20_SEARCHES

  const handleExecuteSearch = (searchTerm) => {
    const finalTerm = searchTerm || query
    if (!finalTerm.trim()) return
    setIsOpen(false)
    setQuery(finalTerm)
    if (onSelect) {
      onSelect(finalTerm)
    } else {
      navigate(`/discovery?search=${encodeURIComponent(finalTerm.trim())}`)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleExecuteSearch()
    }
  }

  return (
    <div ref={wrapperRef} className={`relative w-full ${className}`}>
      {/* Search Input Bar - Swiggy/Zomato Production Styling */}
      <div className="relative flex items-center bg-slate-100/90 focus-within:bg-white border border-slate-200 focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-400/20 rounded-2xl transition-all duration-150 shadow-2xs">
        <div className="pl-3.5 pr-1.5 text-orange-500 flex items-center justify-center">
          <Search size={18} className="shrink-0" />
        </div>

        <input
          type="text"
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value)
            setIsOpen(true)
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full py-2.5 pr-2 text-slate-800 text-sm font-medium placeholder:text-slate-400 bg-transparent outline-none border-none"
        />

        {query ? (
          <button
            onClick={() => {
              setQuery('')
              setIsOpen(true)
            }}
            className="pr-3 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={16} />
          </button>
        ) : (
          <div className="pr-3 flex items-center gap-1 text-[10px] font-black text-orange-600 bg-orange-50 px-2 py-0.5 rounded-lg border border-orange-200/80 shrink-0">
            <Rocket size={11} className="text-orange-500 animate-bounce" />
            <span className="hidden sm:inline">EXPRESS</span>
          </div>
        )}
      </div>

      {/* Production Dropdown Overlay (Clean list format) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.12 }}
            className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden max-h-[70vh] overflow-y-auto divide-y divide-slate-100"
          >
            {/* Recent Searches Header Row if empty query */}
            {!query.trim() && (
              <div className="p-3 bg-slate-50/60 border-b border-slate-100">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 mb-2">
                  <Clock size={13} />
                  <span>Recent Searches</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {RECENT_SEARCHES.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleExecuteSearch(item)}
                      className="px-3 py-1 bg-white hover:bg-slate-100 text-slate-700 text-xs font-medium rounded-md border border-slate-200 transition-colors"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Clean Single-Column Search Suggestion Rows */}
            <div className="p-1">
              {filteredSuggestions.length > 0 ? (
                filteredSuggestions.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleExecuteSearch(item.text)}
                    className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-slate-50 flex items-center justify-between transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <Search size={15} className="text-slate-400 shrink-0 group-hover:text-orange-500 transition-colors" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-800 text-sm group-hover:text-orange-600 transition-colors">
                            {item.text}
                          </span>
                          <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                            {item.type}
                          </span>
                        </div>
                        <p className="text-slate-400 text-xs mt-0.5">{item.subtitle}</p>
                      </div>
                    </div>
                    <ChevronRight size={14} className="text-slate-300 group-hover:text-slate-500" />
                  </button>
                ))
              ) : (
                <button
                  onClick={() => handleExecuteSearch()}
                  className="w-full text-left p-3 rounded-lg hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 font-medium text-sm"
                >
                  <Search size={16} className="text-orange-500" />
                  <span>Search for "{query}"</span>
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
