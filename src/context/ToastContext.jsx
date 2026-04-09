import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ToastContext = createContext(null);

const ROLE_NOTIF_PATH = {
  global: '/global/notifications',
  zonal:  '/zonal/notifications',
  admin:  '/admin/notifications',
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((toast) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, ...toast }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  }, []);

  const dismiss = (id) => setToasts(prev => prev.filter(t => t.id !== id));

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
      <CrossTabToastListener showToast={showToast} />
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);

// ── Cross-tab listener ─────────────────────────────────────────
// Watches localStorage for new pending toasts written by other tabs.
// If the current tab is already logged in and the toast is relevant
// to this user's role, fire it immediately.
function CrossTabToastListener({ showToast }) {
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e) => {
      if (e.key !== 'lw_pending_toasts') return;

      // Read current user from sessionStorage (tab-specific)
      let currentUser = null;
      try { currentUser = JSON.parse(sessionStorage.getItem('lw_user')); } catch {}
      if (!currentUser) return; // not logged in — will get toast on login

      const role = currentUser.role;
      const notifPath = ROLE_NOTIF_PATH[role] || '/notifications';

      let newToasts = [];
      try { newToasts = JSON.parse(e.newValue) || []; } catch { return; }

      let oldToasts = [];
      try { oldToasts = JSON.parse(e.oldValue) || []; } catch {}

      // Find toasts that were just added (present in new but not old)
      const added = newToasts.filter(
        nt => !oldToasts.find(ot => ot.id === nt.id)
      );

      // Filter to only toasts relevant to this role
      const relevant = added.filter(t => {
        if (t.role === 'all') return true;
        if (t.role === 'global_admin') return ['global', 'admin'].includes(role);
        if (t.role === 'zonal') return role === 'zonal';
        return false;
      });

      relevant.forEach((t, i) => {
        setTimeout(() => {
          showToast({
            icon:    t.icon === 'magazine' ? '📖' : t.icon === 'success' ? '✅' : '🔔',
            title:   t.title,
            message: t.message,
            onClick: () => navigate(notifPath),
          });
        }, i * 600);
      });
    };

    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, [showToast, navigate]);

  return null;
}

// ── Toast Container ────────────────────────────────────────────
function ToastContainer({ toasts, onDismiss }) {
  if (!toasts.length) return null;
  return (
    <div style={styles.container}>
      {toasts.map(t => <Toast key={t.id} toast={t} onDismiss={onDismiss} />)}
    </div>
  );
}

// ── Single Toast ───────────────────────────────────────────────
function Toast({ toast, onDismiss }) {
  const { id, title, message, icon = '🔔', onClick } = toast;

  const handleClick = () => {
    onDismiss(id);
    if (onClick) onClick();
  };

  return (
    <div style={styles.toast} onClick={handleClick}>
      <div style={styles.iconWrap}>{icon}</div>
      <div style={styles.body}>
        <p style={styles.title}>{title}</p>
        <p style={styles.message}>{message}</p>
        <p style={styles.hint}>Click to view notifications</p>
      </div>
      <button style={styles.close} onClick={e => { e.stopPropagation(); onDismiss(id); }}>✕</button>
      <div style={styles.progress} />
    </div>
  );
}

const styles = {
  container: {
    position: 'fixed', top: 70, right: 20, zIndex: 9999,
    display: 'flex', flexDirection: 'column', gap: 10,
    maxWidth: 340, width: '100%',
  },
  toast: {
    display: 'flex', alignItems: 'flex-start', gap: 12,
    background: '#fff', border: '1px solid #e5e7eb',
    borderLeft: '4px solid #4f46e5', borderRadius: 12,
    padding: '14px 16px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
    cursor: 'pointer', position: 'relative', overflow: 'hidden',
    animation: 'slideIn 0.25s ease',
  },
  iconWrap: { fontSize: 22, lineHeight: 1, flexShrink: 0, marginTop: 2 },
  body:     { flex: 1, minWidth: 0 },
  title:    { fontSize: 13, fontWeight: 700, color: '#1f2937', margin: 0, marginBottom: 3 },
  message:  {
    fontSize: 12, color: '#6b7280', margin: 0, lineHeight: 1.4,
    overflow: 'hidden', display: '-webkit-box',
    WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
  },
  hint:  { fontSize: 11, color: '#4f46e5', margin: 0, marginTop: 4, fontWeight: 600 },
  close: { background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: 12, padding: 0, flexShrink: 0, lineHeight: 1 },
  progress: {
    position: 'absolute', bottom: 0, left: 0, height: 3,
    background: '#4f46e5', borderRadius: '0 0 0 12px',
    animation: 'shrink 5s linear forwards', width: '100%',
  },
};

if (typeof document !== 'undefined' && !document.getElementById('toast-styles')) {
  const style = document.createElement('style');
  style.id = 'toast-styles';
  style.textContent = `
    @keyframes slideIn { from { opacity: 0; transform: translateX(60px); } to { opacity: 1; transform: translateX(0); } }
    @keyframes shrink  { from { width: 100%; } to { width: 0%; } }
  `;
  document.head.appendChild(style);
}
