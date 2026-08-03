import React, { useState } from 'react'
import { SlidersHorizontal, ChevronDown, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function StickyFilterBar({
  activeFilters = {},
  onFilterToggle,
  sortBy = 'Recommended',
  onSortChange,
  totalResults = 0
}) {
  const [showSortDropdown, setShowSortDropdown] = useState(false)

  const filterOptions = [
    { id: 'vegOnly', label: 'Pure Veg' },
    { id: 'hasOffers', label: 'Offers' },
    { id: 'topRated', label: 'Ratings 4.5+' },
    { id: 'fastPickup', label: 'Fast Pickup (<15 mins)' },
    { id: 'nearMe', label: 'Under 2 km' },
    { id: 'openNow', label: 'Open Now' }
  ]

  const sortOptions = [
    'Recommended',
    'Best Rated',
    'Nearest',
    'Trending',
    'Most Popular'
  ]

  return (
    <div className="sticky top-14 md:top-16 z-30 bg-white border-b border-slate-200/80 py-2.5 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 overflow-x-auto hide-scrollbar">
        {/* Filter Chips */}
        <div className="flex items-center gap-2 shrink-0">
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-800 text-xs font-semibold rounded-lg border border-slate-200 hover:bg-slate-200/60 transition-colors">
            <SlidersHorizontal size={13} className="text-slate-600" />
            <span>Filter</span>
          </button>

          {filterOptions.map((f) => {
            const isActive = activeFilters[f.id]
            return (
              <button
                key={f.id}
                onClick={() => onFilterToggle && onFilterToggle(f.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1 border ${
                  isActive
                    ? 'bg-orange-50 text-orange-700 border-orange-300 font-semibold'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span>{f.label}</span>
                {isActive && <Check size={12} className="text-orange-600" />}
              </button>
            )
          })}
        </div>

        {/* Sort & Count */}
        <div className="flex items-center gap-3 shrink-0 ml-auto">
          {totalResults > 0 && (
            <span className="hidden sm:inline-block text-xs font-medium text-slate-400">
              {totalResults} {totalResults === 1 ? 'place' : 'places'}
            </span>
          )}

          <div className="relative">
            <button
              onClick={() => setShowSortDropdown((prev) => !prev)}
              className="flex items-center gap-1 px-3 py-1.5 bg-white text-slate-700 text-xs font-medium rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              <span>Sort: {sortBy}</span>
              <ChevronDown size={14} className="text-slate-400" />
            </button>

            <AnimatePresence>
              {showSortDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  className="absolute right-0 mt-1.5 w-44 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden z-50 p-1"
                >
                  {sortOptions.map((option) => (
                    <button
                      key={option}
                      onClick={() => {
                        onSortChange && onSortChange(option)
                        setShowSortDropdown(false)
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                        sortBy === option
                          ? 'bg-orange-50 text-orange-700 font-semibold'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span>{option}</span>
                      {sortBy === option && <Check size={13} className="text-orange-600" />}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}
