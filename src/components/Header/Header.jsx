import React, { useState, useRef, useEffect } from 'react';
import { Bell, Settings, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth }     from '../../auth/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import './styles.css';

export default function Header({ basePath }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const navigate    = useNavigate();
  const { user, logout } = useAuth();

  // Derive basePath from user role if not passed as prop
  const base = basePath ?? `/${user?.role === 'global' ? 'global' : user?.role === 'zonal' ? 'zonal' : 'admin'}`;

  const settingsCtx = useSettings();
  const profile     = settingsCtx?.settings?.profile;
  const firstName   = user?.firstName ?? profile?.firstName ?? 'U';
  const lastName    = user?.lastName  ?? profile?.lastName  ?? '';
  const email       = user?.email     ?? profile?.email     ?? '';
  const initials    = `${firstName?.[0] ?? 'U'}${lastName?.[0] ?? ''}`.toUpperCase();

  useEffect(() => {
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSignOut = () => {
    setShowDropdown(false);
    logout();
  };

  return (
    <header className="header">
      <div className="header-brand">
        <svg className="header-brand-icon" viewBox="0 0 24 24" fill="none"
          stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7L12 2z"/>
        </svg>
        Loveworld
      </div>

      <div className="header-spacer" />

      <div className="header-actions">
        <button className="header-icon-btn notif"
          onClick={() => navigate(`${base}/notifications`)}
          title="Notifications">
          <Bell size={16} />
          <span className="notif-dot" />
        </button>

        <button className="header-icon-btn"
          onClick={() => navigate(`${base}/settings`)}
          title="Settings">
          <Settings size={16} />
        </button>

        <div className="header-user-wrap" ref={dropdownRef}>
          <button className="header-user-btn"
            onClick={() => setShowDropdown(p => !p)}>
            <div className="header-avatar">{initials}</div>
            <svg className={`header-chevron ${showDropdown ? 'open' : ''}`}
              width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>

          {showDropdown && (
            <div className="header-dropdown">
              <div className="header-dropdown-user">
                <p className="hd-name">{firstName} {lastName}</p>
                <p className="hd-email">{email}</p>
              </div>
              <div className="header-dropdown-divider" />
              <button className="header-dropdown-signout" onClick={handleSignOut}>
                <LogOut size={15} /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}