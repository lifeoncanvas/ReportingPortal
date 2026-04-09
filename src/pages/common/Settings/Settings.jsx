import React, { useState, useEffect, useRef } from 'react';
import { User, Lock, Bell, Globe, Shield, ChevronRight, Eye, EyeOff, Check } from 'lucide-react';
import { useSettings } from '../../../context/SettingsContext';
import { useAuth }      from '../../../auth/AuthContext';
import './styles.css';

const LANGUAGE_OPTIONS = [
  { value: 'English',                native: 'English'            },
  { value: 'French',                 native: 'Français'           },
  { value: 'Spanish',                native: 'Español'            },
  { value: 'Portuguese',             native: 'Português'          },
  { value: 'Yoruba',                 native: 'Yorùbá'             },
  { value: 'Mandarin Chinese',       native: '中文'                },
  { value: 'Hindi',                  native: 'हिन्दी'              },
  { value: 'Modern Standard Arabic', native: 'العربية'            },
  { value: 'Indonesian',             native: 'Bahasa Indonesia'   },
  { value: 'Bengali',                native: 'বাংলা'               },
  { value: 'Russian',                native: 'Русский'            },
];

function Toast({ message, type = 'success', onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3000); return () => clearTimeout(t); }, [onDone]);
  return (
    <div className={`st-toast ${type}`}>
      {type === 'success' ? <Check size={14} /> : '✕'} {message}
    </div>
  );
}

function AvatarUpload({ profileDraft, setProfileDraft, showToast, t }) {
  const { avatar, updateAvatar } = useAuth();
  const fileInputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const handleFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) { showToast('Please select an image file.', 'error'); return; }
    if (file.size > 5 * 1024 * 1024)    { showToast('Image must be under 5MB.', 'error'); return; }
    const reader = new FileReader();
    reader.onload = (e) => {
      updateAvatar(e.target.result);
      setProfileDraft(p => ({ ...p, avatar: e.target.result }));
      showToast('Profile photo updated');
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    updateAvatar(null);
    setProfileDraft(p => ({ ...p, avatar: null }));
    if (fileInputRef.current) fileInputRef.current.value = '';
    showToast('Profile photo removed');
  };

  return (
    <div className="st-avatar-row">
      <div
        className={`st-avatar-wrap ${dragging ? 'dragging' : ''}`}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
      >
        {avatar ? (
          <img src={avatar} alt="Profile" className="st-avatar-img" />
        ) : (
          <div className="st-avatar">{profileDraft.firstName?.[0]}{profileDraft.lastName?.[0]}</div>
        )}
        <div className="st-avatar-overlay">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
            <circle cx="12" cy="13" r="4"/>
          </svg>
        </div>
      </div>
      <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp"
        style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />
      <div>
        <p className="st-avatar-name">{profileDraft.firstName} {profileDraft.lastName}</p>
        <p className="st-avatar-role">{profileDraft.role}</p>
        <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
          <button className="st-btn-outline" onClick={e => { e.stopPropagation(); fileInputRef.current?.click(); }}>
            {t?.changePhoto || 'Change Photo'}
          </button>
          {avatar && <button className="st-btn-danger-sm" onClick={handleRemove}>{t?.remove || 'Remove'}</button>}
        </div>
        <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 6 }}>
          JPG, PNG, GIF or WebP · Max 5MB
        </p>
      </div>
    </div>
  );
}

export default function Settings() {
  const { settings, updateSection, t } = useSettings();
  const { user, logout }               = useAuth();

  const [tab,   setTab]   = useState('profile');
  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => setToast({ message, type });

  const TABS = [
    { key: 'profile',       label: t?.profile       || 'Profile',       icon: User   },
    { key: 'security',      label: t?.security      || 'Security',      icon: Lock   },
    { key: 'notifications', label: t?.notifications || 'Notifications', icon: Bell   },
    { key: 'preferences',   label: t?.preferences   || 'Preferences',   icon: Globe  },
    { key: 'privacy',       label: t?.privacy       || 'Privacy',       icon: Shield },
  ];

  // Profile
  const [profileDraft, setProfileDraft] = useState({ ...settings.profile });
  useEffect(() => { setProfileDraft({ ...settings.profile }); }, [settings.profile]);
  const handleProfileSave = () => {
    if (!profileDraft.firstName?.trim() || !profileDraft.email?.trim()) {
      showToast('First name and email are required.', 'error'); return;
    }
    updateSection('profile', profileDraft);
    showToast(t?.saveChanges || 'Profile updated successfully');
  };

  // Security
  const [pwForm,  setPwForm]  = useState({ current: '', new: '', confirm: '' });
  const [showPw,  setShowPw]  = useState({ current: false, new: false, confirm: false });
  const [pwError, setPwError] = useState('');
  const handlePasswordSave = () => {
    setPwError('');
    if (pwForm.new.length < 6)             { setPwError('New password must be at least 6 characters.'); return; }
    if (pwForm.new !== pwForm.confirm)      { setPwError('Passwords do not match.'); return; }
    updateSection('security', { passwordUpdatedAt: new Date().toISOString() });
    setPwForm({ current: '', new: '', confirm: '' });
    showToast(t?.updatePassword || 'Password updated successfully');
  };
  const handle2FAToggle = () => {
    const next = !settings.security.twoFactor;
    updateSection('security', { twoFactor: next });
    showToast(next ? (t?.enabled || 'Enabled') : (t?.disabled || 'Disabled'));
  };

  // Preferences
  const [prefDraft, setPrefDraft] = useState({ ...settings.preferences });
  useEffect(() => { setPrefDraft({ ...settings.preferences }); }, [settings.preferences]);
  const handleThemeClick = (value) => { updateSection('preferences', { theme: value }); };
  const handlePrefSave   = () => { updateSection('preferences', prefDraft); showToast(t?.savePreferences || 'Preferences saved'); };

  // Privacy
  const handlePrivacyToggle = (key) => updateSection('privacy', { [key]: !settings.privacy[key] });
  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure? This cannot be undone.')) { sessionStorage.clear(); logout(); }
  };

  const NOTIF_GROUPS = [
    {
      group: t?.reports || 'Reports',
      items: [
        { key: 'reportDue',       label: t?.reportDueLabel       || 'Weekly report due reminders',   desc: t?.reportDueDesc       || 'Get notified when your report deadline is approaching'       },
        { key: 'reportSubmitted', label: t?.reportSubmittedLabel || 'Report submitted confirmations', desc: t?.reportSubmittedDesc || 'Receive confirmation when a report is successfully submitted' },
        { key: 'missingSubmit',   label: t?.missingSubmitLabel   || 'Missing submission alerts',      desc: t?.missingSubmitDesc   || 'Alert when zones in your region have not submitted'          },
        { key: 'newTemplate',     label: t?.newTemplateLabel     || 'New report templates',           desc: t?.newTemplateDesc     || 'Notify when new report templates are published'              },
      ],
    },
    {
      group: t?.financePortal || 'Finance',
      items: [
        { key: 'financeUpdates', label: t?.financeUpdatesLabel || 'Finance record updates', desc: t?.financeUpdatesDesc || 'Notify when finance records are added or updated' },
      ],
    },
    {
      group: 'System',
      items: [
        { key: 'systemAlerts', label: t?.systemAlertsLabel || 'System alerts', desc: t?.systemAlertsDesc || 'Important platform-wide announcements and alerts' },
      ],
    },
  ];

  return (
    <div className="st-page">
      {toast && <Toast message={toast.message} type={toast.type} onDone={() => setToast(null)} />}

      <div className="st-page-header">
        <h2>{t?.settingsTitle || 'Settings'}</h2>
        <p>{t?.settingsDesc || 'Manage your account preferences and configuration'}</p>
      </div>

      <div className="st-layout">
        <aside className="st-sidenav">
          {TABS.map(tb => {
            const Icon = tb.icon;
            return (
              <button key={tb.key} onClick={() => setTab(tb.key)}
                className={`st-sidenav-item ${tab === tb.key ? 'active' : ''}`}>
                <Icon size={16} />
                {tb.label}
                <ChevronRight size={14} className="st-sidenav-arrow" />
              </button>
            );
          })}
        </aside>

        <div className="st-panel">

          {/* PROFILE */}
          {tab === 'profile' && (
            <div className="st-section">
              <div className="st-section-header">
                <h3>{t?.profileInfo || 'Profile Information'}</h3>
                <p>{t?.profileInfoDesc || 'Update your personal details and contact information'}</p>
              </div>
              <AvatarUpload profileDraft={profileDraft} setProfileDraft={setProfileDraft} showToast={showToast} t={t} />
              <div className="st-divider" />
              <div className="st-form-grid">
                {[
                  { key: 'firstName', label: t?.firstName || 'First Name' },
                  { key: 'lastName',  label: t?.lastName  || 'Last Name'  },
                ].map(f => (
                  <div className="st-field" key={f.key}>
                    <label>{f.label}</label>
                    <input type="text" value={profileDraft[f.key] || ''}
                      onChange={e => setProfileDraft(p => ({ ...p, [f.key]: e.target.value }))} />
                  </div>
                ))}
                <div className="st-field st-field-full">
                  <label>{t?.emailAddress || 'Email Address'}</label>
                  <input type="email" value={profileDraft.email || ''}
                    onChange={e => setProfileDraft(p => ({ ...p, email: e.target.value }))} />
                </div>
                <div className="st-field">
                  <label>{t?.phoneNumber || 'Phone Number'}</label>
                  <input type="text" value={profileDraft.phone || ''}
                    onChange={e => setProfileDraft(p => ({ ...p, phone: e.target.value }))} />
                </div>
                <div className="st-field">
                  <label>{t?.timezone || 'Timezone'}</label>
                  <select value={profileDraft.timezone || 'UTC+0'}
                    onChange={e => setProfileDraft(p => ({ ...p, timezone: e.target.value }))}>
                    {['UTC-8','UTC-5','UTC+0','UTC+1','UTC+3','UTC+5:30','UTC+8','UTC+9'].map(tz => (
                      <option key={tz}>{tz}</option>
                    ))}
                  </select>
                </div>
                <div className="st-field">
                  <label>{t?.role || 'Role'}</label>
                  <input type="text" value={profileDraft.role || ''} disabled className="st-input-disabled" />
                </div>
                <div className="st-field">
                  <label>{t?.region || 'Region'}</label>
                  <input type="text" value={profileDraft.region || ''} disabled className="st-input-disabled" />
                </div>
              </div>
              <div className="st-form-actions">
                <button className="st-btn-primary" onClick={handleProfileSave}>{t?.saveChanges || 'Save Changes'}</button>
                <button className="st-btn-ghost" onClick={() => setProfileDraft({ ...settings.profile })}>{t?.cancel || 'Cancel'}</button>
              </div>
            </div>
          )}

          {/* SECURITY */}
          {tab === 'security' && (
            <div className="st-section">
              <div className="st-section-header">
                <h3>{t?.securityTitle || 'Security'}</h3>
                <p>{t?.securityDesc || 'Manage your password and account security'}</p>
              </div>
              <div className="st-section-block">
                <div className="st-block-title">{t?.changePassword || 'Change Password'}</div>
                <div className="st-form-grid" style={{ maxWidth: 480 }}>
                  {[
                    { label: t?.currentPassword || 'Current Password', key: 'current' },
                    { label: t?.newPassword     || 'New Password',      key: 'new'     },
                    { label: t?.confirmPassword || 'Confirm Password',  key: 'confirm' },
                  ].map(f => (
                    <div className="st-field st-field-full" key={f.key}>
                      <label>{f.label}</label>
                      <div className="st-pw-wrap">
                        <input type={showPw[f.key] ? 'text' : 'password'} placeholder="••••••••"
                          value={pwForm[f.key]}
                          onChange={e => setPwForm(p => ({ ...p, [f.key]: e.target.value }))} />
                        <button type="button" className="st-pw-toggle"
                          onClick={() => setShowPw(p => ({ ...p, [f.key]: !p[f.key] }))}>
                          {showPw[f.key] ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                {pwError && <p className="st-error">{pwError}</p>}
                <button className="st-btn-primary" onClick={handlePasswordSave}>
                  {t?.updatePassword || 'Update Password'}
                </button>
              </div>
              <div className="st-divider" />
              <div className="st-section-block">
                <div className="st-block-title">{t?.twoFactor || 'Two-Factor Authentication'}</div>
                <p className="st-block-desc">{t?.twoFactorDesc || 'Add an extra layer of security to your account.'}</p>
                <div className="st-toggle-row">
                  <div>
                    <span className="st-toggle-label">{t?.enable2FA || 'Enable 2FA'}</span>
                    <span className={settings.security?.twoFactor ? 'st-badge-on' : 'st-badge-off'}>
                      {settings.security?.twoFactor ? (t?.enabled || 'Enabled') : (t?.disabled || 'Disabled')}
                    </span>
                  </div>
                  <label className="st-toggle">
                    <input type="checkbox" checked={!!settings.security?.twoFactor} onChange={handle2FAToggle} />
                    <span className="st-toggle-slider" />
                  </label>
                </div>
              </div>
              <div className="st-divider" />
              <div className="st-section-block">
                <div className="st-block-title">{t?.activeSessions || 'Active Sessions'}</div>
                <p className="st-block-desc">{t?.activeSessionsDesc || 'Devices currently signed into your account.'}</p>
                {[
                  { device: 'Chrome on Windows', location: 'Lagos, Nigeria',  time: 'Active now',  current: true  },
                  { device: 'Safari on iPhone',  location: 'Abuja, Nigeria',  time: '2 hours ago', current: false },
                ].map((s, i) => (
                  <div className="st-session-row" key={i}>
                    <div className="st-session-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="3" width="20" height="14" rx="2"/>
                        <line x1="8" y1="21" x2="16" y2="21"/>
                        <line x1="12" y1="17" x2="12" y2="21"/>
                      </svg>
                    </div>
                    <div className="st-session-info">
                      <p>{s.device} {s.current && <span className="st-badge-current">{t?.current || 'Current'}</span>}</p>
                      <span>{s.location} · {s.time}</span>
                    </div>
                    {!s.current && (
                      <button className="st-btn-danger-sm" onClick={() => showToast('Session revoked')}>
                        {t?.revoke || 'Revoke'}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* NOTIFICATIONS */}
          {tab === 'notifications' && (
            <div className="st-section">
              <div className="st-section-header">
                <h3>{t?.notifPrefs || 'Notification Preferences'}</h3>
                <p>{t?.notifPrefsDesc || 'Choose what you want to be notified about'}</p>
              </div>
              {NOTIF_GROUPS.map(group => (
                <div className="st-section-block" key={group.group}>
                  <div className="st-block-title">{group.group}</div>
                  {group.items.map(item => (
                    <div className="st-toggle-row" key={item.key}>
                      <div>
                        <span className="st-toggle-label">{item.label}</span>
                        <span className="st-toggle-desc">{item.desc}</span>
                      </div>
                      <label className="st-toggle">
                        <input type="checkbox" checked={!!settings.notifications?.[item.key]}
                          onChange={() => updateSection('notifications', { [item.key]: !settings.notifications[item.key] })} />
                        <span className="st-toggle-slider" />
                      </label>
                    </div>
                  ))}
                </div>
              ))}
              <div className="st-form-actions">
                <button className="st-btn-primary" onClick={() => showToast(t?.savePreferences || 'Preferences saved')}>
                  {t?.savePreferences || 'Save Preferences'}
                </button>
              </div>
            </div>
          )}

          {/* PREFERENCES */}
          {tab === 'preferences' && (
            <div className="st-section">
              <div className="st-section-header">
                <h3>{t?.preferencesTitle || 'Preferences'}</h3>
                <p>{t?.preferencesDesc || 'Customize your platform experience'}</p>
              </div>
              <div className="st-section-block">
                <div className="st-block-title">{t?.display || 'Display'}</div>
                <div className="st-form-grid" style={{ maxWidth: 480 }}>
                  <div className="st-field st-field-full">
                    <label>{t?.language || 'Language'}</label>
                    <select value={prefDraft.language || 'English'}
                      onChange={e => setPrefDraft(p => ({ ...p, language: e.target.value }))}>
                      {LANGUAGE_OPTIONS.map(l => (
                        <option key={l.value} value={l.value}>{l.value} — {l.native}</option>
                      ))}
                    </select>
                  </div>
                  <div className="st-field st-field-full">
                    <label>{t?.dateFormat || 'Date Format'}</label>
                    <select value={prefDraft.dateFormat || 'MM/DD/YYYY'}
                      onChange={e => setPrefDraft(p => ({ ...p, dateFormat: e.target.value }))}>
                      {['MM/DD/YYYY','DD/MM/YYYY','YYYY-MM-DD'].map(f => <option key={f}>{f}</option>)}
                    </select>
                  </div>
                  <div className="st-field st-field-full">
                    <label>{t?.currency || 'Currency'}</label>
                    <select value={prefDraft.currency || 'USD ($)'}
                      onChange={e => setPrefDraft(p => ({ ...p, currency: e.target.value }))}>
                      {['USD ($)','EUR (€)','GBP (£)','NGN (₦)'].map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
              </div>
              <div className="st-divider" />
              <div className="st-section-block">
                <div className="st-block-title">{t?.theme || 'Theme'}</div>
                <p className="st-block-desc">{t?.themeDesc || 'Changes apply instantly across the entire app.'}</p>
                <div className="st-theme-grid">
                  {[
                    { label: t?.light  || 'Light',  value: 'light'  },
                    { label: t?.dark   || 'Dark',   value: 'dark'   },
                    { label: t?.system || 'System', value: 'system' },
                  ].map(th => (
                    <div key={th.value}
                      className={`st-theme-card ${settings.preferences?.theme === th.value ? 'active' : ''}`}
                      onClick={() => handleThemeClick(th.value)}>
                      <div className={`st-theme-preview ${th.value}`} />
                      <span>{th.label}</span>
                      {settings.preferences?.theme === th.value && (
                        <div className="st-theme-check"><Check size={10} /></div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div className="st-form-actions">
                <button className="st-btn-primary" onClick={handlePrefSave}>{t?.savePreferences || 'Save Preferences'}</button>
                <button className="st-btn-ghost" onClick={() => setPrefDraft({ ...settings.preferences })}>{t?.cancel || 'Cancel'}</button>
              </div>
            </div>
          )}

          {/* PRIVACY */}
          {tab === 'privacy' && (
            <div className="st-section">
              <div className="st-section-header">
                <h3>{t?.privacyTitle || 'Privacy'}</h3>
                <p>{t?.privacyDesc || 'Control your data and privacy settings'}</p>
              </div>
              <div className="st-section-block">
                <div className="st-block-title">{t?.dataActivity || 'Data & Activity'}</div>
                {[
                  { key: 'activityLogging',   label: t?.activityLogging   || 'Activity logging',   desc: t?.activityLoggingDesc   || 'Allow the platform to log your activity for audit purposes'  },
                  { key: 'analyticsTracking', label: t?.analyticsTracking || 'Analytics tracking', desc: t?.analyticsTrackingDesc || 'Share anonymous usage data to help improve the platform'     },
                  { key: 'profileVisibility', label: t?.profileVisibility || 'Profile visibility', desc: t?.profileVisibilityDesc || 'Allow other users in your region to view your profile'       },
                ].map(item => (
                  <div className="st-toggle-row" key={item.key}>
                    <div>
                      <span className="st-toggle-label">{item.label}</span>
                      <span className="st-toggle-desc">{item.desc}</span>
                    </div>
                    <label className="st-toggle">
                      <input type="checkbox" checked={!!settings.privacy?.[item.key]}
                        onChange={() => handlePrivacyToggle(item.key)} />
                      <span className="st-toggle-slider" />
                    </label>
                  </div>
                ))}
              </div>
              <div className="st-divider" />
              <div className="st-section-block">
                <div className="st-block-title" style={{ color: '#dc2626' }}>{t?.dangerZone || 'Danger Zone'}</div>
                <p className="st-block-desc">{t?.dangerZoneDesc || 'These actions are permanent and cannot be undone.'}</p>
                <div className="st-danger-row">
                  <div>
                    <p className="st-toggle-label">{t?.deleteAccount || 'Delete Account'}</p>
                    <span className="st-toggle-desc">{t?.deleteAccountDesc || 'Permanently delete your account and all associated data'}</span>
                  </div>
                  <button className="st-btn-danger" onClick={handleDeleteAccount}>
                    {t?.deleteAccount || 'Delete Account'}
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
