import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import './styles.css';

export default function Signin({ onSwitch }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const err = login(email, password);
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
          Don't have an account? <span className="auth-link" onClick={onSwitch}>Sign up</span>
        </p>
      </div>
    </div>
  );
}
