import React, { createContext, useContext, useState } from 'react';
const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('lw_user');
      if (stored) return JSON.parse(stored);
      return null;
    } catch {
      return null;
    }
  });

  const login = async (email, password) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    try {
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password: cleanPassword })
      });

      if (!response.ok) {
        let msg = 'Invalid email or password.';
        try { const data = await response.text(); msg = data || msg; } catch { }
        return msg;
      }

      const userData = await response.json();
      localStorage.setItem('lw_user', JSON.stringify(userData));
      setUser(userData);
      return null;
    } catch (err) {
      console.error('Login error:', err);
      return 'Failed to connect to the login server.';
    }
  };

  const signup = async (name, email, password) => {
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    try {
      const response = await fetch('http://localhost:8080/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: cleanName, email: cleanEmail, password: cleanPassword })
      });

      if (!response.ok) {
        let msg = 'Signup failed.';
        try { const data = await response.text(); msg = data || msg; } catch { }
        return msg;
      }

      const userData = await response.json();
      localStorage.setItem('lw_user', JSON.stringify(userData));
      setUser(userData);
      return null;
    } catch (err) {
      console.error('Signup error:', err);
      return 'Failed to connect to the signup server.';
    }
  };

  const logout = () => {
    localStorage.removeItem('lw_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}