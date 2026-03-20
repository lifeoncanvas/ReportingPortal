import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { useAuth } from './auth/AuthContext';
import AuthRouter from './auth/AuthRouter';
import RoleRouter from './router/RoleRouter';

function AppContent() {
  const { user } = useAuth();

  // Still reading from localStorage — don't render anything yet
  if (user === undefined) return null;

  return user ? <RoleRouter /> : <AuthRouter />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}