import React from 'react'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'
import { Car, Clock, ShieldCheck, TrendingUp, Users } from 'lucide-react'
import useValetStore from '../../../store/useValetStore'

const hourlyData = [
  { time: '11 AM', parked: 4, retrieved: 2 },
  { time: '12 PM', parked: 12, retrieved: 6 },
  { time: '01 PM', parked: 18, retrieved: 14 },
  { time: '02 PM', parked: 10, retrieved: 12 },
  { time: '03 PM', parked: 6, retrieved: 5 },
  { time: '06 PM', parked: 15, retrieved: 8 },
  { time: '07 PM', parked: 24, retrieved: 19 },
  { time: '08 PM', parked: 28, retrieved: 25 },
  { time: '09 PM', parked: 14, retrieved: 20 }
]

const zoneOccupancy = [
  { name: 'Outdoor', occupied: 6, capacity: 10, color: '#f59e0b' },
  { name: 'Basement', occupied: 8, capacity: 12, color: '#3b82f6' },
  { name: 'VIP', occupied: 2, capacity: 4, color: '#ec4899' },
  { name: 'Covered', occupied: 3, capacity: 6, color: '#10b981' }
]

export default function ValetAnalytics() {
  const { valetRequests, watchmen } = useValetStore()

  const completedToday = valetRequests.filter((r) => r.currentStatus === 'COMPLETED').length + 42

  return (
    <div className="space-y-6">
      {/* Top Stat Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-800/40 border border-slate-700/50 p-5 rounded-3xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
              <Car size={20} />
            </div>
            <div>
              <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">Total Parked Today</span>
              <span className="text-2xl font-black text-white">{completedToday} Vehicles</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/40 border border-slate-700/50 p-5 rounded-3xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold">
              <Clock size={20} />
            </div>
            <div>
              <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">Avg Retrieval Time</span>
              <span className="text-2xl font-black text-white">3.5 Mins</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/40 border border-slate-700/50 p-5 rounded-3xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
              <TrendingUp size={20} />
            </div>
            <div>
              <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">Peak Traffic Hours</span>
              <span className="text-2xl font-black text-white">7 PM - 9 PM</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/40 border border-slate-700/50 p-5 rounded-3xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold">
              <Users size={20} />
            </div>
            <div>
              <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">Active Watchmen</span>
              <span className="text-2xl font-black text-white">{watchmen.length} Personnel</span>
            </div>
          </div>
        </div>
      </div>

      {/* Hourly Valet Volume Chart */}
      <div className="bg-slate-800/30 border border-slate-700/50 rounded-3xl p-6 shadow-xl space-y-4">
        <h3 className="text-lg font-black text-white flex items-center gap-2">
          <TrendingUp className="text-amber-400" size={20} /> Hourly Parking & Retrieval Telemetry
        </h3>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={hourlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorParked" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorRetrieved" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
              />
              <Area type="monotone" dataKey="parked" name="Vehicles Parked" stroke="#f59e0b" fillOpacity={1} fill="url(#colorParked)" />
              <Area type="monotone" dataKey="retrieved" name="Vehicles Retrieved" stroke="#10b981" fillOpacity={1} fill="url(#colorRetrieved)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Zone Capacity Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="text-base font-black text-white">Zone Occupancy Breakdown</h3>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={zoneOccupancy} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                />
                <Bar dataKey="occupied" name="Occupied Slots" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                <Bar dataKey="capacity" name="Total Capacity" fill="#334155" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Watchmen Performance List */}
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="text-base font-black text-white">Watchmen Staff Duty Roster</h3>
          <div className="space-y-3">
            {watchmen.map((wm) => (
              <div key={wm.id} className="p-3.5 bg-slate-900/60 rounded-2xl border border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white text-sm">{wm.name}</h4>
                  <p className="text-xs text-slate-400">{wm.shift} • {wm.phone}</p>
                </div>
                <div className="text-right">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {wm.activeStatus}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
