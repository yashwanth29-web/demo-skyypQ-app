import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import {
  ArrowLeft, TrendingUp, ShoppingBag,
  DollarSign, Wallet, RefreshCw
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import useOwnerStore from '../store/useOwnerStore'
import api from '../lib/api'

const TOAST_STYLE = { borderRadius: '16px', background: '#1e293b', color: '#fff', border: '1px solid #334155' }

const StatCard = ({ icon: Icon, label, value, sub, color = 'orange' }) => {
  const colors = {
    orange: { bg: 'bg-orange-50', text: 'text-orange-600', icon: 'text-orange-500' },
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-700', icon: 'text-emerald-500' },
    blue: { bg: 'bg-blue-50', text: 'text-blue-700', icon: 'text-blue-500' },
    slate: { bg: 'bg-slate-100', text: 'text-slate-700', icon: 'text-slate-500' },
  }
  const c = colors[color]
  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-3">
      <div className={`w-10 h-10 ${c.bg} ${c.icon} rounded-2xl flex items-center justify-center`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">{label}</p>
        <p className={`text-2xl font-black font-mono mt-0.5 ${c.text}`}>{value}</p>
        {sub && <p className="text-xs text-slate-400 font-medium mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-slate-900 text-white px-3 py-2 rounded-xl text-xs font-bold shadow-lg">
      <p className="text-slate-400 mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color }}>
          {p.name}: {p.dataKey === 'revenue' ? `₹${p.value}` : p.value}
        </p>
      ))}
    </div>
  )
}

export default function AnalyticsPage() {
  const navigate = useNavigate()
  const { owner } = useOwnerStore()

  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)

  const fetchAnalytics = async () => {
    if (!owner?.restaurantId) return
    setIsLoading(true)
    try {
      const { data: res } = await api.get(`/analytics/${owner.restaurantId}`)
      setData(res)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to load analytics', { style: TOAST_STYLE })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { fetchAnalytics() }, [owner?.restaurantId])

  const handleProcessPayout = async () => {
    if (!owner?.restaurantId) return
    setIsProcessing(true)
    try {
      const { data: res } = await api.post(`/analytics/${owner.restaurantId}/payout`)
      toast.success(`✅ Payout of ₹${res.payout.amount} processed!`, { style: TOAST_STYLE })
      fetchAnalytics()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Payout failed', { style: TOAST_STYLE })
    } finally {
      setIsProcessing(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <svg className="animate-spin h-8 w-8 text-orange-500 mx-auto" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-slate-500 text-sm font-bold">Loading analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pt-16 pb-28">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/dashboard')}
            className="p-2 hover:bg-slate-100 rounded-full text-slate-600 transition-colors cursor-pointer">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-base font-black text-slate-900">Analytics</h1>
            <p className="text-[11px] text-slate-500 font-medium">{owner?.restaurantName}</p>
          </div>
        </div>
        <button onClick={fetchAnalytics}
          className="flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 px-3 py-1.5 rounded-xl text-xs font-black transition-colors cursor-pointer">
          <RefreshCw size={14} /> Refresh
        </button>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard icon={ShoppingBag} label="Total Orders" value={data?.totalOrders ?? 0} sub={`${data?.completedOrders ?? 0} completed`} color="blue" />
          <StatCard icon={TrendingUp} label="Gross Revenue" value={`₹${data?.grossRevenue?.toLocaleString() ?? 0}`} sub="All completed orders" color="orange" />
          <StatCard icon={DollarSign} label="Net Revenue" value={`₹${data?.netRevenue?.toLocaleString() ?? 0}`} sub="After 10% platform fee" color="emerald" />
          <StatCard icon={Wallet} label="Pending Payout" value={`₹${data?.pendingPayout?.toLocaleString() ?? 0}`} sub="Ready to withdraw" color="slate" />
        </div>

        {/* Payout */}
        {data?.pendingPayout > 0 && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-3xl p-5 flex items-center justify-between shadow-lg shadow-emerald-500/20">
            <div className="text-white">
              <p className="text-xs font-black uppercase tracking-wider text-emerald-100">Available Payout</p>
              <p className="text-3xl font-black font-mono mt-0.5">₹{data.pendingPayout.toLocaleString()}</p>
            </div>
            <button onClick={handleProcessPayout} disabled={isProcessing}
              className="bg-white text-emerald-700 font-black px-5 py-3 rounded-2xl text-sm transition-all hover:shadow-md active:scale-98 cursor-pointer disabled:opacity-60 flex items-center gap-2">
              {isProcessing
                ? <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                : <Wallet size={16} />}
              {isProcessing ? 'Processing...' : 'Process Payout'}
            </button>
          </motion.div>
        )}

        {/* Orders per Day Chart */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h2 className="font-black text-slate-900 text-base">Orders — Last 7 Days</h2>
          {data?.dailyStats?.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data.dailyStats} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fontWeight: 700, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fontWeight: 700, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="orders" name="Orders" fill="#f97316" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-40 flex items-center justify-center text-slate-400 text-sm font-bold">No data yet</div>
          )}
        </div>

        {/* Revenue Trend Chart */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h2 className="font-black text-slate-900 text-base">Revenue Trend — Last 7 Days</h2>
          {data?.dailyStats?.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={data.dailyStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fontWeight: 700, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fontWeight: 700, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v}`} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#f97316" strokeWidth={3} dot={{ fill: '#f97316', r: 5 }} activeDot={{ r: 7 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-40 flex items-center justify-center text-slate-400 text-sm font-bold">No data yet</div>
          )}
        </div>

        {/* Recent Payouts */}
        {data?.recentPayouts?.length > 0 && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h2 className="font-black text-slate-900 text-base">Recent Payouts</h2>
            <div className="space-y-2">
              {data.recentPayouts.map((p) => (
                <div key={p._id} className="flex items-center justify-between py-2.5 border-b border-slate-100 last:border-0">
                  <div>
                    <p className="text-sm font-bold text-slate-900">{p.note}</p>
                    <p className="text-xs text-slate-400 font-medium">
                      {new Date(p.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <span className="text-sm font-black text-emerald-600">₹{p.amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
