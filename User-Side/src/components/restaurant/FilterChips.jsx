import React from 'react';

export default function FilterChips({ vegFilter, setVegFilter, categoryFilter, setCategoryFilter, categories }) {
  return (
    <div className="sticky top-[73px] bg-white z-20 shadow-sm">
      <div className="flex overflow-x-auto p-4 gap-3 hide-scrollbar">
        <button 
          onClick={() => setVegFilter(prev => prev === 'veg' ? null : 'veg')}
          className={`px-4 py-1.5 border rounded-lg text-sm font-medium whitespace-nowrap shadow-sm flex items-center gap-1 transition-colors ${vegFilter === 'veg' ? 'bg-green-50 border-green-600 text-green-700' : 'bg-white border-slate-200 hover:bg-slate-50'}`}
        >
          <div className="w-3 h-3 border border-green-600 flex items-center justify-center rounded-sm"><div className="w-1.5 h-1.5 rounded-full bg-green-600" /></div> Veg
        </button>
        <button 
          onClick={() => setVegFilter(prev => prev === 'non-veg' ? null : 'non-veg')}
          className={`px-4 py-1.5 border rounded-lg text-sm font-medium whitespace-nowrap shadow-sm flex items-center gap-1 transition-colors ${vegFilter === 'non-veg' ? 'bg-red-50 border-red-600 text-red-700' : 'bg-white border-slate-200 hover:bg-slate-50'}`}
        >
          <div className="w-3 h-3 border border-red-600 flex items-center justify-center rounded-sm"><div className="w-1.5 h-1.5 rounded-full bg-red-600" /></div> Non Veg
        </button>
        {categories.map((cat) => (
          <button 
            key={cat} 
            onClick={() => setCategoryFilter(cat)}
            className={`px-4 py-1.5 border rounded-lg text-sm font-medium whitespace-nowrap shadow-sm transition-colors ${categoryFilter === cat ? 'bg-indigo-50 border-indigo-600 text-indigo-700' : 'bg-white border-slate-200 hover:bg-slate-50'}`}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
}
