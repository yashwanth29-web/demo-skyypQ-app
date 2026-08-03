import React from 'react';

const ProfileSection = ({ title, children }) => {
  return (
    <div className="mb-6">
      <h3 className="px-4 text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">
        {title}
      </h3>
      <div className="bg-white rounded-3xl shadow-sm overflow-hidden border border-slate-100">
        <div className="flex flex-col divide-y divide-slate-50">
          {children}
        </div>
      </div>
    </div>
  );
};

export default ProfileSection;
