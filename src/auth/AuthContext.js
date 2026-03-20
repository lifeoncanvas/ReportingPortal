import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(undefined);

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
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('lw_user');
      if (stored) return JSON.parse(stored);
      return null;
    } catch {
      return null;
    }
  });

  const login = (email, password) => {
    // Trim whitespace — common cause of login failures
    const cleanEmail    = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    console.log('Login attempt:', cleanEmail, cleanPassword);
    console.log('Available users:', DEMO_USERS.map(u => u.email));

    const found = DEMO_USERS.find(
      u => u.email.toLowerCase() === cleanEmail && u.password === cleanPassword
    );

    console.log('Found user:', found);

    if (!found) return 'Invalid email or password.';

    const userData = {
      role:      found.role,
      firstName: found.firstName,
      lastName:  found.lastName,
      name:      found.name,
      email:     found.email,
    };

    localStorage.setItem('lw_user', JSON.stringify(userData));
    setUser(userData);
    return null;
  };

  const logout = () => {
    localStorage.removeItem('lw_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}