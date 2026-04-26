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
  const { login, loginWithKingChat } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');

  const handleLoginResponse = (pendingToasts, role) => {
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = await login(email, password, handleLoginResponse);
    if (err) setError(err);
  };

  const handleKingChatLogin = async () => {
    if (!email || !password) {
      setError('Please enter email and password to login with KingChat');
      return;
    }
    const err = await loginWithKingChat(email, password, handleLoginResponse);
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
          
          <div className="auth-divider" style={{ margin: '1rem 0', textAlign: 'center', color: '#9ca3af', fontSize: '0.8rem' }}>
            <span>OR</span>
          </div>

          <button className="auth-button kingchat-btn" type="button" onClick={handleKingChatLogin} style={{ background: '#4f46e5' }}>
            Login with KingChat
          </button>
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
