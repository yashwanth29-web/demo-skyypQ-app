import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Utensils, User, Lock, Eye, EyeOff, ChevronRight, ArrowRight } from 'lucide-react'
import useOwnerStore from '../store/useOwnerStore'
import api from '../lib/api'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login, register, isLoading, error, clearError, isAuthenticated } = useOwnerStore()

  const [tab, setTab] = useState('login')
  const [showPassword, setShowPassword] = useState(false)
  const [restaurants, setRestaurants] = useState([])
  const [form, setForm] = useState({ restaurantId: '', username: '', password: '' })

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true })
  }, [isAuthenticated])

  useEffect(() => {
    if (tab === 'register') {
      api.get('/restaurants').then(({ data }) => setRestaurants(data)).catch(() => {})
    }
  }, [tab])

  const handleChange = (e) => {
    clearError()
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    let result
    if (tab === 'login') {
      result = await login({ username: form.username, password: form.password })
    } else {
      result = await register({ restaurantId: form.restaurantId, username: form.username, password: form.password })
    }
    if (result.success) navigate('/dashboard', { replace: true })
  }

  const switchTab = (t) => {
    clearError()
    setTab(t)
    setForm({ restaurantId: '', username: '', password: '' })
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 40%, #431407 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        style={{ width: '100%', maxWidth: '440px' }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: '#ea580c', color: '#fff', padding: '12px 24px', borderRadius: '16px', fontWeight: 900, fontSize: '20px', letterSpacing: '-0.5px', marginBottom: '10px', boxShadow: '0 8px 32px rgba(234,88,12,0.4)' }}>
            <Utensils size={22} />
            SkYppQ Kitchen
          </div>
          <p style={{ color: '#94a3b8', fontSize: '14px', fontWeight: 500 }}>Restaurant Owner Portal</p>
        </div>

        {/* Card */}
        <div style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '24px', padding: '32px', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', boxShadow: '0 32px 64px rgba(0,0,0,0.5)' }}>

          {/* Tab switcher */}
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.08)', borderRadius: '14px', padding: '4px', marginBottom: '28px', gap: '4px' }}>
            {['login', 'register'].map((t) => (
              <button
                key={t}
                onClick={() => switchTab(t)}
                style={{
                  flex: 1, padding: '10px', borderRadius: '10px', fontSize: '13px', fontWeight: 800,
                  border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                  background: tab === t ? '#ea580c' : 'transparent',
                  color: tab === t ? '#fff' : '#94a3b8',
                  boxShadow: tab === t ? '0 4px 16px rgba(234,88,12,0.35)' : 'none',
                }}
              >
                {t === 'login' ? 'Sign In' : 'New Account'}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.form
              key={tab}
              onSubmit={handleSubmit}
              initial={{ opacity: 0, x: tab === 'login' ? -16 : 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
            >
              {/* Restaurant dropdown — register only */}
              {tab === 'register' && (
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px' }}>
                    Your Restaurant
                  </label>
                  <select
                    name="restaurantId"
                    value={form.restaurantId}
                    onChange={handleChange}
                    required
                    style={{ width: '100%', background: 'rgba(255,255,255,0.08)', border: '1.5px solid rgba(255,255,255,0.15)', color: form.restaurantId ? '#fff' : '#64748b', borderRadius: '12px', padding: '12px 16px', fontSize: '14px', fontWeight: 500, outline: 'none', cursor: 'pointer', boxSizing: 'border-box' }}
                  >
                    <option value="" style={{ background: '#1e293b', color: '#64748b' }}>Select your restaurant...</option>
                    {restaurants.map((r) => (
                      <option key={r.id} value={r.id} style={{ background: '#1e293b', color: '#fff' }}>{r.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Username */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px' }}>
                  Username
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#475569', pointerEvents: 'none' }} />
                  <input
                    type="text"
                    name="username"
                    value={form.username}
                    onChange={handleChange}
                    required
                    autoComplete="username"
                    placeholder={tab === 'register' ? 'e.g. chutneys_owner' : 'Your username'}
                    style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1.5px solid rgba(255,255,255,0.12)', color: '#f1f5f9', borderRadius: '12px', padding: '12px 16px 12px 42px', fontSize: '14px', fontWeight: 500, outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' }}
                    onFocus={e => e.target.style.borderColor = '#ea580c'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px' }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#475569', pointerEvents: 'none' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    minLength={6}
                    autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
                    placeholder={tab === 'register' ? 'Min. 6 characters' : 'Enter password'}
                    style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1.5px solid rgba(255,255,255,0.12)', color: '#f1f5f9', borderRadius: '12px', padding: '12px 48px 12px 42px', fontSize: '14px', fontWeight: 500, outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' }}
                    onFocus={e => e.target.style.borderColor = '#ea580c'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#475569', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Credential hint */}
              {tab === 'login' && (
                <div style={{ background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.25)', borderRadius: '12px', padding: '12px 14px', fontSize: '12px', color: '#fbbf24', lineHeight: 1.6 }}>
                  <span style={{ fontWeight: 800 }}>💡 Seeded credentials — </span>
                  username: <code style={{ background: 'rgba(0,0,0,0.2)', padding: '1px 5px', borderRadius: '4px', fontFamily: 'monospace' }}>r-chutneys_owner</code>
                  {' '} password: <code style={{ background: 'rgba(0,0,0,0.2)', padding: '1px 5px', borderRadius: '4px', fontFamily: 'monospace' }}>skyyq@123</code>
                </div>
              )}

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', borderRadius: '12px', padding: '12px 14px', fontSize: '13px', fontWeight: 600 }}
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                style={{
                  width: '100%', padding: '14px', background: isLoading ? 'rgba(234,88,12,0.5)' : '#ea580c',
                  color: '#fff', fontWeight: 900, fontSize: '15px', borderRadius: '14px',
                  border: 'none', cursor: isLoading ? 'not-allowed' : 'pointer',
                  boxShadow: isLoading ? 'none' : '0 6px 24px rgba(234,88,12,0.4)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  transition: 'all 0.2s', marginTop: '4px',
                }}
              >
                {isLoading ? (
                  <>
                    <svg style={{ animation: 'spin 1s linear infinite', height: '18px', width: '18px' }} viewBox="0 0 24 24" fill="none">
                      <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Signing in...
                  </>
                ) : (
                  <>
                    {tab === 'login' ? '🍳 Enter Kitchen' : '✨ Create Account'}
                    <ArrowRight size={18} />
                  </>
                )}
              </button>

              {/* Switch tab */}
              <p style={{ textAlign: 'center', fontSize: '13px', color: '#475569', fontWeight: 500, marginTop: '4px' }}>
                {tab === 'login' ? "Don't have an account? " : 'Already have an account? '}
                <button
                  type="button"
                  onClick={() => switchTab(tab === 'login' ? 'register' : 'login')}
                  style={{ background: 'none', border: 'none', color: '#ea580c', fontWeight: 800, cursor: 'pointer', fontSize: '13px' }}
                >
                  {tab === 'login' ? 'Create account' : 'Sign in'}
                </button>
              </p>
            </motion.form>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <p style={{ textAlign: 'center', color: '#334155', fontSize: '12px', fontWeight: 500, marginTop: '20px' }}>
          SkYppQ Kitchen Manager · Zero-Wait Guarantee
        </p>
      </motion.div>

      {/* Spin keyframe */}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
