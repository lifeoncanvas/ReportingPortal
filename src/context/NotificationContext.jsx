import React, { createContext, useContext, useState } from 'react';

const NotificationContext = createContext(null);

const INITIAL = [
  {
    id: 1, isNew: false, icon: 'calendar', role: 'all',
    title: 'Weekly Report Due',
    message: 'Your weekly report for Zone A is due by end of day Thursday.',
    time: new Date('2026-03-10T13:30:00').toLocaleString(),
  },
  {
    id: 2, isNew: false, icon: 'success', role: 'all',
    title: 'Report Submitted Successfully',
    message: 'Report RPT-001 has been submitted and is under review.',
    time: new Date('2026-03-08T16:01:00').toLocaleString(),
  },
];

function load() {
  try {
    const raw = localStorage.getItem('lw_notifications');
    return raw ? JSON.parse(raw) : INITIAL;
  } catch { return INITIAL; }
}

function save(data) {
  localStorage.setItem('lw_notifications', JSON.stringify(data));
}

// ── Pending toasts (unseen by role) ───────────────────────────
function loadPendingToasts() {
  try {
    const raw = localStorage.getItem('lw_pending_toasts');
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function savePendingToasts(data) {
  localStorage.setItem('lw_pending_toasts', JSON.stringify(data));
}

export function addPendingToast(toast) {
  const current = loadPendingToasts();
  savePendingToasts([...current, { id: Date.now(), ...toast }]);
}

export function flushPendingToasts(userRole) {
  const all = loadPendingToasts();
  // Return toasts relevant to this role and clear them
  const relevant = all.filter(t => {
    if (t.role === 'all') return true;
    if (t.role === 'global_admin') return ['global', 'admin'].includes(userRole);
    if (t.role === 'zonal') return userRole === 'zonal';
    return false;
  });
  // Keep only toasts NOT relevant to this role (other roles still need them)
  const remaining = all.filter(t => !relevant.find(r => r.id === t.id));
  savePendingToasts(remaining);
  return relevant;
}

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState(load);

  const update = (fn) => {
    setNotifications(prev => {
      const next = fn(prev);
      save(next);
      return next;
    });
  };

  const addNotification = (notif) => {
    const entry = { id: Date.now(), isNew: true, time: new Date().toLocaleString(), ...notif };
    update(prev => [entry, ...prev]);
    // Also queue as a pending toast for offline users
    addPendingToast({ ...notif, id: entry.id, time: entry.time });
  };

  const markRead    = (id) => update(p => p.map(n => n.id === id ? { ...n, isNew: false } : n));
  const markAllRead = ()   => update(p => p.map(n => ({ ...n, isNew: false })));
  const remove      = (id) => update(p => p.filter(n => n.id !== id));

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, markRead, markAllRead, remove }}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => useContext(NotificationContext);
