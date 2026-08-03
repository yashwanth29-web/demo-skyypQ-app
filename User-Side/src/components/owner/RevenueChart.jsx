import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function RevenueChart({ data }) {
  // data expected format: [{ name: 'Mon', revenue: 100 }, ...]
  
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-64 flex items-center justify-center text-slate-500 bg-slate-800/20 rounded-3xl border border-slate-700/50">
        No revenue data available yet.
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-xl">
          <p className="text-slate-400 text-xs font-bold mb-1">{label}</p>
          <p className="text-indigo-400 font-black">${payload[0].value.toFixed(2)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-72 bg-slate-800/30 backdrop-blur-md rounded-3xl border border-slate-700/50 p-6 shadow-xl relative overflow-hidden">
      <div className="mb-4">
        <h3 className="text-lg font-black text-white">Platform Revenue Trend</h3>
        <p className="text-slate-400 text-xs font-medium">Real-time simulated data</p>
      </div>
      <div className="w-full h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 5, right: 0, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.5}/>
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} width={40} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
