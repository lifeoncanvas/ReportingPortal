import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { useToast } from '../../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import kingsChatWebSdk from 'kingschat-web-sdk';
import { MessageCircle, Mail, Phone, ChevronDown, ChevronRight, Lock, ArrowRight } from 'lucide-react';
import 'kingschat-web-sdk/dist/stylesheets/style.min.css';
import '../Signup/styles.css'; // Use shared styles

const ROLE_NOTIF_PATH = {
  global: '/global/notifications',
  zonal:  '/zonal/notifications',
  admin:  '/admin/notifications',
};

export default function Signin({ onSwitch, onForgotPassword }) {
  const { user, login, loginWithKingChat } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);
  
  const [activeSection, setActiveSection] = useState(null); // 'kingschat', 'email', 'phone'
  const [identifier, setIdentifier] = useState(''); // Email or Phone
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
    if (e) e.preventDefault();
    setLoading(true);
    setError('');
    
    const err = await login(identifier, password, handleLoginResponse);
    setLoading(false);
    if (err) setError(err);
  };

  const handleKingChatLogin = () => {
    const loginOptions = {
      scopes: ["authenticate", "profile"],
      clientId: (window.ENV?.KINGSCHAT_CLIENT_ID || process.env.REACT_APP_KINGSCHAT_CLIENT_ID || '8ae69d5f-d25d-4c05-9914-ab947ffa5b77').trim(), 
    };
    
    setLoading(true);
    setError('');
    
      kingsChatWebSdk.login(loginOptions)
      .then(async (tokenResponse) => {
        console.log("KingsChat SDK Login Success:", tokenResponse);
        const { accessToken, user: kcUser } = tokenResponse;
        const err = await loginWithKingChat(accessToken, handleLoginResponse, kcUser);
        setLoading(false);
        
        if (err) {
          console.error("Login Error from AuthContext:", err);
          setError(err);
        } else {
          console.log("KingsChat Auth successful, navigating to portal...");
          // Force a small delay to allow state to propagate if needed, 
          // though navigate should work immediately.
          showToast({
            icon: '✅',
            title: 'Welcome!',
            message: 'You have successfully logged in via KingsChat.',
          });
          
          setTimeout(() => {
            navigate('/', { replace: true });
            // If navigate doesn't work (rare), fall back to location reload
            setTimeout(() => {
              if (window.location.pathname === '/login' || window.location.pathname === '/') {
                 console.log("Redirection might have stalled, checking user state...");
              }
            }, 1000);
          }, 100);
        }
      })
      .catch(err => {
        console.error("KingsChat login error:", err);
        setLoading(false);
        setError('KingsChat login was cancelled or failed.');
      });
  };

  const toggleSection = (section) => {
    if (loading) return;
    if (section === 'kingschat') {
      setActiveSection('kingschat');
      handleKingChatLogin();
      return;
    }
    setActiveSection(activeSection === section ? null : section);
  };

  return (
    <div className="auth-container">
      <div className="auth-card signup-card">
        <div className="signup-header">
          <h2 className="signup-main-title">Healing School</h2>
          <h3 className="signup-sub-title">Zonal Master Report</h3>
        </div>

        {error && (
          <div className="auth-error">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <span>{error === "Incorrect password." ? "Wrong password. Please try again." : error}</span>
          </div>
        )}

        <div className="signup-options">
          {/* KingsChat Option */}
          <button 
            className="signup-opt-btn kc-btn"
            onClick={() => toggleSection('kingschat')}
            disabled={loading}
          >
            <div className="opt-left">
              <img src="https://kingschat.online/favicon.ico" className="opt-icon-img" alt="" />
              <span>{loading && activeSection === 'kingschat' ? 'CONNECTING...' : 'SIGN IN WITH KINGSCHAT'}</span>
            </div>
            <span className="opt-arrow">→</span>
          </button>

          {/* Email Option */}
          <div className={`signup-accordion ${activeSection === 'email' ? 'active' : ''}`}>
            <button 
              className="signup-opt-btn email-btn"
              onClick={() => toggleSection('email')}
            >
              <div className="opt-left">
                <Mail className="opt-icon" size={20} fill="currentColor" />
                <span>SIGN IN WITH EMAIL</span>
              </div>
              <span className="opt-arrow-down">▼</span>
            </button>
            
            {activeSection === 'email' && (
              <div className="accordion-content">
                <form onSubmit={handleSubmit}>
                  <div className="input-group">
                    <Mail size={16} />
                    <input 
                      type="email" 
                      placeholder="Email Address" 
                      value={identifier} 
                      onChange={e => { setIdentifier(e.target.value); if (error) setError(''); }} 
                      required 
                    />
                  </div>
                  <div className="input-group">
                    <Lock size={16} />
                    <input 
                      type="password" 
                      placeholder="Password" 
                      value={password} 
                      onChange={e => { setPassword(e.target.value); if (error) setError(''); }} 
                      required 
                    />
                  </div>
                  <button className="submit-signup-btn" type="submit" disabled={loading}>
                    {loading ? 'Logging in...' : 'Sign In'}
                  </button>
                  <p className="forgot-password-link" onClick={onForgotPassword} style={{ textAlign: 'center', marginTop: '15px', fontSize: '0.9rem', color: '#c8a951', cursor: 'pointer', fontWeight: '500' }}>
                    Forgot password?
                  </p>
                </form>
              </div>
            )}
          </div>

          {/* Phone Option */}
          <div className={`signup-accordion ${activeSection === 'phone' ? 'active' : ''}`}>
            <button 
              className="signup-opt-btn phone-btn"
              onClick={() => toggleSection('phone')}
            >
              <div className="opt-left">
                <Phone className="opt-icon" size={20} fill="currentColor" />
                <span>SIGN IN WITH PHONE</span>
              </div>
              <span className="opt-arrow-down">▼</span>
            </button>

            {activeSection === 'phone' && (
              <div className="accordion-content">
                <form onSubmit={handleSubmit}>
                  <div className="input-group">
                    <Phone size={16} />
                    <input 
                      type="tel" 
                      placeholder="Phone Number" 
                      value={identifier} 
                      onChange={e => { setIdentifier(e.target.value); if (error) setError(''); }} 
                      required 
                    />
                  </div>
                  <div className="input-group">
                    <Lock size={16} />
                    <input 
                      type="password" 
                      placeholder="Password" 
                      value={password} 
                      onChange={e => { setPassword(e.target.value); if (error) setError(''); }} 
                      required 
                    />
                  </div>
                  <button className="submit-signup-btn phone-submit" type="submit" disabled={loading}>
                    {loading ? 'Logging in...' : 'Sign In'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>

        <div className="signup-footer">
          <p>Don't have an account? <span className="auth-link" onClick={onSwitch}>Sign up here →</span> <span className="red-dot">●</span></p>
        </div>
      </div>
    </div>
  );
}
