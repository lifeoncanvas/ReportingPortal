import React from 'react';

export default function ActivityFeed({ items }) {
  return (
    <div className="space-y-1">
      {items.map((a, i) => (
        <div key={i} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-sm font-bold shrink-0">
              {a.user[0]}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-700">{a.user}</p>
              <p className="text-xs text-gray-400">{a.action}</p>
            </div>
          </div>
          <span className="text-xs text-gray-400 whitespace-nowrap ml-2">{a.time}</span>
        </div>
      ))}
    </div>
  );
}
