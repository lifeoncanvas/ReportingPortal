import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import './styles.css';

export default function Signup({ onSwitch }) {
  const { signup } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const err = signup(name, email, password);
    if (err) setError(err);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Loveworld Reports</h2>
        <p className="auth-subtitle">Create your account</p>
        {error && <p className="auth-error">{error}</p>}
        <form onSubmit={handleSubmit}>
          <input className="auth-input" type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} required />
          <input className="auth-input" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
          <input className="auth-input" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
          <p className="auth-role-note">New accounts are assigned <strong>Zonal Mgr</strong> role by default.</p>
          <button className="auth-button" type="submit">Sign Up</button>
        </form>
        <p className="auth-switch">
          Already have an account? <span className="auth-link" onClick={onSwitch}>Sign in</span>
        </p>
      </div>
    </div>
  );
}
