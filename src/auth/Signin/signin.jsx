import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import { useToast } from '../../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import './styles.css';

const ROLE_NOTIF_PATH = {
  global: '/global/notifications',
  zonal:  '/zonal/notifications',
  admin:  '/admin/notifications',
};

export default function Signin({ onSwitch, onForgotPassword }) {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Capture the role returned from login via a ref trick —
    // login sets user synchronously so we read it from the callback
    let loggedInRole = null;

    const err = await login(email, password, (pendingToasts, role) => {
      loggedInRole = role;
      const notifPath = ROLE_NOTIF_PATH[role] || '/notifications';

      pendingToasts.forEach((t, i) => {
        setTimeout(() => {
          showToast({
            icon:    t.icon === 'magazine' ? '📖' : t.icon === 'success' ? '✅' : '🔔',
            title:   t.title,
            message: t.message,
            onClick: () => navigate(notifPath),
          });
        }, i * 600);
      });
    });

    if (err) setError(err);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Loveworld Reports</h2>
        <p className="auth-subtitle">Sign in to your account</p>
        {error && <p className="auth-error">{error}</p>}
        <form onSubmit={handleSubmit}>
          <input className="auth-input" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
          <input className="auth-input" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
          <button className="auth-button" type="submit">Login</button>
        </form>
        <p className="auth-switch">
          <span className="auth-link" onClick={onForgotPassword}>Forgot password?</span>
        </p>
        <p className="auth-switch">
          Don't have an account? <span className="auth-link" onClick={onSwitch}>Sign up</span>
        </p>
      </div>
    </div>
  );
}
