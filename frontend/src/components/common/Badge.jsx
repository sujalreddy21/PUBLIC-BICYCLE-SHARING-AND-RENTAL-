import React from 'react';

const colorStyles = {
  Available: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Paid: 'bg-emerald-50 text-emerald-700 border-emerald-200',

  Reserved: 'bg-amber-50 text-amber-700 border-amber-200',
  Pending: 'bg-amber-50 text-amber-700 border-amber-200',
  'In Progress': 'bg-blue-50 text-blue-700 border-blue-200',

  Rented: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  Electric: 'bg-cyan-50 text-cyan-700 border-cyan-200',

  'Under Maintenance': 'bg-rose-50 text-rose-700 border-rose-200',
  Cancelled: 'bg-rose-50 text-rose-700 border-rose-200',
  Failed: 'bg-rose-50 text-rose-700 border-rose-200',
  Critical: 'bg-rose-100 text-rose-800 border-rose-300 font-bold',
  High: 'bg-orange-50 text-orange-700 border-orange-200',
  Medium: 'bg-amber-50 text-amber-700 border-amber-200',
  Low: 'bg-slate-50 text-slate-700 border-slate-200',

  Inactive: 'bg-slate-100 text-slate-600 border-slate-200',
  None: 'bg-slate-100 text-slate-600 border-slate-200',

  // Roles
  admin: 'bg-purple-50 text-purple-700 border-purple-200',
  operations_manager: 'bg-blue-50 text-blue-700 border-blue-200',
  station_attendant: 'bg-amber-50 text-amber-700 border-amber-200',
  member: 'bg-emerald-50 text-emerald-700 border-emerald-200'
};

export const Badge = ({ status, text, className = '' }) => {
  const displayStatus = text || status;
  const style = colorStyles[status] || 'bg-slate-100 text-slate-700 border-slate-200';

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${style} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-70"></span>
      {displayStatus}
    </span>
  );
};
