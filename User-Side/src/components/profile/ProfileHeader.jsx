import React from 'react';
import { Edit2, Star } from 'lucide-react';

const ProfileHeader = ({ user }) => {
  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm mb-6 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-orange-400 to-rose-500 opacity-90"></div>
      
      <div className="relative z-10 flex flex-col items-center mt-8">
        <div className="relative">
          <img 
            src={user.avatarUrl} 
            alt={`${user.firstName} ${user.lastName}`}
            className="w-24 h-24 rounded-full border-4 border-white shadow-md object-cover"
          />
          <button className="absolute bottom-0 right-0 bg-orange-500 text-white p-2 rounded-full shadow-lg hover:bg-orange-600 transition-colors active:scale-95">
            <Edit2 size={14} />
          </button>
        </div>
        
        <h2 className="mt-4 text-2xl font-bold text-slate-800">{user.firstName} {user.lastName}</h2>
        <p className="text-slate-500 text-sm mt-1">{user.email} • {user.phone}</p>
        
        <div className="mt-4 bg-slate-100 px-4 py-1.5 rounded-full flex items-center gap-2">
          <span className="text-xs font-medium text-slate-600 uppercase tracking-wide">ID: {user.id}</span>
        </div>

        {/* Loyalty Progress */}
        <div className="mt-6 w-full max-w-sm">
          <div className="flex justify-between items-end mb-2">
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center">
                <Star size={12} fill="currentColor" />
              </div>
              <span className="font-bold text-slate-800 text-sm">{user.loyalty.tier} Member</span>
            </div>
            <span className="text-xs font-bold text-slate-500">
              {user.loyalty.points} / {user.loyalty.nextTierPoints} pts
            </span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full relative"
              style={{ width: `${(user.loyalty.points / user.loyalty.nextTierPoints) * 100}%` }}
            >
              {/* Shimmer effect */}
              <div className="absolute top-0 inset-x-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
            </div>
          </div>
          <p className="text-center text-[11px] font-medium text-slate-400 mt-2">
            {user.loyalty.nextTierPoints - user.loyalty.points} points away from Platinum
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
