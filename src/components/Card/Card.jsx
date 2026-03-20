import React from 'react';
import './styles.css';

export default function Card({ title, value, icon: Icon, color = 'purple', trend }) {
  const colors = {
    purple: 'bg-purple-50 text-purple-600',
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    orange: 'bg-orange-50 text-orange-600',
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-5 flex items-center gap-4 border border-gray-100">
      <div className={`p-3 rounded-xl ${colors[color]}`}>
        <Icon size={22} />
      </div>
      <div>
        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{title}</p>
        <p className="text-2xl font-bold text-gray-800 mt-0.5">{value}</p>
        {trend && <p className="text-xs text-green-500 mt-0.5">{trend}</p>}
      </div>
    </div>
  );
}
