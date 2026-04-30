import React, { createContext, useContext, useState } from 'react';
import { flushPendingToasts } from '../context/NotificationContext';

const AuthContext = createContext(undefined);

const session = {
  get:       (key)        => { try { const r = sessionStorage.getItem(key); return r ? JSON.parse(r) : null; } catch { return null; } },
  set:       (key, value) => { try { sessionStorage.setItem(key, JSON.stringify(value)); } catch {} },
  remove:    (key)        => { try { sessionStorage.removeItem(key); } catch {} },
  getRaw:    (key)        => sessionStorage.getItem(key),
  setRaw:    (key, value) => sessionStorage.setItem(key, value),
  removeRaw: (key)        => sessionStorage.removeItem(key),
};

// Removed hardcoded DEMO_USERS to ensure backend authentication and status checks are strictly enforced.

export function AuthProvider({ children }) {
  const [user,   setUser]   = useState(() => session.get('lw_user'));
  const [avatar, setAvatar] = useState(() => session.getRaw('lw_avatar') || null);

  const updateAvatar = (dataUrl) => {
    if (dataUrl) { session.setRaw('lw_avatar', dataUrl); }
    else         { session.removeRaw('lw_avatar'); }
    setAvatar(dataUrl);
  };

  const login = async (email, password, onPendingToasts) => {
    return await baseLogin({ email, password, loginMethod: 'password' }, onPendingToasts);
  };

  const loginWithKingChat = async (accessToken, onPendingToasts) => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/kingchat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: accessToken })
      });

      if (!res.ok) {
        const errText = await res.text();
        return errText || 'KingsChat login failed.';
      }

      const userData = await res.json();
      session.set('lw_user', userData);
      setUser(userData);

      const pending = flushPendingToasts(userData.role);
      if (pending.length && onPendingToasts) onPendingToasts(pending, userData.role);

      return null;
    } catch (err) {
      console.error("KingsChat Auth failed:", err);
      return 'Network error or Invalid KingsChat session.';
    }
  };

  const baseLogin = async (payload, onPendingToasts) => {
    const { email, password } = payload;
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errText = await res.text();
        if (errText && errText.length < 150 && !errText.includes('<!DOCTYPE')) {
          return errText;
        }
        return `Login Failed (${res.status})`;
      }

      const userData = await res.json();
      session.set('lw_user', userData);
      setUser(userData);

      const pending = flushPendingToasts(userData.role);
      if (pending.length && onPendingToasts) onPendingToasts(pending, userData.role);

      return null;
    } catch (err) {
      console.error("Login failed:", err);
      return 'Network error or Invalid credentials.';
    }
  };

  const logout = () => {
    session.remove('lw_user');
    session.removeRaw('lw_avatar');
    setUser(null);
    setAvatar(null);
  };

  const signup = async (name, email, password) => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });

      if (!res.ok) {
        const errText = await res.text();
        return errText || 'Registration failed.';
      }
      return null;
    } catch (err) {
      console.error("Signup failed:", err);
      return 'Network error.';
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, loginWithKingChat, signup, logout, avatar, updateAvatar }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
