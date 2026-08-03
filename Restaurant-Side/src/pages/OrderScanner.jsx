import React, { useEffect, useRef, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ScanLine, ArrowLeft, CheckCircle2, ShoppingBag,
  Clock, Search, Camera, CameraOff, RotateCcw,
  Shield, AlertCircle, Keyboard
} from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../lib/api'

const TOAST_STYLE = { borderRadius: '16px', background: '#1e293b', color: '#fff', border: '1px solid #334155' }

// ─── Parse QR payload ──────────────────────────────────────────────────────────
// Expected: SKYYQ:PICKUP:{pickupToken}
// Fallback:  plain 24-char hex token or 8-char short code
function parsePickupPayload(raw) {
  if (!raw) return null
  const trimmed = raw.trim()
  const parts = trimmed.split(':')
  if (parts[0] === 'SKYYQ' && parts[1] === 'PICKUP' && parts[2]) {
    return parts[2] // full 24-char token
  }
  // Fallback: treat raw as token directly
  return trimmed
}

// ─── Success Card ──────────────────────────────────────────────────────────────
function CompletedCard({ order }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden"
    >
      {/* Green success header */}
      <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.2, 1] }}
          transition={{ duration: 0.5 }}
          className="relative z-10"
        >
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 size={36} className="text-white" />
          </div>
          <h2 className="text-xl font-black text-white">
            {order.status === 'completed' ? 'Order Handed Over!' : 'Code Verified!'}
          </h2>
          <p className="text-emerald-100 text-sm font-medium mt-1">
            {order.status === 'completed' ? 'Customer verified & order completed' : 'Ready to hand over'}
          </p>
        </motion.div>
      </div>

      {/* Order summary */}
      <div className="p-5 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Order', value: order.displayId, mono: true },
            { label: 'Total', value: `₹${order.total}`, mono: true },
            { label: 'Customer', value: order.customerName || '—', mono: false },
            { label: 'Type', value: order.type || '—', mono: false },
          ].map(({ label, value, mono }) => (
            <div key={label} className="bg-slate-50 rounded-2xl p-3 border border-slate-100">
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">{label}</p>
              <p className={`text-sm font-black text-slate-900 mt-0.5 ${mono ? 'font-mono' : ''}`}>{value}</p>
            </div>
          ))}
        </div>

        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 flex items-center gap-2 text-sm font-bold text-emerald-700">
          <Shield size={16} className="text-emerald-500 shrink-0" />
          QR token verified — correct customer confirmed ✓
        </div>

        {order.items?.length > 0 && (
          <div className="space-y-2">
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Items</p>
            <div className="bg-slate-50 border border-slate-100 rounded-2xl divide-y divide-slate-100">
              {order.items.map((item, i) => (
                <div key={i} className="flex justify-between items-center px-4 py-2.5">
                  <p className="text-sm font-bold text-slate-900">{item.quantity}× {item.name}</p>
                  <span className="text-sm font-mono font-black text-slate-700">₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}

// ─── Main Scanner Page ─────────────────────────────────────────────────────────
export default function OrderScannerPage() {
  const navigate = useNavigate()

  const [mode, setMode] = useState('camera')      // 'camera' | 'manual'
  const [manualToken, setManualToken] = useState('')
  const [completedOrder, setCompletedOrder] = useState(null)
  const [isVerifying, setIsVerifying] = useState(false)
  const [isCompleting, setIsCompleting] = useState(false)
  const [cameraError, setCameraError] = useState(null)
  const [scanState, setScanState] = useState('idle') // 'idle' | 'scanning' | 'verifying' | 'success' | 'error'

  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const animFrameRef = useRef(null)
  const lastTokenRef = useRef(null)

  // ── Verify pickup token via backend ──────────────────────────────────────────
  const verifyToken = useCallback(async (rawToken) => {
    const token = rawToken?.trim()
    if (!token) return
    if (lastTokenRef.current === token) return
    lastTokenRef.current = token

    setIsVerifying(true)
    setScanState('verifying')

    // Stop camera during verification
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)

    try {
      const { data } = await api.post('/orders/verify-pickup', { pickupToken: token })
      setCompletedOrder(data.order)
      setScanState('success')
      toast.success('✅ Verification successful!', { style: TOAST_STYLE, duration: 4000 })
      // Stop camera stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop())
        streamRef.current = null
      }
    } catch (err) {
      const msg = err.response?.data?.error || 'Verification failed'
      setScanState('error')
      toast.error(`❌ ${msg}`, { style: { ...TOAST_STYLE, background: '#450a0a' }, duration: 4000 })
      lastTokenRef.current = null // allow retry
      // Resume camera scanning after 2s
      setTimeout(() => {
        setScanState('idle')
        if (mode === 'camera' && streamRef.current) {
          animFrameRef.current = requestAnimationFrame(scanFrame)
        }
      }, 2000)
    } finally {
      setIsVerifying(false)
    }
  }, [mode])

  // ── Hand Over Order ────────────────────────────────────────────────────────
  const handleHandOver = async () => {
    if (!completedOrder) return
    setIsCompleting(true)
    try {
      const { data } = await api.patch(`/orders/${completedOrder._id}/status`, { status: 'completed' })
      setCompletedOrder(data)
      toast.success('🎉 Order handed over and completed!', { style: TOAST_STYLE, duration: 4000 })
    } catch (err) {
      toast.error('❌ Failed to complete order', { style: TOAST_STYLE, duration: 4000 })
    } finally {
      setIsCompleting(false)
    }
  }

  // ── QR scan frame loop ────────────────────────────────────────────────────────
  const scanFrame = useCallback(() => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas || video.readyState < 2) {
      animFrameRef.current = requestAnimationFrame(scanFrame)
      return
    }

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

    if (window.jsQR) {
      const code = window.jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert',
      })
      if (code?.data) {
        const parsed = parsePickupPayload(code.data)
        if (parsed) {
          setScanState('verifying')
          verifyToken(parsed)
          return
        }
      }
    }

    animFrameRef.current = requestAnimationFrame(scanFrame)
  }, [verifyToken])

  // ── Start camera ──────────────────────────────────────────────────────────────
  const startCamera = useCallback(async () => {
    setCameraError(null)
    setScanState('idle')
    setCompletedOrder(null)
    lastTokenRef.current = null

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } }
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.setAttribute('playsinline', true)
        await videoRef.current.play()
      }
      animFrameRef.current = requestAnimationFrame(scanFrame)
    } catch (err) {
      setCameraError(
        err.name === 'NotAllowedError'
          ? 'Camera permission denied. Please allow camera access and try again.'
          : 'Camera unavailable. Use manual entry below.'
      )
    }
  }, [scanFrame])

  const stopCamera = useCallback(() => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
  }, [])

  useEffect(() => {
    if (mode === 'camera' && !completedOrder) startCamera()
    else stopCamera()
    return () => stopCamera()
  }, [mode])

  const handleRescan = () => {
    setCompletedOrder(null)
    setScanState('idle')
    lastTokenRef.current = null
    setManualToken('')
    if (mode === 'camera') startCamera()
  }

  const handleManualSubmit = (e) => {
    e.preventDefault()
    if (manualToken.trim()) {
      verifyToken(parsePickupPayload(manualToken) || manualToken)
    }
  }

  // ── Scan state overlay color ──────────────────────────────────────────────────
  const overlayMap = {
    verifying: { border: '#f97316', label: 'Verifying...', spin: true },
    error:     { border: '#ef4444', label: 'Invalid code', spin: false },
    success:   { border: '#22c55e', label: 'Verified!', spin: false },
    idle:      { border: '#f97316', label: 'Point at QR code', spin: false },
  }
  const overlay = overlayMap[scanState] || overlayMap.idle

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-28">
      {/* ── Header ── */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-lg mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => { stopCamera(); navigate('/dashboard') }}
              className="p-2 hover:bg-slate-100 rounded-full text-slate-600 transition-colors cursor-pointer">
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-base font-black text-slate-900 flex items-center gap-2">
                <ScanLine size={17} className="text-orange-500" />
                Scan Pickup Pass
              </h1>
              <p className="text-[11px] text-slate-400 font-medium">Verify customer QR to hand over order</p>
            </div>
          </div>

          {/* Mode toggle */}
          <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
            <button onClick={() => { setMode('camera'); setCompletedOrder(null) }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                mode === 'camera' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
              }`}>
              <Camera size={13} /> Scan
            </button>
            <button onClick={() => { setMode('manual'); setCompletedOrder(null); stopCamera() }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                mode === 'manual' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
              }`}>
              <Keyboard size={13} /> Code
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 sm:px-6 pt-6 space-y-6">

        {/* ── Camera Mode ── */}
        {mode === 'camera' && !completedOrder && (
          <div className="space-y-4">
            <div className="relative bg-slate-900 rounded-3xl overflow-hidden shadow-2xl"
              style={{ aspectRatio: '1 / 1' }}>

              {cameraError ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-8 text-center">
                  <div className="w-16 h-16 bg-red-500/15 rounded-2xl flex items-center justify-center">
                    <CameraOff size={28} className="text-red-400" />
                  </div>
                  <p className="text-slate-300 text-sm font-medium">{cameraError}</p>
                  <button onClick={startCamera}
                    className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-black text-sm px-5 py-2.5 rounded-xl cursor-pointer transition-colors">
                    <RotateCcw size={14} /> Retry
                  </button>
                </div>
              ) : (
                <>
                  <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
                  <canvas ref={canvasRef} className="hidden" />

                  {/* Scan overlay */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    {/* Dark corners */}
                    <div className="absolute inset-0 bg-black/40" style={{
                      WebkitMaskImage: 'radial-gradient(circle 120px at 50% 50%, transparent 120px, black 121px)',
                      maskImage: 'radial-gradient(circle 120px at 50% 50%, transparent 120px, black 121px)',
                    }} />

                    {/* Scan frame */}
                    <div style={{ width: 200, height: 200, position: 'relative' }}>
                      {/* Corner borders */}
                      {[
                        { top: 0, left: 0, borderTop: 3, borderLeft: 3, borderRadius: '10px 0 0 0' },
                        { top: 0, right: 0, borderTop: 3, borderRight: 3, borderRadius: '0 10px 0 0' },
                        { bottom: 0, left: 0, borderBottom: 3, borderLeft: 3, borderRadius: '0 0 0 10px' },
                        { bottom: 0, right: 0, borderBottom: 3, borderRight: 3, borderRadius: '0 0 10px 0' },
                      ].map((style, i) => (
                        <div key={i} style={{
                          position: 'absolute', width: 32, height: 32,
                          borderStyle: 'solid', borderColor: overlay.border, borderWidth: 0,
                          ...style, transition: 'border-color 0.3s',
                        }} />
                      ))}

                      {/* Animated scan line */}
                      {scanState === 'idle' && (
                        <div style={{
                          position: 'absolute', left: 8, right: 8,
                          height: 2, background: `${overlay.border}cc`,
                          animation: 'scanline 1.5s ease-in-out infinite alternate',
                        }} />
                      )}

                      {/* Status icon in center */}
                      {scanState === 'verifying' && (
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <svg className="animate-spin h-10 w-10" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="#f97316" strokeWidth="4" />
                            <path className="opacity-75" fill="#f97316" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Status bar */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 text-center">
                    <p className="text-white font-black text-sm" style={{ color: overlay.border }}>
                      {overlay.label}
                    </p>
                  </div>
                </>
              )}
            </div>

            <div className="text-center">
              <p className="text-xs text-slate-500 font-medium">
                Ask the customer to show their <span className="font-black text-slate-700">Pickup Pass</span> in the SkYppQ app
              </p>
            </div>
          </div>
        )}

        {/* ── Manual / Code Entry Mode ── */}
        {mode === 'manual' && !completedOrder && (
          <div className="space-y-4">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-orange-50 rounded-2xl flex items-center justify-center shrink-0">
                  <Shield size={20} className="text-orange-500" />
                </div>
                <div>
                  <h2 className="font-black text-slate-900">Enter Pickup Code</h2>
                  <p className="text-xs text-slate-500 font-medium mt-1">
                    Ask the customer to show their 8-character auth code from the pickup pass screen.
                    Enter the full token or the short code.
                  </p>
                </div>
              </div>

              <form onSubmit={handleManualSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-black uppercase text-slate-400 tracking-wider mb-2">
                    Auth Code / Pickup Token
                  </label>
                  <input
                    type="text"
                    value={manualToken}
                    onChange={(e) => setManualToken(e.target.value.toUpperCase())}
                    placeholder="e.g. A3F9C1B2 or full token"
                    maxLength={32}
                    className="w-full bg-slate-50 border-2 border-slate-200 focus:border-orange-500 text-slate-900 rounded-2xl px-4 py-3.5 text-sm font-black font-mono tracking-widest outline-none transition-colors uppercase"
                  />
                  <p className="text-[10px] text-slate-400 font-medium mt-1.5">
                    The code shown on the customer's Pickup Pass screen
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={!manualToken.trim() || isVerifying}
                  className="w-full py-4 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-black text-sm rounded-2xl flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 shadow-lg shadow-orange-500/25"
                >
                  {isVerifying ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Verifying...
                    </>
                  ) : (
                    <>
                      <Shield size={18} /> Verify Code
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Info */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
              <AlertCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800 font-medium leading-relaxed">
                The auth code is unique and changes with each order. Only the correct customer will have this code. This prevents unauthorized pickup.
              </p>
            </div>
          </div>
        )}

        {/* ── Success State ── */}
        <AnimatePresence>
          {completedOrder && (
            <div className="space-y-4">
              <CompletedCard order={completedOrder} />
              
              {completedOrder.status !== 'completed' ? (
                <button
                  onClick={handleHandOver}
                  disabled={isCompleting}
                  className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-black text-sm rounded-2xl flex items-center justify-center gap-2 cursor-pointer transition-all shadow-lg shadow-emerald-500/25"
                >
                  {isCompleting ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Completing...
                    </>
                  ) : (
                    <>✅ Hand Over to Customer</>
                  )}
                </button>
              ) : (
                <button
                  onClick={handleRescan}
                  className="w-full py-3.5 border-2 border-dashed border-slate-300 hover:border-orange-400 text-slate-500 hover:text-orange-600 font-black text-sm rounded-2xl flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <RotateCcw size={16} /> Scan Next Order
                </button>
              )}
            </div>
          )}
        </AnimatePresence>
      </main>

      <style>{`
        @keyframes scanline {
          from { top: 10px; opacity: 0.9; }
          to   { top: calc(100% - 12px); opacity: 0.9; }
        }
      `}</style>
    </div>
  )
}
