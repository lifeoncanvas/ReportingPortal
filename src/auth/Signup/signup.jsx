import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import { MessageCircle, Mail, Phone, ChevronDown, ChevronRight, User, Lock, ArrowRight } from 'lucide-react';
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
      loginWithKingChat();
      return;
    }
    setActiveSection(activeSection === section ? null : section);
  };

  return (
    <div className="auth-container">
      <div className="auth-card signup-card">
        <div className="signup-header">
          <h2 className="signup-main-title">Loveworld Lifesavers Conference 2026</h2>
          <h3 className="signup-sub-title">Choose how to register</h3>
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
                <MessageCircle className="opt-icon" size={24} />
                <span>USE KINGSCHAT</span>
              </div>
              <ArrowRight size={18} />
            </button>

            {/* Email Option */}
            <div className={`signup-accordion ${activeSection === 'email' ? 'active' : ''}`}>
              <button 
                className="signup-opt-btn email-btn"
                onClick={() => toggleSection('email')}
              >
                <div className="opt-left">
                  <Mail className="opt-icon" size={24} />
                  <span>USE EMAIL ADDRESS</span>
                </div>
                {activeSection === 'email' ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
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
                  <Phone className="opt-icon" size={24} />
                  <span>USE PHONE NUMBER</span>
                </div>
                {activeSection === 'phone' ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
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
          <p>Already registered? <span className="auth-link" onClick={onSwitch}>Sign in to watch live →</span> <span className="red-dot">●</span></p>
        </div>
      </div>
    </div>
  );
}
