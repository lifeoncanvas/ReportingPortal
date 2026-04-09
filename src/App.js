import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { useAuth } from './auth/AuthContext';
import AuthRouter from './auth/AuthRouter';
import RoleRouter from './router/RoleRouter';
import { NotificationProvider } from './context/NotificationContext';
import { ToastProvider } from './context/ToastContext';
import KingsChatWidget from './components/KingsChat/KingsChatWidget';

function AppContent() {
  const { user } = useAuth();
  if (user === undefined) return null;
  return (
    <>
      {user ? <RoleRouter /> : <AuthRouter />}
      {user && <KingsChatWidget />}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <NotificationProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </NotificationProvider>
    </BrowserRouter>
  );
}