import React from 'react';
import { ChevronRight } from 'lucide-react';

const ProfileMenuItem = ({ icon: Icon, title, onClick, danger, rightElement }) => {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center justify-between p-4 bg-white hover:bg-slate-50 active:bg-slate-100 transition-colors text-left group`}
    >
      <div className="flex items-center gap-4">
        <div className={`p-2 rounded-xl transition-colors ${danger ? 'bg-red-50 text-red-500 group-hover:bg-red-100' : 'bg-orange-50 text-orange-500 group-hover:bg-orange-100'}`}>
          <Icon size={20} strokeWidth={2.5} />
        </div>
        <span className={`font-medium text-[15px] ${danger ? 'text-red-500' : 'text-slate-700'}`}>
          {title}
        </span>
      </div>
      <div className="flex items-center gap-3">
        {rightElement ? rightElement : (
          <ChevronRight size={20} className="text-slate-300 group-hover:text-slate-400 group-active:translate-x-1 transition-all" />
        )}
      </div>
    </button>
  );
};

export default ProfileMenuItem;
