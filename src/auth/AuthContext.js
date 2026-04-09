import React, { createContext, useContext, useState } from 'react';
import { flushPendingToasts } from '../context/NotificationContext';

const AuthContext = createContext(undefined);

// sessionStorage is tab-isolated — each tab has its own login session
const session = {
  get:    (key)        => { try { const r = sessionStorage.getItem(key); return r ? JSON.parse(r) : null; } catch { return null; } },
  set:    (key, value) => { try { sessionStorage.setItem(key, JSON.stringify(value)); } catch {} },
  remove: (key)        => { try { sessionStorage.removeItem(key); } catch {} },
  getRaw: (key)        => sessionStorage.getItem(key),
  setRaw: (key, value) => sessionStorage.setItem(key, value),
  removeRaw: (key)     => sessionStorage.removeItem(key),
};

const DEMO_USERS = [
  {
    email:     'global@loveworld.com',
    password:  'global123',
    role:      'global',
    firstName: 'Global',
    lastName:  'Partnership Manager',
    name:      'Global Partnership Manager',
  },
  {
    email:     'zonal@loveworld.com',
    password:  'zonal123',
    role:      'zonal',
    firstName: 'Zonal',
    lastName:  'Partnership Manager',
    name:      'Zonal Partnership Manager',
  },
  {
    email:     'admin@loveworld.com',
    password:  'admin123',
    role:      'admin',
    firstName: 'System',
    lastName:  'Administrator',
    name:      'System Administrator',
  },
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => session.get('lw_user'));

  const [avatar, setAvatar] = useState(
    () => session.getRaw('lw_avatar') || null
  );

  const updateAvatar = (dataUrl) => {
    if (dataUrl) {
      session.setRaw('lw_avatar', dataUrl);
    } else {
      session.removeRaw('lw_avatar');
    }
    setAvatar(dataUrl);
  };

  const login = (email, password, onPendingToasts) => {
    const cleanEmail    = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    const found = DEMO_USERS.find(
      u => u.email.toLowerCase() === cleanEmail && u.password === cleanPassword
    );

    if (!found) return 'Invalid email or password.';

    const userData = {
      role:      found.role,
      firstName: found.firstName,
      lastName:  found.lastName,
      name:      found.name,
      email:     found.email,
    };

    session.set('lw_user', userData);
    setUser(userData);

    // Pending toasts are still in localStorage (cross-tab) — flush for this role
    const pending = flushPendingToasts(found.role);
    if (pending.length && onPendingToasts) onPendingToasts(pending, found.role);

    return null;
  };

  const logout = () => {
    session.remove('lw_user');
    session.removeRaw('lw_avatar');
    setUser(null);
    setAvatar(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, avatar, updateAvatar }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
