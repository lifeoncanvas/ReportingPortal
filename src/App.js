import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { useAuth } from './auth/AuthContext';
import AuthRouter from './auth/AuthRouter';
import RoleRouter from './router/RoleRouter';
import { NotificationProvider } from './context/NotificationContext';
import { ToastProvider } from './context/ToastContext';
import SupportChatBot from './components/ChatBot/ChatBot';

function AppContent() {
  const { user } = useAuth();
  console.log("AppContent user state:", user);
  if (user === undefined) return null;
  return (
    <>
      {user ? <RoleRouter /> : <AuthRouter />}
      {user && <SupportChatBot />}
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