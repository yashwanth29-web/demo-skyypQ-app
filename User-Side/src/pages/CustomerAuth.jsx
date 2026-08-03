import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Phone, Mail, User, Lock, Eye, EyeOff, ArrowRight, ChevronLeft, Utensils } from 'lucide-react'
import useAuthStore from '../store/useAuthStore'

function FloatingInput({ label, icon: Icon, error, ...inputProps }) {
  const [focused, setFocused] = useState(false)
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-extrabold text-slate-400 uppercase tracking-widest">{label}</label>
      <div
        className="relative rounded-2xl transition-all duration-200"
        style={{
          background: 'rgba(255,255,255,0.06)',
          border: `1.5px solid ${focused ? '#f97316' : 'rgba(255,255,255,0.12)'}`,
          boxShadow: focused ? '0 0 0 3px rgba(249,115,22,0.12)' : 'none',
        }}
      >
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
          <Icon size={16} />
        </div>
        <input
          {...inputProps}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="w-full bg-transparent text-white placeholder-slate-600 text-sm font-medium pl-11 pr-4 py-3.5 outline-none rounded-2xl"
        />
      </div>
      {error && <p className="text-xs text-red-400 font-semibold pl-1">{error}</p>}
    </div>
  )
}

export default function CustomerAuthPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, register, isLoading, error, clearError, isAuthenticated } = useAuthStore()

  const [tab, setTab] = useState(
    location.pathname === '/register' || location.state?.tab === 'register' ? 'register' : 'login'
  )
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' })
  const [fieldErrors, setFieldErrors] = useState({})

  const from = location.state?.from || '/'

  useEffect(() => {
    if (isAuthenticated) navigate(from, { replace: true })
  }, [isAuthenticated])

  const handleChange = (e) => {
    clearError()
    setFieldErrors((prev) => ({ ...prev, [e.target.name]: undefined }))
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const validate = () => {
    const errs = {}
    if (tab === 'register') {
      if (!form.name.trim()) errs.name = 'Name is required'
      if (!form.email.includes('@')) errs.email = 'Enter a valid email'
    }
    if (!form.phone || form.phone.replace(/\D/g, '').length < 10)
      errs.phone = 'Enter a valid 10-digit phone number'
    if (!form.password || form.password.length < 6)
      errs.password = 'Password must be at least 6 characters'
    setFieldErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    let result
    if (tab === 'login') {
      result = await login({ phone: form.phone, password: form.password })
    } else {
      result = await register({ name: form.name, email: form.email, phone: form.phone, password: form.password })
    }

    if (result.success) navigate(from, { replace: true })
  }

  const switchTab = (t) => {
    clearError()
    setFieldErrors({})
    setForm({ name: '', email: '', phone: '', password: '' })
    setTab(t)
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: 'linear-gradient(145deg, #0f172a 0%, #1e1a2e 45%, #1c1007 100%)' }}
    >
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="fixed top-5 left-5 flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-xs font-bold transition-colors cursor-pointer z-10"
      >
        <ChevronLeft size={16} /> Back
      </button>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center gap-2.5 mb-3 px-5 py-3 rounded-2xl font-black text-white text-lg"
            style={{ background: 'linear-gradient(135deg, #ea580c, #f97316)', boxShadow: '0 8px 32px rgba(234,88,12,0.35)' }}
          >
            <Utensils size={20} />
            SkYppQ
          </div>
          <p className="text-slate-500 text-sm font-medium">
            {tab === 'login' ? 'Welcome back! Sign in to continue.' : 'Create your account to order.'}
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-3xl p-7 space-y-5"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(24px)',
            boxShadow: '0 32px 80px rgba(0,0,0,0.5)',
          }}
        >
          {/* Tab switcher */}
          <div
            className="flex gap-1 p-1 rounded-2xl"
            style={{ background: 'rgba(255,255,255,0.07)' }}
          >
            {['login', 'register'].map((t) => (
              <button
                key={t}
                onClick={() => switchTab(t)}
                className="flex-1 py-2.5 rounded-xl text-xs font-black transition-all duration-200 cursor-pointer"
                style={{
                  background: tab === t ? '#f97316' : 'transparent',
                  color: tab === t ? '#fff' : '#64748b',
                  boxShadow: tab === t ? '0 4px 16px rgba(249,115,22,0.3)' : 'none',
                }}
              >
                {t === 'login' ? '✦ Sign In' : '✧ Register'}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.form
              key={tab}
              onSubmit={handleSubmit}
              initial={{ opacity: 0, x: tab === 'login' ? -12 : 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="space-y-4"
            >
              {/* Register-only fields */}
              {tab === 'register' && (
                <>
                  <FloatingInput
                    label="Full Name"
                    icon={User}
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="e.g. Arjun Reddy"
                    autoComplete="name"
                    error={fieldErrors.name}
                  />
                  <FloatingInput
                    label="Email Address"
                    icon={Mail}
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    autoComplete="email"
                    error={fieldErrors.email}
                  />
                </>
              )}

              {/* Phone */}
              <FloatingInput
                label="Phone Number"
                icon={Phone}
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="10-digit mobile number"
                autoComplete="tel"
                maxLength={10}
                error={fieldErrors.phone}
              />

              {/* Password */}
              <div className="space-y-1.5">
                <label className="block text-xs font-extrabold text-slate-400 uppercase tracking-widest">Password</label>
                <div
                  className="relative rounded-2xl transition-all duration-200"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1.5px solid rgba(255,255,255,0.12)' }}
                >
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder={tab === 'register' ? 'Min. 6 characters' : 'Your password'}
                    autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
                    className="w-full bg-transparent text-white placeholder-slate-600 text-sm font-medium pl-11 pr-12 py-3.5 outline-none rounded-2xl"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {fieldErrors.password && <p className="text-xs text-red-400 font-semibold pl-1">{fieldErrors.password}</p>}
              </div>

              {/* Demo hint */}
              {tab === 'login' && (
                <div
                  className="rounded-xl px-4 py-3 text-xs"
                  style={{ background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.2)' }}
                >
                  <span className="text-orange-400 font-black">💡 Demo — </span>
                  <span className="text-slate-400">Phone: </span>
                  <button
                    type="button"
                    className="text-orange-400 font-black hover:underline cursor-pointer"
                    onClick={() => setForm((p) => ({ ...p, phone: '9876543210', password: 'skyyq@123' }))}
                  >
                    9876543210
                  </button>
                  <span className="text-slate-400"> · Password: </span>
                  <span className="font-mono text-orange-400">skyyq@123</span>
                </div>
              )}

              {/* API Error */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="rounded-xl px-4 py-3 text-xs font-semibold text-red-300"
                    style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)' }}
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 rounded-2xl font-black text-sm text-white flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed mt-2"
                style={{
                  background: isLoading ? 'rgba(249,115,22,0.5)' : 'linear-gradient(135deg, #ea580c, #f97316)',
                  boxShadow: isLoading ? 'none' : '0 6px 24px rgba(249,115,22,0.35)',
                }}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    {tab === 'login' ? 'Signing in...' : 'Creating account...'}
                  </>
                ) : (
                  <>
                    {tab === 'login' ? '🍽️ Sign In & Order' : '✨ Create Account'}
                    <ArrowRight size={17} />
                  </>
                )}
              </button>

              {/* Switch */}
              <p className="text-center text-xs text-slate-600 font-medium pt-1">
                {tab === 'login' ? "Don't have an account? " : 'Already have an account? '}
                <button
                  type="button"
                  onClick={() => switchTab(tab === 'login' ? 'register' : 'login')}
                  className="text-orange-500 font-black hover:text-orange-400 cursor-pointer"
                >
                  {tab === 'login' ? 'Register' : 'Sign in'}
                </button>
              </p>
            </motion.form>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}
