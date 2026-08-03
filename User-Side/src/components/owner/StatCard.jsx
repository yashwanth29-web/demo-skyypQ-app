import React from 'react';

export default function StatCard({ title, value, icon: Icon, trend }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
      <div className="flex justify-between items-start mb-4">
        <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
          <Icon size={24} />
        </div>
        {trend && (
          <div className={`px-2.5 py-1 rounded-full text-xs font-bold ${trend > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
            {trend > 0 ? '+' : ''}{trend}%
          </div>
        )}
      </div>
      <div>
        <p className="text-slate-500 font-medium text-sm mb-1">{title}</p>
        <h3 className="text-3xl font-extrabold text-slate-900">{value}</h3>
      </div>
    </div>
  );
}
