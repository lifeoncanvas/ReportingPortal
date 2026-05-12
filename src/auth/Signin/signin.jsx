import React, { useState } from 'react';
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
  const { login, loginWithKingChat } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  
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
    
    kingsChatWebSdk.login(loginOptions)
      .then(async (tokenResponse) => {
        const { accessToken, user: kcUser } = tokenResponse;
        const err = await loginWithKingChat(accessToken, handleLoginResponse, kcUser);
        if (err) {
          setError(err);
        } else {
          // Successfully logged in via KingsChat - Redirect to the appropriate portal/dashboard
          // Since the user state updates in the background, we can calculate the path or just go to /
          // To be safe and meet the user's request of "redirecting them on that page", 
          // we force a navigation to the root which will then be handled by RoleRouter catch-alls.
          navigate('/', { replace: true });
          showToast({
            icon: '✅',
            title: 'Welcome!',
            message: 'You have successfully logged in via KingsChat.',
          });
        }
      })
      .catch(err => {
        console.error("KingsChat login error:", err);
        setError('KingsChat login was cancelled or failed.');
      });
  };

  const toggleSection = (section) => {
    if (section === 'kingschat') {
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

        {error && <p className="auth-error">{error}</p>}

        <div className="signup-options">
          {/* KingsChat Option */}
          <button 
            className="signup-opt-btn kc-btn"
            onClick={() => toggleSection('kingschat')}
          >
            <div className="opt-left">
              <img src="https://kingschat.online/favicon.ico" className="opt-icon-img" alt="" />
              <span>SIGN IN WITH KINGSCHAT</span>
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
                      onChange={e => setIdentifier(e.target.value)} 
                      required 
                    />
                  </div>
                  <div className="input-group">
                    <Lock size={16} />
                    <input 
                      type="password" 
                      placeholder="Password" 
                      value={password} 
                      onChange={e => setPassword(e.target.value)} 
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
                      onChange={e => setIdentifier(e.target.value)} 
                      required 
                    />
                  </div>
                  <div className="input-group">
                    <Lock size={16} />
                    <input 
                      type="password" 
                      placeholder="Password" 
                      value={password} 
                      onChange={e => setPassword(e.target.value)} 
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
