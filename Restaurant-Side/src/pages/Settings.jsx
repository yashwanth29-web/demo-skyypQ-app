import React, { useState, useEffect } from 'react'
import { QRCodeCanvas } from 'qrcode.react'
import { motion } from 'framer-motion'
import { Copy, Download, Check, ArrowLeft, Store, ToggleLeft, ToggleRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import useOwnerStore from '../store/useOwnerStore'
import api from '../lib/api'

export default function SettingsPage() {
  const navigate = useNavigate()
  const { owner } = useOwnerStore()
  const [restaurant, setRestaurant] = useState(null)
  const [copied, setCopied] = useState(false)
  const [saving, setSaving] = useState(false)

  const customerAppUrl = import.meta.env.VITE_CUSTOMER_APP_URL || 'http://localhost:5173'
  const qrUrl = `${customerAppUrl}/r/${owner?.restaurantId}`

  useEffect(() => {
    if (owner?.restaurantId) {
      api.get(`/restaurants/${owner.restaurantId}`)
        .then(({ data }) => setRestaurant(data))
        .catch(() => {})
    }
  }, [owner?.restaurantId])

  const handleCopyLink = () => {
    navigator.clipboard.writeText(qrUrl)
    setCopied(true)
    toast.success('Link copied!', { style: { borderRadius: '16px', background: '#1e293b', color: '#fff' } })
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownloadQR = () => {
    const canvas = document.getElementById('restaurant-qr-canvas')
    if (!canvas) return
    const url = canvas.toDataURL('image/png')
    const a = document.createElement('a')
    a.href = url
    a.download = `${owner?.restaurantName || 'restaurant'}-qr.png`
    a.click()
    toast.success('QR downloaded!', { style: { borderRadius: '16px', background: '#1e293b', color: '#fff' } })
  }

  const handleToggleValet = async () => {
    if (!restaurant) return
    setSaving(true)
    try {
      const { data } = await api.patch(`/restaurants/${owner.restaurantId}`, {
        valetEnabled: !restaurant.valetEnabled
      })
      setRestaurant(data)
      toast.success(`Valet ${data.valetEnabled ? 'enabled' : 'disabled'}`, {
        style: { borderRadius: '16px', background: '#1e293b', color: '#fff' }
      })
    } catch {
      toast.error('Failed to update')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pt-16 pb-28">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-slate-100 rounded-full text-slate-600 transition-colors cursor-pointer">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-base font-black text-slate-900">Settings</h1>
            <p className="text-[11px] text-slate-500 font-medium">{owner?.restaurantName}</p>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* Restaurant Info */}
        <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Store size={18} className="text-orange-500" />
            <h2 className="font-black text-slate-900">Restaurant Profile</h2>
          </div>
          {restaurant ? (
            <div className="grid grid-cols-2 gap-4 text-sm">
              {[
                { label: 'Name', value: restaurant.name },
                { label: 'Cuisine', value: restaurant.cuisine },
                { label: 'Rating', value: `⭐ ${restaurant.rating}` },
                { label: 'Address', value: restaurant.address || 'Hyderabad' },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-[10px] font-black uppercase text-slate-400">{label}</p>
                  <p className="font-bold text-slate-900 mt-0.5 truncate">{value}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-16 bg-slate-100 rounded-2xl animate-pulse" />
          )}

          {/* Valet toggle */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <div>
              <p className="text-sm font-black text-slate-900">Valet Service</p>
              <p className="text-xs text-slate-500">Allow customers to select valet option</p>
            </div>
            <button onClick={handleToggleValet} disabled={saving}
              className="cursor-pointer transition-colors disabled:opacity-50">
              {restaurant?.valetEnabled
                ? <ToggleRight size={36} className="text-orange-500" />
                : <ToggleLeft size={36} className="text-slate-300" />}
            </button>
          </div>
        </motion.section>

        {/* QR Code */}
        <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="font-black text-slate-900">📱 Restaurant QR Code</h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Customers scan this to instantly open your menu — no searching needed.
            </p>
          </div>

          {/* QR Display */}
          <div className="flex flex-col items-center gap-4">
            <div className="p-5 bg-white border-2 border-slate-200 rounded-3xl shadow-md">
              <QRCodeCanvas
                id="restaurant-qr-canvas"
                value={qrUrl}
                size={200}
                bgColor="#ffffff"
                fgColor="#1e293b"
                level="H"
                includeMargin={false}
              />
            </div>

            <p className="text-xs text-slate-500 font-mono text-center break-all bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">
              {qrUrl}
            </p>

            <div className="flex gap-3 w-full">
              <button onClick={handleCopyLink}
                className="flex-1 flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black py-3 rounded-2xl text-sm transition-colors cursor-pointer">
                {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                {copied ? 'Copied!' : 'Copy Link'}
              </button>
              <button onClick={handleDownloadQR}
                className="flex-1 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-black py-3 rounded-2xl text-sm transition-colors cursor-pointer shadow-md shadow-orange-500/20">
                <Download size={16} /> Download QR
              </button>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-800 font-medium">
            💡 <span className="font-black">Tip:</span> Print this QR code and place it on your counter, table tent, or entrance. When customers scan it, they're taken directly to your menu.
          </div>
        </motion.section>
      </main>
    </div>
  )
}
