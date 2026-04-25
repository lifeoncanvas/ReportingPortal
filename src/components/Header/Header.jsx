import React, { useState, useRef, useEffect } from 'react';
import { Bell, Settings, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth }          from '../../auth/AuthContext';
import { useSettings }      from '../../context/SettingsContext';
import { useNotifications } from '../../context/NotificationContext';
import './styles.css';

export default function Header({ basePath, onMenuToggle }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const navigate    = useNavigate();
  const { user, logout, avatar } = useAuth();

  const base = basePath ?? `/${user?.role === 'global' ? 'global' : user?.role === 'zonal' ? 'zonal' : 'admin'}`;

  const { notifications } = useNotifications();
  const unread = notifications.filter(n => {
    if (!n.isNew) return false;
    if (n.role === 'global_admin') return ['global', 'admin'].includes(user?.role);
    if (n.role === 'zonal')        return user?.role === 'zonal';
    return true;
  }).length;

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
      <button className="sidebar-toggle" onClick={onMenuToggle} aria-label="Toggle menu">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="6" x2="21" y2="6"/>
          <line x1="3" y1="12" x2="21" y2="12"/>
          <line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
      </button>
      <div className="header-brand">
        
       
      </div>

      <div className="header-spacer" />

      <div className="header-actions">
        <button className="header-icon-btn notif"
          onClick={() => navigate(`${base}/notifications`)}
          title="Notifications">
          <Bell size={16} />
          {unread > 0 && (
            <span className="notif-dot" style={{ minWidth: 16, height: 16, borderRadius: 8, background: '#ef4444', color: '#fff', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px' }}>
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </button>

        <button className="header-icon-btn"
          onClick={() => navigate(`${base}/settings`)}
          title="Settings">
          <Settings size={16} />
        </button>

        <div className="header-user-wrap" ref={dropdownRef}>
          <button className="header-user-btn"
            onClick={() => setShowDropdown(p => !p)}>
            <div className="header-avatar">
              {avatar
                ? <img
                    src={avatar}
                    alt="avatar"
                    style={{
                      width: '100%', height: '100%',
                      borderRadius: '50%', objectFit: 'cover',
                      display: 'block',
                    }}
                  />
                : initials
              }
            </div>
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
                {/* Mini avatar in dropdown */}
                <div className="hd-avatar">
                  {avatar
                    ? <img src={avatar} alt="avatar"
                        style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                    : initials
                  }
                </div>
                <div>
                  <p className="hd-name">{firstName} {lastName}</p>
                  <p className="hd-email">{email}</p>
                </div>
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