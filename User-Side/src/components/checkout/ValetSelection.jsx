import React, { useState } from 'react'
import { Car, CheckCircle2, Clock, ShieldAlert, Sparkles } from 'lucide-react'

export default function ValetSelection({ enabled = true, onValetChange }) {
  const [needValet, setNeedValet] = useState(false)
  const [vehicleNumber, setVehicleNumber] = useState('')
  const [vehicleType, setVehicleType] = useState('Car')
  const [vehicleColor, setVehicleColor] = useState('')
  const [arrivalTime, setArrivalTime] = useState('ASAP')
  const [notes, setNotes] = useState('')

  if (!enabled) return null

  const handleToggle = (choice) => {
    setNeedValet(choice)
    if (!choice) {
      onValetChange(null)
    } else {
      onValetChange({
        enabled: true,
        vehicleNumber,
        vehicleType,
        vehicleColor,
        arrivalTime,
        notes
      })
    }
  }

  const updateValetData = (updatedFields) => {
    const nextValet = {
      enabled: true,
      vehicleNumber: updatedFields.vehicleNumber ?? vehicleNumber,
      vehicleType: updatedFields.vehicleType ?? vehicleType,
      vehicleColor: updatedFields.vehicleColor ?? vehicleColor,
      arrivalTime: updatedFields.arrivalTime ?? arrivalTime,
      notes: updatedFields.notes ?? notes
    }
    onValetChange(nextValet)
  }

  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center font-bold">
            <Car size={20} />
          </div>
          <div>
            <h2 className="font-bold text-slate-900 flex items-center gap-1.5 text-base">
              Valet Parking
              <span className="bg-amber-100 text-amber-800 text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
                <Sparkles size={10} /> Premium
              </span>
            </h2>
            <p className="text-xs text-slate-500">Contactless parking & seamless retrieval</p>
          </div>
        </div>
      </div>

      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
        <span className="text-sm font-medium text-slate-700">Need Valet Parking?</span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => handleToggle(true)}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              needValet
                ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            Yes
          </button>
          <button
            type="button"
            onClick={() => handleToggle(false)}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              !needValet
                ? 'bg-slate-800 text-white shadow-md'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            No
          </button>
        </div>
      </div>

      {needValet && (
        <div className="space-y-3 pt-2 border-t border-slate-100 animate-fadeIn">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Vehicle Number <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. KA-01-AB-1234"
              value={vehicleNumber}
              onChange={(e) => {
                setVehicleNumber(e.target.value)
                updateValetData({ vehicleNumber: e.target.value })
              }}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold uppercase tracking-wider text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Vehicle Type</label>
            <div className="grid grid-cols-4 gap-2">
              {['Car', 'SUV', 'Bike', 'Other'].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => {
                    setVehicleType(type)
                    updateValetData({ vehicleType: type })
                  }}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                    vehicleType === type
                      ? 'bg-amber-50 border-amber-500 text-amber-700'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Color (Optional)</label>
              <input
                type="text"
                placeholder="e.g. White / Black"
                value={vehicleColor}
                onChange={(e) => {
                  setVehicleColor(e.target.value)
                  updateValetData({ vehicleColor: e.target.value })
                }}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Arrival Time</label>
              <select
                value={arrivalTime}
                onChange={(e) => {
                  setArrivalTime(e.target.value)
                  updateValetData({ arrivalTime: e.target.value })
                }}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="ASAP">ASAP (10-15 mins)</option>
                <option value="In 30 mins">In 30 mins</option>
                <option value="In 45 mins">In 45 mins</option>
                <option value="In 1 hour">In 1 hour</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Notes / Drop-off Preferences</label>
            <input
              type="text"
              placeholder="e.g. Park near entrance, premium coverage"
              value={notes}
              onChange={(e) => {
                setNotes(e.target.value)
                updateValetData({ notes: e.target.value })
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>
      )}
    </div>
  )
}
