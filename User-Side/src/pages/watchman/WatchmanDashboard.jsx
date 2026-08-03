import React, { useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { Car, Clock, CheckCircle2, AlertTriangle, MapPin, Search, ShieldCheck, ArrowRight, RefreshCw, ChevronRight, Sparkles, BellRing, Navigation } from 'lucide-react'
import useValetStore from '../../store/useValetStore'

export default function WatchmanDashboard() {
  const { valetRequests, parkingSlots, receiveVehicle, startVehicleDelivery, completeVehicleDelivery } = useValetStore()

  const [activeTab, setActiveTab] = useState('requests') // Default to 'requests' so urgent alerts are highlighted first
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRequestForPark, setSelectedRequestForPark] = useState(null)
  const [selectedSlotId, setSelectedSlotId] = useState('')

  // High priority requests (customers who clicked "Bring my vehicle now?")
  const urgentRetrievals = valetRequests.filter((r) => r.currentStatus === 'REQUESTED')
  const activeRetrieval = urgentRetrievals[0]

  // Filter requests
  const filteredRequests = valetRequests.filter((r) => {
    const q = searchQuery.toLowerCase()
    const matchesSearch =
      r.vehicleNumber.toLowerCase().includes(q) ||
      r.customerName.toLowerCase().includes(q) ||
      r.tokenNumber.toLowerCase().includes(q)

    if (!matchesSearch) return false

    if (activeTab === 'waiting') return r.currentStatus === 'WAITING' || r.currentStatus === 'ARRIVED'
    if (activeTab === 'parked') return r.currentStatus === 'PARKED'
    if (activeTab === 'requests') return r.currentStatus === 'REQUESTED' || r.currentStatus === 'DELIVERING'
    if (activeTab === 'completed') return r.currentStatus === 'COMPLETED'
    return true
  })

  const waitingCount = valetRequests.filter((r) => r.currentStatus === 'WAITING' || r.currentStatus === 'ARRIVED').length
  const parkedCount = valetRequests.filter((r) => r.currentStatus === 'PARKED').length
  const requestsCount = valetRequests.filter((r) => r.currentStatus === 'REQUESTED' || r.currentStatus === 'DELIVERING').length
  const completedCount = valetRequests.filter((r) => r.currentStatus === 'COMPLETED').length

  const availableSlots = parkingSlots.filter((s) => s.status === 'Available')

  const handleConfirmParking = () => {
    if (!selectedRequestForPark || !selectedSlotId) return
    receiveVehicle(selectedRequestForPark.id, selectedSlotId, 'wm-1', 'Ramesh Kumar')
    setSelectedRequestForPark(null)
    setSelectedSlotId('')
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans pt-0 md:pt-16">
      {/* Top Bar Header */}
      <header className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold shadow-inner">
            <ShieldCheck size={22} />
          </div>
          <div>
            <h1 className="font-extrabold text-base tracking-wide text-white flex items-center gap-2">
              Watchman Valet Portal
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            </h1>
            <p className="text-xs text-slate-400 font-medium">Duty Watchman: Ramesh Kumar (Shift A)</p>
          </div>
        </div>

        <RouterLink
          to="/owner/dashboard"
          className="text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3.5 py-2 rounded-xl hover:bg-amber-500/20 transition-all shadow-sm"
        >
          Owner View
        </RouterLink>
      </header>

      {/* URGENT RETRIEVAL NOTIFICATION BANNER */}
      {activeRetrieval && (
        <div className="bg-gradient-to-r from-rose-600 via-rose-700 to-red-600 text-white p-4 shadow-2xl border-b border-rose-500 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 relative z-20">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center text-white shrink-0 shadow-lg">
              <BellRing size={24} className="animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-white/20 text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md tracking-wider">
                  HIGH PRIORITY ALERT
                </span>
                <span className="font-mono font-bold text-amber-300 text-xs">{activeRetrieval.tokenNumber}</span>
              </div>
              <p className="font-black text-base text-white mt-0.5">
                Vehicle <span className="font-mono text-amber-200 uppercase">{activeRetrieval.vehicleNumber}</span> from Slot{' '}
                <span className="bg-slate-900 text-emerald-400 font-mono px-2.5 py-0.5 rounded-md">{activeRetrieval.parkingSlot}</span>
              </p>
              <p className="text-xs text-rose-100 font-medium">Customer {activeRetrieval.customerName} is waiting at Exit Gate 1</p>
            </div>
          </div>

          <button
            onClick={() => {
              setActiveTab('requests')
              startVehicleDelivery(activeRetrieval.id)
            }}
            className="w-full sm:w-auto px-5 py-2.5 bg-white hover:bg-rose-50 text-rose-700 font-extrabold text-xs rounded-xl shadow-xl transition-all flex items-center justify-center gap-2 shrink-0 active:scale-95"
          >
            <Car size={16} /> Fetch Vehicle Now
          </button>
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-7xl mx-auto w-full p-4 sm:p-6 space-y-6 flex-1 pb-32">
        {/* Metric Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
            <span className="block text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-1">Arrivals</span>
            <span className="font-black text-amber-400 text-2xl font-mono">{waitingCount}</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
            <span className="block text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-1">Parked</span>
            <span className="font-black text-blue-400 text-2xl font-mono">{parkedCount}</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md relative">
            {requestsCount > 0 && <span className="absolute top-2 right-2 w-3 h-3 bg-rose-500 rounded-full animate-ping" />}
            <span className="block text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-1">Retrievals</span>
            <span className="font-black text-rose-400 text-2xl font-mono">{requestsCount}</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
            <span className="block text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-1">Free Slots</span>
            <span className="font-black text-emerald-400 text-2xl font-mono">{availableSlots.length}</span>
          </div>
        </div>

        {/* Filter Tabs & Search Bar */}
        <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800 space-y-3 shadow-md">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              onClick={() => setActiveTab('waiting')}
              className={`py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'waiting'
                  ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                  : 'bg-slate-800/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              Waiting ({waitingCount})
            </button>

            <button
              onClick={() => setActiveTab('parked')}
              className={`py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'parked'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                  : 'bg-slate-800/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              Parked ({parkedCount})
            </button>

            <button
              onClick={() => setActiveTab('requests')}
              className={`py-2.5 px-3 rounded-xl text-xs font-black transition-all relative flex items-center justify-center gap-1.5 ${
                activeTab === 'requests'
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/20'
                  : 'bg-slate-800/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              {requestsCount > 0 && <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping mr-1" />}
              Retrievals ({requestsCount})
            </button>

            <button
              onClick={() => setActiveTab('completed')}
              className={`py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'completed'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                  : 'bg-slate-800/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              Completed ({completedCount})
            </button>
          </div>

          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search vehicle number, token VP-..., name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 text-xs rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500 font-semibold"
            />
          </div>
        </div>

        {/* Cards List Grid (Proportioned 3-column desktop layout) */}
        {filteredRequests.length === 0 ? (
          <div className="text-center py-20 text-slate-500 space-y-2 bg-slate-900/40 rounded-3xl border border-slate-800/60">
            <Car size={40} className="mx-auto opacity-30 text-slate-400" />
            <p className="text-sm font-extrabold text-slate-400">No vehicles in this section</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredRequests.map((req) => (
              <div
                key={req.id}
                className={`bg-slate-900 border p-5 rounded-3xl space-y-4 shadow-xl relative overflow-hidden transition-all flex flex-col justify-between ${
                  req.currentStatus === 'REQUESTED' ? 'border-rose-500/80 shadow-rose-500/20' : 'border-slate-800'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-md">
                        {req.tokenNumber}
                      </span>
                      <h3 className="text-xl font-black tracking-wider font-mono text-white mt-1.5 uppercase">
                        {req.vehicleNumber}
                      </h3>
                      <p className="text-xs text-slate-400 font-medium">
                        {req.customerName} • <span className="text-slate-200 font-bold">{req.vehicleType}</span> ({req.vehicleColor || 'Any'})
                      </p>
                    </div>

                    <div className="text-right">
                      <span
                        className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border uppercase ${
                          req.currentStatus === 'REQUESTED'
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                            : 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}
                      >
                        {req.currentStatus}
                      </span>
                      <p className="text-[11px] text-slate-500 mt-1 flex items-center justify-end gap-1 font-mono">
                        <Clock size={12} /> {req.arrivalTime}
                      </p>
                    </div>
                  </div>

                  {/* Slot Details Badge */}
                  {req.parkingSlot && (
                    <div className="p-3 bg-slate-950/90 border border-slate-800 rounded-2xl flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-semibold">Assigned Slot:</span>
                      <span className="font-mono font-black text-emerald-400 text-base">{req.parkingSlot}</span>
                    </div>
                  )}
                </div>

                {/* Clear Action Buttons */}
                <div className="pt-2 border-t border-slate-800/80">
                  {(req.currentStatus === 'WAITING' || req.currentStatus === 'ARRIVED') && (
                    <button
                      onClick={() => {
                        setSelectedRequestForPark(req)
                        setSelectedSlotId(availableSlots[0]?.id || '')
                      }}
                      className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-1.5 active:scale-95"
                    >
                      <Car size={16} /> Assign Slot & Park
                    </button>
                  )}

                  {req.currentStatus === 'REQUESTED' && (
                    <button
                      onClick={() => startVehicleDelivery(req.id)}
                      className="w-full py-3 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-black text-xs rounded-xl shadow-lg shadow-rose-600/30 transition-all flex items-center justify-center gap-1.5 active:scale-95 animate-pulse"
                    >
                      <Car size={16} /> Bring Vehicle (Fetch from Slot {req.parkingSlot})
                    </button>
                  )}

                  {req.currentStatus === 'DELIVERING' && (
                    <button
                      onClick={() => completeVehicleDelivery(req.id)}
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-1.5 active:scale-95"
                    >
                      <CheckCircle2 size={16} /> Confirm Key Handover to Owner
                    </button>
                  )}

                  {req.currentStatus === 'PARKED' && (
                    <div className="text-center py-2 text-xs font-bold text-slate-400 flex items-center justify-center gap-1">
                      <CheckCircle2 size={14} className="text-emerald-400" /> Parked at Slot {req.parkingSlot}
                    </div>
                  )}

                  {req.currentStatus === 'COMPLETED' && (
                    <div className="text-center py-2 text-xs font-bold text-emerald-400 flex items-center justify-center gap-1">
                      <CheckCircle2 size={14} /> Keys Handed Over • Completed
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal for Slot Selection when Parking */}
      {selectedRequestForPark && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="font-extrabold text-base text-white">Assign Slot for {selectedRequestForPark.vehicleNumber}</h3>
            <p className="text-xs text-slate-400 font-medium">Select an available parking slot below:</p>

            <select
              value={selectedSlotId}
              onChange={(e) => setSelectedSlotId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-xs rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono font-bold"
            >
              {availableSlots.map((s) => (
                <option key={s.id} value={s.id}>
                  Slot {s.slotNumber} ({s.zone} Zone - {s.level})
                </option>
              ))}
            </select>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setSelectedRequestForPark(null)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-extrabold text-xs rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmParking}
                className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all"
              >
                Confirm Parking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
