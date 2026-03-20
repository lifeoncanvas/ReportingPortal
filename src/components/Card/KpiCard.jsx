import React from 'react';

const COLOR_MAP = {
  purple: { bg: 'bg-purple-50',  text: 'text-purple-600',  border: 'border-purple-100' },
  blue:   { bg: 'bg-blue-50',    text: 'text-blue-600',    border: 'border-blue-100'   },
  green:  { bg: 'bg-green-50',   text: 'text-green-600',   border: 'border-green-100'  },
  orange: { bg: 'bg-orange-50',  text: 'text-orange-500',  border: 'border-orange-100' },
};

export default function KpiCard({ title, value, icon: Icon, color = 'purple', trend }) {
  const c = COLOR_MAP[color];
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 flex items-center gap-4 border border-gray-100 hover:shadow-md transition-shadow">
      <div className={`p-3 rounded-xl ${c.bg} ${c.text} shrink-0`}>
        <Icon size={22} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider truncate">{title}</p>
        <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
        {trend && (
          <p className="text-xs text-green-500 font-medium mt-0.5">{trend}</p>
        )}
      </div>
    </div>
  );
}
