import React from 'react'
import { Car, Clock, ShieldCheck, CheckCircle2, UserCheck, AlertCircle, ArrowUpRight } from 'lucide-react'
import useValetStore from '../../../store/useValetStore'

export default function ValetLiveQueue() {
  const { valetRequests, parkingSlots, getQueueMetrics, cancelValetRequest } = useValetStore()
  const metrics = getQueueMetrics('r1')

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-800/40 border border-slate-700/50 p-4 rounded-2xl">
          <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">Waiting Arrival</span>
          <span className="text-3xl font-black text-amber-400 mt-1 block">{metrics.waitingArrival}</span>
          <span className="text-[11px] text-slate-500 mt-1 block">Vehicles en route or at bay</span>
        </div>

        <div className="bg-slate-800/40 border border-slate-700/50 p-4 rounded-2xl">
          <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">Parked Vehicles</span>
          <span className="text-3xl font-black text-blue-400 mt-1 block">{metrics.parked}</span>
          <span className="text-[11px] text-slate-500 mt-1 block">Active in parking slots</span>
        </div>

        <div className="bg-slate-800/40 border border-slate-700/50 p-4 rounded-2xl">
          <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">Retrieval Queue</span>
          <span className="text-3xl font-black text-rose-400 mt-1 block">{metrics.waitingRetrieval}</span>
          <span className="text-[11px] text-slate-500 mt-1 block">Customers waiting at exit</span>
        </div>

        <div className="bg-slate-800/40 border border-slate-700/50 p-4 rounded-2xl">
          <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">Occupancy Rate</span>
          <span className="text-3xl font-black text-emerald-400 mt-1 block">{metrics.occupancyRate}%</span>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {metrics.totalSlotsCount - metrics.availableSlotsCount} of {metrics.totalSlotsCount} slots used
          </span>
        </div>
      </div>

      {/* Live Table */}
      <div className="bg-slate-800/30 border border-slate-700/50 rounded-3xl p-6 shadow-xl">
        <h3 className="text-xl font-black text-white mb-4 flex items-center justify-between">
          <span>Live Valet Feed Telemetry</span>
          <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Live Socket Sync
          </span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-700/60 text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="py-3 px-3">Token & Vehicle</th>
                <th className="py-3 px-3">Customer</th>
                <th className="py-3 px-3">Slot</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Watchman</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {valetRequests.map((req) => (
                <tr key={req.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-3">
                    <span className="font-mono text-amber-400 font-bold text-xs">{req.tokenNumber}</span>
                    <span className="block font-mono font-black text-white text-sm uppercase">{req.vehicleNumber}</span>
                    <span className="text-[10px] text-slate-400">{req.vehicleType}</span>
                  </td>

                  <td className="py-3.5 px-3">
                    <span className="text-slate-200 font-bold block">{req.customerName}</span>
                    <span className="text-[10px] text-slate-400">Time: {req.arrivalTime}</span>
                  </td>

                  <td className="py-3.5 px-3">
                    {req.parkingSlot ? (
                      <span className="font-mono font-bold text-emerald-400 text-sm">{req.parkingSlot}</span>
                    ) : (
                      <span className="text-slate-500 italic">Unassigned</span>
                    )}
                  </td>

                  <td className="py-3.5 px-3">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase border ${
                        req.currentStatus === 'PARKED'
                          ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                          : req.currentStatus === 'REQUESTED' || req.currentStatus === 'DELIVERING'
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/20 animate-pulse'
                          : req.currentStatus === 'COMPLETED'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}
                    >
                      {req.currentStatus}
                    </span>
                  </td>

                  <td className="py-3.5 px-3 text-slate-300">{req.watchmanName || 'Ramesh Kumar'}</td>

                  <td className="py-3.5 px-3 text-right">
                    {req.currentStatus !== 'COMPLETED' && req.currentStatus !== 'CANCELLED' && (
                      <button
                        onClick={() => cancelValetRequest(req.id)}
                        className="px-2.5 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-[10px] font-bold border border-red-500/20"
                      >
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
