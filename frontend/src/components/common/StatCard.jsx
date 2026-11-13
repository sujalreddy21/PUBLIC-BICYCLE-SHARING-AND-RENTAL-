import React from 'react';

export const StatCard = ({ title, value, icon: Icon, change, changeType = 'positive', subtext, color = 'blue' }) => {
  const colorMap = {
    blue: {
      bg: 'bg-blue-50 text-blue-600',
      ring: 'group-hover:ring-blue-200'
    },
    emerald: {
      bg: 'bg-emerald-50 text-emerald-600',
      ring: 'group-hover:ring-emerald-200'
    },
    indigo: {
      bg: 'bg-indigo-50 text-indigo-600',
      ring: 'group-hover:ring-indigo-200'
    },
    amber: {
      bg: 'bg-amber-50 text-amber-600',
      ring: 'group-hover:ring-amber-200'
    },
    purple: {
      bg: 'bg-purple-50 text-purple-600',
      ring: 'group-hover:ring-purple-200'
    },
    rose: {
      bg: 'bg-rose-50 text-rose-600',
      ring: 'group-hover:ring-rose-200'
    }
  };

  const scheme = colorMap[color] || colorMap.blue;

  return (
    <div className={`group relative bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-200 ${scheme.ring}`}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500">{title}</span>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 ${scheme.bg}`}>
          {Icon && <Icon className="w-5 h-5" />}
        </div>
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">{value}</span>
        {change && (
          <span
            className={`text-xs font-semibold px-1.5 py-0.5 rounded ${
              changeType === 'positive'
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-rose-50 text-rose-700'
            }`}
          >
            {change}
          </span>
        )}
      </div>
      {subtext && <p className="mt-1.5 text-xs text-slate-400">{subtext}</p>}
    </div>
  );
};
