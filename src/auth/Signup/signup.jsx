import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import './styles.css';

export default function Signup({ onSwitch }) {
  const { signup } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = await signup(name, email, password);
    if (err) {
      setError(err);
      setSuccess(false);
    } else {
      setError('');
      setSuccess(true);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Loveworld Reports</h2>
        <p className="auth-subtitle">Create your account</p>
        {error && <p className="auth-error">{error}</p>}
        {success ? (
          <div className="auth-success" style={{ color: '#16a34a', background: '#dcfce7', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', textAlign: 'center' }}>
            <p><strong>Success!</strong></p>
            <p>Your account has been created and is currently pending admin approval.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <input className="auth-input" type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} required />
            <input className="auth-input" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
            <input className="auth-input" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
            <p className="auth-role-note">New accounts are assigned <strong>Zonal Mgr</strong> role by default.</p>
            <button className="auth-button" type="submit">Sign Up</button>
          </form>
        )}
        <p className="auth-switch">
          {success ? 'Ready to login?' : 'Already have an account?'} <span className="auth-link" onClick={onSwitch}>Sign in</span>
        </p>
      </div>
    </div>
  );
}
