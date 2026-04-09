import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { AuthProvider }     from './auth/AuthContext';
import { SettingsProvider } from './context/SettingsContext';

// Filter out ResizeObserver loop errors that are benign but pop up in dev mode
const errorHandler = window.addEventListener('error', e => {
    if (e.message === 'ResizeObserver loop completed with undelivered notifications.') {
        const overlay = document.querySelector('iframe');
        if (overlay) overlay.style.display = 'none';
    }
});
window.addEventListener('unhandledrejection', e => {
    if (e.reason && e.reason.message === 'ResizeObserver loop completed with undelivered notifications.') {
        e.stopImmediatePropagation();
    }
});


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <SettingsProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </SettingsProvider>
  </React.StrictMode>
);