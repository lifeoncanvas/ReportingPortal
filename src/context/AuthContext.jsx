// import React, { createContext, useContext, useState } from 'react';

// const AuthContext = createContext(null);

// export function AuthProvider({ children }) {
//   const [user, setUser] = useState(() => {
//     // Read from localStorage on first load
//     try {
//       const stored = localStorage.getItem('lw_user');
//       return stored ? JSON.parse(stored) : { role: 'global' }; // default so app doesn't log out
//     } catch {
//       return { role: 'global' };
//     }
//   });

//   const login = (userData) => {
//     localStorage.setItem('lw_user', JSON.stringify(userData));
//     setUser(userData);
//   };

//   const logout = () => {
//     localStorage.removeItem('lw_user');
//     localStorage.removeItem('lw_settings');
//     setUser(null);
//   };

//   return (
//     <AuthContext.Provider value={{ user, login, logout }}>
//       {children}
//     </AuthContext.Provider>
//   );
// }

// export function useAuth() {
//   return useContext(AuthContext);
// }