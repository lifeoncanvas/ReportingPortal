import React, { useState, useEffect } from 'react';
import {
  User, Lock, Bell, Globe, Shield,
  ChevronRight, Eye, EyeOff, Check, Monitor,
} from 'lucide-react';
import { useSettings } from '../../../context/SettingsContext';
import { useAuth } from '../../../auth/AuthContext';
import './styles.css';

const TABS = [
  { key: 'profile',       label: 'Profile',       icon: User   },
  { key: 'security',      label: 'Security',       icon: Lock   },
  { key: 'notifications', label: 'Notifications',  icon: Bell   },
  { key: 'preferences',   label: 'Preferences',    icon: Globe  },
  { key: 'privacy',       label: 'Privacy',        icon: Shield },
];

// ── Toast ──────────────────────────────────────────────
function Toast({ message, type = 'success', onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3000);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className={`st-toast ${type}`}>
      {type === 'success' ? <Check size={14} /> : '✕'} {message}
    </div>
  );
}

export default function Settings() {
  const { settings, updateSection } = useSettings();
  const { user, logout }            = useAuth();

  const [tab, setTab]   = useState('profile');
  const [toast, setToast] = useState(null); // { message, type }

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  // ── Profile ──
  const [profileDraft, setProfileDraft] = useState({ ...settings.profile });
  // Sync if settings change externally
  useEffect(() => {
    setProfileDraft({ ...settings.profile });
  }, [settings.profile]);

  const handleProfileSave = () => {
    if (!profileDraft.firstName.trim() || !profileDraft.email.trim()) {
      showToast('First name and email are required.', 'error');
      return;
    }
    updateSection('profile', profileDraft);
    showToast('Profile updated successfully');
  };

  // ── Security ──
  const [pwForm,  setPwForm]  = useState({ current: '', new: '', confirm: '' });
  const [showPw,  setShowPw]  = useState({ current: false, new: false, confirm: false });
  const [pwError, setPwError] = useState('');

  const handlePasswordSave = () => {
    setPwError('');
    const stored = localStorage.getItem('lw_password') || 'password';
    if (pwForm.current !== stored) {
      setPwError('Current password is incorrect.');
      return;
    }
    if (pwForm.new.length < 6) {
      setPwError('New password must be at least 6 characters.');
      return;
    }
    if (pwForm.new !== pwForm.confirm) {
      setPwError('Passwords do not match.');
      return;
    }
    localStorage.setItem('lw_password', pwForm.new);
    updateSection('security', { passwordUpdatedAt: new Date().toISOString() });
    setPwForm({ current: '', new: '', confirm: '' });
    showToast('Password updated successfully');
  };

  const handle2FAToggle = () => {
    const next = !settings.security.twoFactor;
    updateSection('security', { twoFactor: next });
    showToast(next ? '2FA enabled' : '2FA disabled');
  };

  const handleRevokeSession = () => {
    showToast('Session revoked successfully');
  };

  // ── Notifications ──
  const handleNotifToggle = (key) => {
    updateSection('notifications', { [key]: !settings.notifications[key] });
  };

  const handleNotifSave = () => {
    showToast('Notification preferences saved');
  };

  // ── Preferences draft ──
  const [prefDraft, setPrefDraft] = useState({ ...settings.preferences });
  useEffect(() => {
    setPrefDraft({ ...settings.preferences });
  }, [settings.preferences]);

  const handleThemeClick = (value) => {
    // Theme applies instantly via SettingsContext
    updateSection('preferences', { theme: value });
    showToast(`Theme changed to ${value}`);
  };

  const handlePrefSave = () => {
    updateSection('preferences', prefDraft);
    showToast('Preferences saved');
  };

  // ── Privacy ──
  const handlePrivacyToggle = (key) => {
    updateSection('privacy', { [key]: !settings.privacy[key] });
  };

  const handleDeleteAccount = () => {
    if (window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone.'
    )) {
      localStorage.clear();
      logout();
    }
  };

  return (
    <div className="st-page">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onDone={() => setToast(null)}
        />
      )}

      <div className="st-page-header">
        <h2>Settings</h2>
        <p>Manage your account preferences and configuration</p>
      </div>

      <div className="st-layout">
        {/* Side nav */}
        <aside className="st-sidenav">
          {TABS.map(t => {
            const Icon = t.icon;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`st-sidenav-item ${tab === t.key ? 'active' : ''}`}
              >
                <Icon size={16} />
                {t.label}
                <ChevronRight size={14} className="st-sidenav-arrow" />
              </button>
            );
          })}
        </aside>

        <div className="st-panel">

          {/* ── PROFILE ── */}
          {tab === 'profile' && (
            <div className="st-section">
              <div className="st-section-header">
                <h3>Profile Information</h3>
                <p>Update your personal details and contact information</p>
              </div>

              <div className="st-avatar-row">
                <div className="st-avatar">
                  {profileDraft.firstName?.[0]}
                  {profileDraft.lastName?.[0]}
                </div>
                <div>
                  <p className="st-avatar-name">
                    {profileDraft.firstName} {profileDraft.lastName}
                  </p>
                  <p className="st-avatar-role">{profileDraft.role}</p>
                </div>
                <button className="st-btn-outline" style={{ marginLeft: 'auto' }}>
                  Change Photo
                </button>
              </div>

              <div className="st-divider" />

              <div className="st-form-grid">
                <div className="st-field">
                  <label>First Name</label>
                  <input
                    type="text"
                    value={profileDraft.firstName}
                    onChange={e => setProfileDraft(p => ({ ...p, firstName: e.target.value }))}
                  />
                </div>
                <div className="st-field">
                  <label>Last Name</label>
                  <input
                    type="text"
                    value={profileDraft.lastName}
                    onChange={e => setProfileDraft(p => ({ ...p, lastName: e.target.value }))}
                  />
                </div>
                <div className="st-field st-field-full">
                  <label>Email Address</label>
                  <input
                    type="email"
                    value={profileDraft.email}
                    onChange={e => setProfileDraft(p => ({ ...p, email: e.target.value }))}
                  />
                </div>
                <div className="st-field">
                  <label>Phone Number</label>
                  <input
                    type="text"
                    value={profileDraft.phone}
                    onChange={e => setProfileDraft(p => ({ ...p, phone: e.target.value }))}
                  />
                </div>
                <div className="st-field">
                  <label>Timezone</label>
                  <select
                    value={profileDraft.timezone}
                    onChange={e => setProfileDraft(p => ({ ...p, timezone: e.target.value }))}
                  >
                    {['UTC-8','UTC-5','UTC+0','UTC+1','UTC+3','UTC+5:30','UTC+8','UTC+9'].map(tz => (
                      <option key={tz}>{tz}</option>
                    ))}
                  </select>
                </div>
                <div className="st-field">
                  <label>Role</label>
                  <input
                    type="text"
                    value={profileDraft.role}
                    disabled
                    className="st-input-disabled"
                  />
                </div>
                <div className="st-field">
                  <label>Region</label>
                  <input
                    type="text"
                    value={profileDraft.region}
                    disabled
                    className="st-input-disabled"
                  />
                </div>
              </div>

              <div className="st-form-actions">
                <button className="st-btn-primary" onClick={handleProfileSave}>
                  Save Changes
                </button>
                <button
                  className="st-btn-ghost"
                  onClick={() => setProfileDraft({ ...settings.profile })}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* ── SECURITY ── */}
          {tab === 'security' && (
            <div className="st-section">
              <div className="st-section-header">
                <h3>Security</h3>
                <p>Manage your password and account security</p>
              </div>

              <div className="st-section-block">
                <div className="st-block-title">Change Password</div>
                {settings.security.passwordUpdatedAt && (
                  <p className="st-block-desc">
                    Last updated:{' '}
                    {new Date(settings.security.passwordUpdatedAt).toLocaleString()}
                  </p>
                )}

                <div className="st-form-grid" style={{ maxWidth: 480 }}>
                  {[
                    { label: 'Current Password', key: 'current' },
                    { label: 'New Password',      key: 'new'     },
                    { label: 'Confirm Password',  key: 'confirm' },
                  ].map(f => (
                    <div className="st-field st-field-full" key={f.key}>
                      <label>{f.label}</label>
                      <div className="st-pw-wrap">
                        <input
                          type={showPw[f.key] ? 'text' : 'password'}
                          placeholder="••••••••"
                          value={pwForm[f.key]}
                          onChange={e => setPwForm(p => ({ ...p, [f.key]: e.target.value }))}
                        />
                        <button
                          type="button"
                          className="st-pw-toggle"
                          onClick={() => setShowPw(p => ({ ...p, [f.key]: !p[f.key] }))}
                        >
                          {showPw[f.key] ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {pwError && <p className="st-error">{pwError}</p>}

                <button className="st-btn-primary" onClick={handlePasswordSave}>
                  Update Password
                </button>
              </div>

              <div className="st-divider" />

              <div className="st-section-block">
                <div className="st-block-title">Two-Factor Authentication</div>
                <p className="st-block-desc">
                  Add an extra layer of security to your account.
                </p>
                <div className="st-toggle-row">
                  <div>
                    <span className="st-toggle-label">Enable 2FA</span>
                    <span className={settings.security.twoFactor ? 'st-badge-on' : 'st-badge-off'}>
                      {settings.security.twoFactor ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  <label className="st-toggle">
                    <input
                      type="checkbox"
                      checked={settings.security.twoFactor}
                      onChange={handle2FAToggle}
                    />
                    <span className="st-toggle-slider" />
                  </label>
                </div>
              </div>

              <div className="st-divider" />

              <div className="st-section-block">
                <div className="st-block-title">Active Sessions</div>
                <p className="st-block-desc">
                  Devices currently signed into your account.
                </p>
                {[
                  { device: 'Chrome on Windows', location: 'Lagos, Nigeria',  time: 'Active now',  current: true  },
                  { device: 'Safari on iPhone',  location: 'Abuja, Nigeria',  time: '2 hours ago', current: false },
                ].map((s, i) => (
                  <div className="st-session-row" key={i}>
                    <div className="st-session-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="1.8"
                        strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="3" width="20" height="14" rx="2"/>
                        <line x1="8" y1="21" x2="16" y2="21"/>
                        <line x1="12" y1="17" x2="12" y2="21"/>
                      </svg>
                    </div>
                    <div className="st-session-info">
                      <p>
                        {s.device}
                        {s.current && (
                          <span className="st-badge-current">Current</span>
                        )}
                      </p>
                      <span>{s.location} · {s.time}</span>
                    </div>
                    {!s.current && (
                      <button
                        className="st-btn-danger-sm"
                        onClick={handleRevokeSession}
                      >
                        Revoke
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── NOTIFICATIONS ── */}
          {tab === 'notifications' && (
            <div className="st-section">
              <div className="st-section-header">
                <h3>Notification Preferences</h3>
                <p>Choose what you want to be notified about</p>
              </div>

              {[
                {
                  group: 'Reports',
                  items: [
                    { key: 'reportDue',       label: 'Weekly report due reminders',   desc: 'Get notified when your report deadline is approaching'       },
                    { key: 'reportSubmitted', label: 'Report submitted confirmations', desc: 'Receive confirmation when a report is successfully submitted' },
                    { key: 'missingSubmit',   label: 'Missing submission alerts',      desc: 'Alert when zones in your region have not submitted'          },
                    { key: 'newTemplate',     label: 'New report templates',           desc: 'Notify when new report templates are published'              },
                  ],
                },
                {
                  group: 'Finance',
                  items: [
                    { key: 'financeUpdates', label: 'Finance record updates', desc: 'Notify when finance records are added or updated' },
                  ],
                },
                {
                  group: 'System',
                  items: [
                    { key: 'systemAlerts', label: 'System alerts', desc: 'Important platform-wide announcements and alerts' },
                  ],
                },
              ].map(group => (
                <div className="st-section-block" key={group.group}>
                  <div className="st-block-title">{group.group}</div>
                  {group.items.map(item => (
                    <div className="st-toggle-row" key={item.key}>
                      <div>
                        <span className="st-toggle-label">{item.label}</span>
                        <span className="st-toggle-desc">{item.desc}</span>
                      </div>
                      <label className="st-toggle">
                        <input
                          type="checkbox"
                          checked={!!settings.notifications[item.key]}
                          onChange={() => handleNotifToggle(item.key)}
                        />
                        <span className="st-toggle-slider" />
                      </label>
                    </div>
                  ))}
                </div>
              ))}

              <div className="st-form-actions">
                <button className="st-btn-primary" onClick={handleNotifSave}>
                  Save Preferences
                </button>
              </div>
            </div>
          )}

          {/* ── PREFERENCES ── */}
          {tab === 'preferences' && (
            <div className="st-section">
              <div className="st-section-header">
                <h3>Preferences</h3>
                <p>Customize your platform experience</p>
              </div>

              <div className="st-section-block">
                <div className="st-block-title">Display</div>
                <div className="st-form-grid" style={{ maxWidth: 480 }}>
                  <div className="st-field st-field-full">
                    <label>Language</label>
                    <select
                      value={prefDraft.language}
                      onChange={e => setPrefDraft(p => ({ ...p, language: e.target.value }))}
                    >
                      {['English','French','Portuguese','Spanish','Yoruba'].map(l => (
                        <option key={l}>{l}</option>
                      ))}
                    </select>
                  </div>
                  <div className="st-field st-field-full">
                    <label>Date Format</label>
                    <select
                      value={prefDraft.dateFormat}
                      onChange={e => setPrefDraft(p => ({ ...p, dateFormat: e.target.value }))}
                    >
                      {['MM/DD/YYYY','DD/MM/YYYY','YYYY-MM-DD'].map(f => (
                        <option key={f}>{f}</option>
                      ))}
                    </select>
                  </div>
                  <div className="st-field st-field-full">
                    <label>Currency</label>
                    <select
                      value={prefDraft.currency}
                      onChange={e => setPrefDraft(p => ({ ...p, currency: e.target.value }))}
                    >
                      {['USD ($)','EUR (€)','GBP (£)','NGN (₦)'].map(c => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="st-divider" />

              <div className="st-section-block">
                <div className="st-block-title">Theme</div>
                <p className="st-block-desc">Changes apply instantly across the entire app.</p>
                <div className="st-theme-grid">
                  {[
                    { label: 'Light',  value: 'light',  icon: '☀️' },
                    { label: 'Dark',   value: 'dark',   icon: '🌙' },
                    { label: 'System', value: 'system', icon: '💻' },
                  ].map(th => (
                    <div
                      key={th.value}
                      className={`st-theme-card ${settings.preferences.theme === th.value ? 'active' : ''}`}
                      onClick={() => handleThemeClick(th.value)}
                    >
                      <div className={`st-theme-preview ${th.value}`} />
                      <span>{th.label}</span>
                      {settings.preferences.theme === th.value && (
                        <div className="st-theme-check">
                          <Check size={10} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="st-form-actions">
                <button className="st-btn-primary" onClick={handlePrefSave}>
                  Save Preferences
                </button>
                <button
                  className="st-btn-ghost"
                  onClick={() => setPrefDraft({ ...settings.preferences })}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* ── PRIVACY ── */}
          {tab === 'privacy' && (
            <div className="st-section">
              <div className="st-section-header">
                <h3>Privacy</h3>
                <p>Control your data and privacy settings</p>
              </div>

              <div className="st-section-block">
                <div className="st-block-title">Data & Activity</div>
                {[
                  { key: 'activityLogging',   label: 'Activity logging',   desc: 'Allow the platform to log your activity for audit purposes'  },
                  { key: 'analyticsTracking', label: 'Analytics tracking', desc: 'Share anonymous usage data to help improve the platform'     },
                  { key: 'profileVisibility', label: 'Profile visibility', desc: 'Allow other users in your region to view your profile'       },
                ].map(item => (
                  <div className="st-toggle-row" key={item.key}>
                    <div>
                      <span className="st-toggle-label">{item.label}</span>
                      <span className="st-toggle-desc">{item.desc}</span>
                    </div>
                    <label className="st-toggle">
                      <input
                        type="checkbox"
                        checked={!!settings.privacy[item.key]}
                        onChange={() => handlePrivacyToggle(item.key)}
                      />
                      <span className="st-toggle-slider" />
                    </label>
                  </div>
                ))}
              </div>

              <div className="st-divider" />

              <div className="st-section-block">
                <div className="st-block-title" style={{ color: '#dc2626' }}>
                  Danger Zone
                </div>
                <p className="st-block-desc">
                  These actions are permanent and cannot be undone.
                </p>
                <div className="st-danger-row">
                  <div>
                    <p className="st-toggle-label">Delete Account</p>
                    <span className="st-toggle-desc">
                      Permanently delete your account and all associated data
                    </span>
                  </div>
                  <button className="st-btn-danger" onClick={handleDeleteAccount}>
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}