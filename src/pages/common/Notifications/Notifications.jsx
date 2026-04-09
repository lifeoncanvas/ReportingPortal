import React, { useState } from 'react';
import { Trash2, Bell, CheckCircle, AlertCircle, Info, Calendar, BookOpen } from 'lucide-react';
import { useNotifications } from '../../../context/NotificationContext';
import { useAuth }           from '../../../auth/AuthContext';
import { useSettings }       from '../../../context/SettingsContext';
import './styles.css';

const ICON_MAP = {
  calendar: { el: Calendar,    bg: '#ede9fe', color: '#5b21b6' },
  success:  { el: CheckCircle, bg: '#dcfce7', color: '#16a34a' },
  alert:    { el: AlertCircle, bg: '#fee2e2', color: '#dc2626' },
  info:     { el: Info,        bg: '#f3f4f6', color: '#6b7280' },
  magazine: { el: BookOpen,    bg: '#fef3c7', color: '#d97706' },
};

export default function Notifications() {
  const { user }                                        = useAuth();
  const { notifications, markRead, markAllRead, remove } = useNotifications();
  const { t }                                           = useSettings();
  const [tab, setTab] = useState('all');

  const visible = notifications.filter(n => {
    if (n.role === 'global_admin') return ['global', 'admin'].includes(user?.role);
    if (n.role === 'zonal')        return user?.role === 'zonal';
    return true;
  });

  const unreadCount = visible.filter(n => n.isNew).length;
  const displayed   = tab === 'unread' ? visible.filter(n => n.isNew) : visible;

  return (
    <div className="notif-page">
      <div className="notif-header">
        <div>
          <h2>{t?.notifications || 'Notifications'}</h2>
          <p>{unreadCount} {t?.unread || 'unread'}</p>
        </div>
        <button className="notif-mark-all-btn" onClick={markAllRead}>
          <Bell size={15} /> {t?.markAllRead || 'Mark All as Read'}
        </button>
      </div>

      <div className="notif-card">
        <div className="notif-tabs">
          <button className={`notif-tab ${tab === 'all'    ? 'active' : ''}`} onClick={() => setTab('all')}>
            {t?.all || 'All'} ({visible.length})
          </button>
          <button className={`notif-tab ${tab === 'unread' ? 'active' : ''}`} onClick={() => setTab('unread')}>
            {t?.unread || 'Unread'} ({unreadCount})
          </button>
        </div>

        <div className="notif-list">
          {displayed.length === 0 && (
            <div className="notif-empty">
              <Bell size={32} color="#d1d5db" />
              <p>{t?.noNotifications || 'No notifications'}</p>
            </div>
          )}
          {displayed.map((notif, i) => {
            const { el: Icon, bg, color } = ICON_MAP[notif.icon] || ICON_MAP.info;
            return (
              <div key={notif.id}
                className={`notif-item ${notif.isNew ? 'unread' : ''} ${i < displayed.length - 1 ? 'bordered' : ''}`}
              >
                <div className="notif-icon" style={{ background: bg }}>
                  <Icon size={18} color={color} strokeWidth={1.8} />
                </div>
                <div className="notif-body">
                  <div className="notif-title-row">
                    <span className="notif-title">{notif.title}</span>
                    {notif.isNew && <span className="notif-new-badge">{t?.new || 'New'}</span>}
                  </div>
                  <p className="notif-message">{notif.message}</p>
                  <span className="notif-time">{notif.time}</span>
                </div>
                <div className="notif-actions">
                  {notif.isNew && (
                    <button className="notif-read-btn" onClick={() => markRead(notif.id)}>
                      {t?.markAsRead || 'Mark as read'}
                    </button>
                  )}
                  <button className="notif-delete-btn" onClick={() => remove(notif.id)}>
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
