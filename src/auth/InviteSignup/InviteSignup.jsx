import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import '../Signup/styles.css';

export default function InviteSignup({ token }) {
  const { login } = useAuth();
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const res = await fetch('http://localhost:8080/api/auth/complete-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, name, password })
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(err || 'Failed to complete registration');
      }

      setError('');
      setSuccess(true);
      setTimeout(() => {
        window.location.href = '/login';
      }, 3000);
      
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Welcome to Loveworld!</h2>
        <p className="auth-subtitle">Complete your account setup</p>
        
        {error && <p className="auth-error">{error}</p>}
        {success && <p style={{ color: '#16a34a', fontSize: '14px', marginBottom: '16px', background: '#dcfce7', padding: '10px', borderRadius: '6px' }}>Registration Complete! You can now log in.</p>}
        
        {!success && (
          <form onSubmit={handleSubmit}>
            <input className="auth-input" type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} required />
            <input className="auth-input" type="password" placeholder="Create Password" value={password} onChange={e => setPassword(e.target.value)} required minLength={4} />
            <input className="auth-input" type="password" placeholder="Confirm Password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required minLength={4} />
            <button className="auth-button" type="submit">Complete Registration</button>
          </form>
        )}
      </div>
    </div>
  );
}
