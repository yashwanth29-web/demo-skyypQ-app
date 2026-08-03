import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Settings, LogOut, Car, Shield, Activity, TrendingUp, Store, ChevronRight } from 'lucide-react'
import useOwnerStore from '../store/useOwnerStore'

export default function Profile() {
  const { owner, logout } = useOwnerStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const menuItems = [
    { label: 'Watchman Valet Portal', description: 'Manage parking and vehicle retrievals', icon: Car, link: '/watchman', color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { label: 'Restaurant Settings', description: 'Configure menus, operating hours, and taxes', icon: Settings, link: '/settings', color: 'text-slate-500', bg: 'bg-slate-500/10' },
    { label: 'Performance Analytics', description: 'View sales, peak hours, and order volume', icon: TrendingUp, link: '#', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  ]

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      <header className="bg-white border-b border-slate-200 px-6 py-4 sm:py-6 pt-6 sm:pt-10 sticky top-0 z-30 shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Profile & Hub</h1>
          <p className="text-sm text-slate-500 font-medium hidden sm:block">Manage your restaurant operations</p>
        </div>
        <Link to="/dashboard" className="px-4 py-2 bg-slate-100 text-slate-700 font-bold text-sm rounded-xl hover:bg-slate-200 transition-colors">
          Back to Kitchen
        </Link>
      </header>

      <main className="max-w-2xl mx-auto px-4 pt-8 space-y-8">
        {/* Profile Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-md flex items-center gap-5">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center text-white shadow-inner shrink-0">
            <Store size={32} />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900">{owner?.restaurantName || 'Restaurant Name'}</h2>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-1">
              Owner ID: {owner?.username || 'admin'}
            </p>
          </div>
        </div>

        {/* Modules */}
        <div className="space-y-3">
          <h3 className="text-sm font-black uppercase text-slate-400 tracking-wider ml-2">App Modules</h3>
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm divide-y divide-slate-100 overflow-hidden">
            {menuItems.map((item, idx) => (
              <Link key={idx} to={item.link} className="flex items-center p-5 hover:bg-slate-50 transition-colors group">
                <div className={`w-12 h-12 rounded-2xl ${item.bg} ${item.color} flex items-center justify-center shrink-0`}>
                  <item.icon size={24} />
                </div>
                <div className="ml-4 flex-1">
                  <h4 className="text-base font-black text-slate-900">{item.label}</h4>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">{item.description}</p>
                </div>
                <ChevronRight size={20} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
              </Link>
            ))}
          </div>
        </div>

        {/* Logout */}
        <button onClick={handleLogout} className="w-full bg-white rounded-3xl p-5 border border-red-200 shadow-sm flex items-center justify-center gap-3 text-red-600 hover:bg-red-50 transition-colors font-black active:scale-95">
          <LogOut size={20} /> Logout
        </button>
      </main>
    </div>
  )
}
