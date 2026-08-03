import React, { useState } from 'react'
import { Plus, Trash2, Shield, Car, CheckCircle2, AlertTriangle, Layers } from 'lucide-react'
import useValetStore from '../../../store/useValetStore'

export default function ParkingSlotManager() {
  const { parkingSlots, addParkingSlot, updateParkingSlot, deleteParkingSlot } = useValetStore()

  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [newSlot, setNewSlot] = useState({
    name: '',
    floor: 'Ground',
    zone: 'Outdoor',
    allowedType: 'Car'
  })

  const zones = ['Outdoor', 'Basement', 'VIP', 'Covered', 'Staff']

  const handleCreateSlot = (e) => {
    e.preventDefault()
    if (!newSlot.name.trim()) return
    addParkingSlot(newSlot)
    setNewSlot({ name: '', floor: 'Ground', zone: 'Outdoor', allowedType: 'Car' })
    setIsAddModalOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-black text-white">Parking Slot Capacity & Zone Manager</h2>
          <p className="text-xs text-slate-400">Configure zones, floors, and vehicle type rules.</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-extrabold text-xs shadow-lg shadow-amber-500/20 transition-all"
        >
          <Plus size={16} /> Add Parking Slot
        </button>
      </div>

      {/* Grid of Slots Grouped by Zone */}
      {zones.map((zone) => {
        const zoneSlots = parkingSlots.filter((s) => s.zone === zone)
        if (zoneSlots.length === 0) return null

        return (
          <div key={zone} className="bg-slate-800/30 border border-slate-700/50 rounded-3xl p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
              <h3 className="font-bold text-sm text-slate-200 flex items-center gap-2">
                <Layers size={16} className="text-amber-400" />
                Zone: <span className="text-amber-400 font-black">{zone} Parking</span>
              </h3>
              <span className="text-xs font-semibold text-slate-400">{zoneSlots.length} Total Slots</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {zoneSlots.map((slot) => (
                <div
                  key={slot.id}
                  className={`p-3 rounded-2xl border flex flex-col justify-between space-y-2 transition-all ${
                    slot.status === 'Occupied'
                      ? 'bg-blue-950/40 border-blue-500/40 text-blue-200'
                      : slot.status === 'Reserved'
                      ? 'bg-amber-950/40 border-amber-500/40 text-amber-200'
                      : 'bg-slate-900/60 border-slate-700/60 text-slate-200'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="font-mono font-black text-base tracking-wider">{slot.name}</span>
                    <button
                      onClick={() => deleteParkingSlot(slot.id)}
                      className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                      title="Delete slot"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">
                      {slot.floor} • {slot.allowedType}
                    </span>
                    {slot.currentVehicleNumber ? (
                      <span className="text-[11px] font-mono font-bold text-amber-300 block truncate">
                        {slot.currentVehicleNumber}
                      </span>
                    ) : (
                      <span className="text-[11px] text-emerald-400 font-bold block">Available</span>
                    )}
                  </div>

                  <select
                    value={slot.status}
                    onChange={(e) => updateParkingSlot(slot.id, { status: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 text-[10px] font-bold rounded-lg px-2 py-1 focus:outline-none"
                  >
                    <option value="Available">Available</option>
                    <option value="Occupied">Occupied</option>
                    <option value="Reserved">Reserved</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </div>
              ))}
            </div>
          </div>
        )
      })}

      {/* Add Slot Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 p-6 rounded-3xl max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-xl font-black text-white">Create New Parking Slot</h3>

            <form onSubmit={handleCreateSlot} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-slate-300 mb-1">Slot ID / Name (e.g. A4, B5, VIP-03)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. A4"
                  value={newSlot.name}
                  onChange={(e) => setNewSlot({ ...newSlot, name: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Floor Level</label>
                  <input
                    type="text"
                    value={newSlot.floor}
                    onChange={(e) => setNewSlot({ ...newSlot, floor: e.target.value })}
                    placeholder="Ground / Basement-1"
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Parking Zone</label>
                  <select
                    value={newSlot.zone}
                    onChange={(e) => setNewSlot({ ...newSlot, zone: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    {zones.map((z) => (
                      <option key={z} value={z}>
                        {z}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Allowed Vehicle Type</label>
                <select
                  value={newSlot.allowedType}
                  onChange={(e) => setNewSlot({ ...newSlot, allowedType: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="Car">Car</option>
                  <option value="SUV">SUV</option>
                  <option value="Bike">Bike</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="pt-2 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold rounded-xl shadow-lg shadow-amber-500/20"
                >
                  Save Slot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
