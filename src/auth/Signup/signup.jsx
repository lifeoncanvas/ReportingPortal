import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import { MessageCircle, Mail, Phone, ChevronDown, ChevronRight, User, Lock, ArrowRight } from 'lucide-react';
import kingsChatWebSdk from 'kingschat-web-sdk';
import 'kingschat-web-sdk/dist/stylesheets/style.min.css';
import './styles.css';

export default function Signup({ onSwitch }) {
  const { signup, loginWithKingChat } = useAuth();
  const [activeSection, setActiveSection] = useState(null); // 'kingschat', 'email', 'phone'
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  });
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleKingChatLogin = () => {
    const loginOptions = {
      scopes: ["authenticate", "profile"],
      clientId: (window.ENV?.KINGSCHAT_CLIENT_ID || process.env.REACT_APP_KINGSCHAT_CLIENT_ID || '5510380c-caac-4baa-ad0c-288dcdffaf1f').trim(), 
    };
    
    kingsChatWebSdk.login(loginOptions)
      .then(async (tokenResponse) => {
        const { accessToken, user: kcUser } = tokenResponse;
        const err = await loginWithKingChat(accessToken, null, kcUser);
        
        if (err) {
          // If the "error" is actually a success message about account creation
          if (err.toLowerCase().includes('created') || err.toLowerCase().includes('pending')) {
            setSuccess(true);
            setError('');
          } else {
            setError(err);
          }
        } else {
          // If err is null, it means the user was successfully logged in (account exists)
          // We can't use navigate directly here as it's not imported/initialized in the same way, 
          // but App.js will re-render and RoleRouter will take over.
          // However, let's make sure we provide feedback.
          setSuccess(true);
        }
      })
      .catch(err => {
        console.error("KingsChat login error:", err);
        setError('KingsChat login was cancelled or failed.');
      });
  };

  const openKingsChatReg = () => {
    window.open('https://kingschat.online/', '_blank');
  };

  const handleSubmit = async (e, type) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');

    // For Phone or Email signup
    const { name, email, phone, password } = formData;
    
    // Validate based on type
    if (type === 'email' && !email) { setError('Email is required'); setLoading(false); return; }
    if (type === 'phone' && !phone) { setError('Phone number is required'); setLoading(false); return; }
    if (!name || !password) { setError('Name and password are required'); setLoading(false); return; }

    const finalEmail = type === 'email' ? email : `${phone}@phone.portal`;
    
    const err = await signup(name, finalEmail, password, phone);
    setLoading(false);
    if (err) {
      setError(err);
    } else {
      setSuccess(true);
    }
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

        {success ? (
          <div className="auth-success">
            <div className="success-icon">✓</div>
            <h3>Registration Successful!</h3>
            <p>Your account has been created and is pending admin approval.</p>
            <button className="auth-button mt-4" onClick={onSwitch}>Sign in to continue</button>
          </div>
        ) : (
          <div className="signup-options">
            {/* KingsChat Option */}
            <button 
              className="signup-opt-btn kc-btn"
              onClick={() => toggleSection('kingschat')}
            >
              <div className="opt-left">
                <img src="https://kingschat.online/favicon.ico" className="opt-icon-img" alt="" />
                <span>USE KINGSCHAT</span>
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
                  <span>USE EMAIL ADDRESS</span>
                </div>
                <span className="opt-arrow-down">▼</span>
              </button>
              
              {activeSection === 'email' && (
                <div className="accordion-content">
                  <form onSubmit={(e) => handleSubmit(e, 'email')}>
                    <div className="input-group">
                      <User size={16} />
                      <input type="text" name="name" placeholder="Full Name" value={formData.name} onChange={handleInputChange} required />
                    </div>
                    <div className="input-group">
                      <Mail size={16} />
                      <input type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleInputChange} required />
                    </div>
                    <div className="input-group">
                      <Lock size={16} />
                      <input type="password" name="password" placeholder="Create Password" value={formData.password} onChange={handleInputChange} required />
                    </div>
                    <button className="submit-signup-btn" type="submit" disabled={loading}>
                      {loading ? 'Processing...' : 'Register with Email'}
                    </button>
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
                  <span>USE PHONE NUMBER</span>
                </div>
                <span className="opt-arrow-down">▼</span>
              </button>

              {activeSection === 'phone' && (
                <div className="accordion-content">
                  <form onSubmit={(e) => handleSubmit(e, 'phone')}>
                    <div className="input-group">
                      <User size={16} />
                      <input type="text" name="name" placeholder="Full Name" value={formData.name} onChange={handleInputChange} required />
                    </div>
                    <div className="input-group">
                      <Phone size={16} />
                      <input type="tel" name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleInputChange} required />
                    </div>
                    <div className="input-group">
                      <Lock size={16} />
                      <input type="password" name="password" placeholder="Create Password" value={formData.password} onChange={handleInputChange} required />
                    </div>
                    <button className="submit-signup-btn phone-submit" type="submit" disabled={loading}>
                      {loading ? 'Processing...' : 'Register with Phone'}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="signup-footer">
          <p>Already registered? <span className="auth-link" onClick={onSwitch}>Sign in →</span> <span className="red-dot">●</span></p>
        </div>
      </div>
    </div>
  );
}
