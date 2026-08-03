import React, { useState } from 'react'
import { Car, MapPin, QrCode, Sparkles, CheckCircle2, Clock, Navigation, ShieldCheck, AlertCircle } from 'lucide-react'
import useValetStore from '../../store/useValetStore'

export default function ValetTrackingCard({ valetRequest }) {
  const { markCustomerArrived, requestVehicleRetrieval } = useValetStore()
  const [showQrModal, setShowQrModal] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)

  if (!valetRequest) return null

  const status = valetRequest.currentStatus

  const handleImHere = () => {
    markCustomerArrived(valetRequest.id)
  }

  const handleConfirmRetrieval = () => {
    requestVehicleRetrieval(valetRequest.id)
    setShowConfirmModal(false)
  }

  return (
    <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-xl border border-slate-800 space-y-4 my-4 relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold">
            <Car size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm tracking-wide text-amber-400">Valet Service</h3>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 font-extrabold px-2 py-0.5 rounded-full border border-amber-500/30">
                {valetRequest.tokenNumber}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {valetRequest.vehicleType} • {valetRequest.vehicleNumber}
            </p>
          </div>
        </div>

        <span className="text-xs font-bold px-2.5 py-1 rounded-full border bg-slate-800 text-slate-300 border-slate-700">
          {status}
        </span>
      </div>

      {/* State 1: WAITING -> Show "I'm Here" button */}
      {status === 'WAITING' && (
        <div className="space-y-3 pt-1">
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-200/90 leading-relaxed flex items-start gap-2">
            <MapPin size={16} className="text-amber-400 shrink-0 mt-0.5" />
            <span>
              Press <strong>"I'm Here"</strong> as soon as you reach the restaurant valet drop-off area to notify the watchman.
            </span>
          </div>

          <button
            type="button"
            onClick={handleImHere}
            className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-extrabold rounded-xl shadow-lg shadow-amber-500/20 text-sm tracking-wide flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            <Navigation size={18} />
            I'm Here! Notify Watchman
          </button>
        </div>
      )}

      {/* State 2: ARRIVED -> Waiting for watchman receipt */}
      {status === 'ARRIVED' && (
        <div className="p-3.5 bg-blue-500/10 border border-blue-500/20 rounded-xl text-xs text-blue-200 space-y-2">
          <div className="flex items-center gap-2 font-bold text-blue-400 text-sm">
            <Clock size={16} className="animate-spin" />
            Watchman Notified!
          </div>
          <p>
            Please hand over your keys to Watchman <strong>{valetRequest.watchmanName || 'Ramesh Kumar'}</strong> at the valet bay.
          </p>
        </div>
      )}

      {/* State 3: PARKED -> Digital Valet Ticket & "Request My Vehicle" */}
      {(status === 'PARKED' || status === 'RECEIVED') && (
        <div className="space-y-3">
          <div className="bg-gradient-to-br from-slate-800 to-slate-950 p-4 rounded-xl border border-amber-500/30 space-y-3 relative">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Digital Valet Ticket</p>
                <p className="text-2xl font-black tracking-widest text-amber-400 font-mono">{valetRequest.tokenNumber}</p>
              </div>
              <button
                onClick={() => setShowQrModal(true)}
                className="p-2 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 text-amber-400 rounded-xl flex items-center gap-1.5 text-xs font-bold transition-all"
              >
                <QrCode size={16} /> QR Ticket
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-800">
              <div>
                <span className="text-slate-500 block text-[10px]">PARKING SLOT</span>
                <span className="font-mono font-bold text-lg text-emerald-400">{valetRequest.parkingSlot || 'A1'}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">WATCHMAN</span>
                <span className="font-semibold text-slate-200">{valetRequest.watchmanName || 'Assigned'}</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowConfirmModal(true)}
            className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-extrabold rounded-xl shadow-lg shadow-emerald-500/20 text-sm tracking-wide flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            <Car size={18} />
            Request My Vehicle Now
          </button>
        </div>
      )}

      {/* State 4: REQUESTED / DELIVERING */}
      {(status === 'REQUESTED' || status === 'DELIVERING') && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-200 space-y-2 animate-pulse">
          <div className="flex items-center gap-2 font-extrabold text-amber-400 text-sm">
            <Clock size={18} className="animate-spin" />
            {status === 'DELIVERING' ? 'Vehicle is Being Delivered!' : 'Watchman Dispatching Vehicle...'}
          </div>
          <p className="text-xs text-slate-300">
            Slot: <strong className="text-white font-mono">{valetRequest.parkingSlot}</strong> • Watchman{' '}
            <strong>{valetRequest.watchmanName || 'Ramesh Kumar'}</strong> is driving your vehicle to <strong>Exit Gate 1</strong>.
          </p>
        </div>
      )}

      {/* State 5: COMPLETED */}
      {status === 'COMPLETED' && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-200 space-y-2">
          <div className="flex items-center gap-2 font-extrabold text-emerald-400 text-sm">
            <CheckCircle2 size={18} />
            Vehicle Ready at Exit Gate 1!
          </div>
          <p className="text-xs text-slate-300">Your vehicle has arrived. Please present your token or QR code to collect keys.</p>
        </div>
      )}

      {/* QR Ticket Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl max-w-xs w-full text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
              <QrCode size={24} />
            </div>
            <h4 className="font-bold text-lg text-white">Digital Valet Token</h4>
            <p className="font-mono text-2xl font-black text-amber-400 tracking-widest">{valetRequest.tokenNumber}</p>

            {/* Mock QR SVG */}
            <div className="bg-white p-4 rounded-2xl w-44 h-44 mx-auto flex items-center justify-center shadow-inner">
              <svg className="w-full h-full text-slate-950" viewBox="0 0 100 100" fill="currentColor">
                <rect x="10" y="10" width="30" height="30" />
                <rect x="60" y="10" width="30" height="30" />
                <rect x="10" y="60" width="30" height="30" />
                <rect x="20" y="20" width="10" height="10" fill="white" />
                <rect x="70" y="20" width="10" height="10" fill="white" />
                <rect x="20" y="70" width="10" height="10" fill="white" />
                <rect x="50" y="50" width="15" height="15" />
                <rect x="75" y="65" width="15" height="25" />
                <rect x="45" y="75" width="20" height="15" />
              </svg>
            </div>

            <p className="text-xs text-slate-400">Scan at counter or show watchman</p>
            <button
              onClick={() => setShowQrModal(false)}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 font-bold rounded-xl text-xs text-white"
            >
              Close Ticket
            </button>
          </div>
        </div>
      )}

      {/* Confirm Retrieval Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl max-w-xs w-full text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <Car size={24} />
            </div>
            <h4 className="font-bold text-lg text-white">Bring my vehicle now?</h4>
            <p className="text-xs text-slate-400">
              Watchman will fetch your <strong>{valetRequest.vehicleType}</strong> ({valetRequest.vehicleNumber}) from slot{' '}
              <strong className="text-amber-400">{valetRequest.parkingSlot}</strong>.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRetrieval}
                className="py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-lg shadow-emerald-600/30"
              >
                Yes, Bring It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
