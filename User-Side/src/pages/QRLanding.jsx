import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { QrCode, Utensils, ArrowRight } from 'lucide-react'
import api from '../lib/api'
import useRestaurantStore from '../store/useRestaurantStore'

export default function QRLandingPage() {
  const { restaurantId } = useParams()
  const navigate = useNavigate()
  const { restaurants } = useRestaurantStore()

  const [restaurant, setRestaurant] = useState(null)
  const [countdown, setCountdown] = useState(2)

  useEffect(() => {
    const load = async () => {
      // Try store first for instant display
      const cached = restaurants.find((r) => r.id === restaurantId)
      if (cached) {
        setRestaurant(cached)
      } else {
        try {
          const { data } = await api.get(`/restaurants/${restaurantId}`)
          setRestaurant(data)
        } catch {
          // Fallback — just navigate to restaurant page
          navigate(`/restaurant/${restaurantId}`, { replace: true })
        }
      }
    }
    load()
  }, [restaurantId])

  // Auto-navigate countdown
  useEffect(() => {
    if (!restaurant) return
    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(timer)
          navigate(`/restaurant/${restaurantId}`)
        }
        return c - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [restaurant, restaurantId, navigate])

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="text-center"
      >
        {/* QR Icon */}
        <motion.div
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.1 }}
          className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl"
        >
          <QrCode size={36} className="text-white" />
        </motion.div>

        {/* Greeting */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-white/80 text-sm font-bold uppercase tracking-widest mb-2">
            Welcome to
          </p>
          <h1 className="text-4xl font-black text-white mb-2 drop-shadow-sm">
            {restaurant?.name || 'Loading...'}
          </h1>
          <p className="text-white/70 text-base font-medium mb-8">
            {restaurant?.cuisine || ''}
          </p>
        </motion.div>

        {/* Divider */}
        <div className="flex items-center gap-3 justify-center mb-8">
          <div className="h-px w-16 bg-white/30" />
          <Utensils size={16} className="text-white/60" />
          <div className="h-px w-16 bg-white/30" />
        </div>

        {/* Countdown */}
        {restaurant && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="space-y-4"
          >
            <p className="text-white/80 text-sm font-semibold">
              Opening menu in{' '}
              <span className="font-black text-white text-lg">{countdown}</span>s...
            </p>

            {/* Manual navigate */}
            <button
              onClick={() => navigate(`/restaurant/${restaurantId}`)}
              className="inline-flex items-center gap-2 bg-white text-orange-600 font-black px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all active:scale-98 cursor-pointer text-sm"
            >
              View Menu Now <ArrowRight size={16} />
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
