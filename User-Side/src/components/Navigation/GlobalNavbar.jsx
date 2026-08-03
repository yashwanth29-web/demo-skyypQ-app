import React from 'react'
import { Link as RouterLink, useLocation as useRouterLocation, useNavigate } from 'react-router-dom'
import { Home, User, Compass, Utensils, LogIn, LogOut } from 'lucide-react'
import { motion } from 'framer-motion'
import TopCartButton from '../cart/TopCartButton'
import useAuthStore from '../../store/useAuthStore'

export default function GlobalNavbar() {
  const location = useRouterLocation()
  const navigate = useNavigate()
  const path = location.pathname
  const { isAuthenticated, customer, logout } = useAuthStore()

  // Hide bottom navigation on focused ordering flow pages
  const HIDE_NAV_PATHS = ['/checkout', '/tracking', '/pickup', '/payment', '/success', '/order-success', '/login', '/register']
  const isHidden = HIDE_NAV_PATHS.some((route) => path.startsWith(route))

  if (isHidden) return null

  const navItems = [
    { label: 'Home',     path: '/',           icon: <Home size={18} /> },
    { label: 'Explore',  path: '/discovery',  icon: <Compass size={18} /> },
    { label: 'Profile',  path: '/profile',    icon: <User size={18} /> },
  ]

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <>
      {/* ── DESKTOP HEADER ─────────────────────────────────────────────────── */}
      <header className="hidden md:flex fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 text-slate-800 px-8 py-3.5 items-center justify-between shadow-sm">
        <RouterLink to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-gradient-to-tr from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center text-white shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform shrink-0">
            <Utensils size={20} />
          </div>
          <div>
            <span className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-orange-600 via-amber-600 to-rose-600 tracking-tight">
              SkYppQ
            </span>
            <span className="text-[10px] font-extrabold text-orange-600 block -mt-1 tracking-wider uppercase">
              Order before you arrive
            </span>
          </div>
        </RouterLink>

        {/* Nav + Auth */}
        <div className="flex items-center gap-4">
          <nav className="flex items-center gap-1.5 bg-slate-50 p-1.5 rounded-2xl border border-slate-200/60">
            {navItems.slice(0, 2).map((item) => {
              const isActive = item.path === '/'
                ? path === '/' || path === '/plan-route'
                : path.startsWith(item.path)
              return (
                <RouterLink
                  key={item.label}
                  to={item.path}
                  className={`relative px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                    isActive
                      ? 'text-orange-600 bg-white shadow-sm border border-orange-100 font-extrabold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </RouterLink>
              )
            })}
          </nav>

          <TopCartButton />

          {/* Auth section */}
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <RouterLink
                to="/profile"
                className="flex items-center gap-2 bg-orange-50 hover:bg-orange-100 border border-orange-200 px-3 py-2 rounded-xl transition-colors cursor-pointer"
              >
                <div className="w-6 h-6 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg flex items-center justify-center">
                  <User size={13} className="text-white" />
                </div>
                <span className="text-xs font-black text-slate-800">
                  {customer?.name?.split(' ')[0] || 'Profile'}
                </span>
              </RouterLink>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-3 py-2 rounded-xl text-xs font-black transition-colors cursor-pointer"
              >
                <LogOut size={13} />
              </button>
            </div>
          ) : (
            <RouterLink
              to="/login"
              className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-black text-xs px-4 py-2.5 rounded-xl transition-colors cursor-pointer shadow-md shadow-orange-500/20"
            >
              <LogIn size={14} /> Sign In
            </RouterLink>
          )}
        </div>
      </header>

      {/* ── MOBILE BOTTOM NAV ──────────────────────────────────────────────── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 pointer-events-none p-2.5 flex justify-center">
        <nav className="bg-white/95 backdrop-blur-md border border-slate-200/80 text-slate-700 rounded-3xl p-1.5 shadow-[0_8px_30px_rgba(0,0,0,0.08)] flex items-center justify-around w-[calc(100vw-1.5rem)] max-w-md pointer-events-auto relative">
          {/* Home */}
          {navItems.slice(0, 2).map((item) => {
            const isActive = item.path === '/'
              ? path === '/' || path === '/plan-route'
              : path.startsWith(item.path)
            return (
              <RouterLink
                key={item.label}
                to={item.path}
                className={`relative flex flex-col items-center gap-1 py-1.5 px-4 rounded-2xl text-[10px] font-bold transition-all duration-200 ${
                  isActive ? 'text-orange-600 font-extrabold' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTabBgMobile"
                    className="absolute inset-0 bg-orange-50 border border-orange-100 rounded-2xl z-0"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{item.icon}</span>
                <span className="relative z-10 tracking-tight">{item.label}</span>
              </RouterLink>
            )
          })}

          {/* Cart */}
          <div className="relative flex flex-col items-center gap-1 py-1.5 px-4">
            <TopCartButton compact />
          </div>

          {/* Auth / Profile */}
          {isAuthenticated ? (
            <RouterLink
              to="/profile"
              className={`relative flex flex-col items-center gap-1 py-1.5 px-4 rounded-2xl text-[10px] font-bold transition-all duration-200 ${
                path.startsWith('/profile') ? 'text-orange-600 font-extrabold' : 'text-slate-500'
              }`}
            >
              {path.startsWith('/profile') && (
                <motion.div
                  layoutId="activeTabBgMobile"
                  className="absolute inset-0 bg-orange-50 border border-orange-100 rounded-2xl z-0"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <div className="relative z-10 w-5 h-5 bg-gradient-to-br from-orange-500 to-amber-500 rounded-md flex items-center justify-center">
                <User size={12} className="text-white" />
              </div>
              <span className="relative z-10 tracking-tight">
                {customer?.name?.split(' ')[0] || 'Profile'}
              </span>
            </RouterLink>
          ) : (
            <RouterLink
              to="/login"
              className="relative flex flex-col items-center gap-1 py-1.5 px-4 rounded-2xl text-[10px] font-bold text-orange-600"
            >
              <div className="w-5 h-5 bg-orange-500 rounded-md flex items-center justify-center">
                <LogIn size={12} className="text-white" />
              </div>
              <span className="tracking-tight">Sign In</span>
            </RouterLink>
          )}
        </nav>
      </div>
    </>
  )
}
