import React, { useState } from 'react';
import { Trash2, Bell, CheckCircle, AlertCircle, Info, Calendar } from 'lucide-react';
import './styles.css';

const INITIAL_NOTIFICATIONS = [
  {
    id: 1, isNew: true,
    icon: 'calendar', title: 'Weekly Report Due',
    message: 'Your weekly report for Zone A is due by end of day Thursday.',
    time: '3/10/2026, 1:30:00 PM',
  },
  {
    id: 2, isNew: false,
    icon: 'success', title: 'Report Submitted Successfully',
    message: 'Your report RPT-001 has been submitted and is under review.',
    time: '3/8/2026, 4:01:00 PM',
  },
  {
    id: 3, isNew: true,
    icon: 'alert', title: 'Missing Submissions',
    message: "3 zones in your region have not submitted this week's report.",
    time: '3/9/2026, 9:30:00 PM',
  },
  {
    id: 4, isNew: false,
    icon: 'info', title: 'New Report Template Available',
    message: 'Updated Q2 2026 report template is now available in the submission form.',
    time: '3/7/2026, 5:30:00 PM',
  },
];

const ICON_MAP = {
  calendar: { el: Calendar,     bg: '#ede9fe', color: '#5b21b6' },
  success:  { el: CheckCircle,  bg: '#dcfce7', color: '#16a34a' },
  alert:    { el: AlertCircle,  bg: '#fee2e2', color: '#dc2626' },
  info:     { el: Info,         bg: '#f3f4f6', color: '#6b7280' },
};

export default function Notifications() {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [tab, setTab] = useState('all');

  const unreadCount = notifications.filter(n => n.isNew).length;

  const displayed = tab === 'unread'
    ? notifications.filter(n => n.isNew)
    : notifications;

  const markRead = (id) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, isNew: false } : n)
    );
  };

  const deleteNotif = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isNew: false })));
  };

  return (
    <div className="notif-page">
      {/* Header */}
      <div className="notif-header">
        <div>
          <h2>Notifications</h2>
          <p>{unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}</p>
        </div>
        <button className="notif-mark-all-btn" onClick={markAllRead}>
          <Bell size={15} /> Mark All as Read
        </button>
      </div>

      {/* Card */}
      <div className="notif-card">
        {/* Tabs */}
        <div className="notif-tabs">
          <button
            className={`notif-tab ${tab === 'all' ? 'active' : ''}`}
            onClick={() => setTab('all')}
          >
            All ({notifications.length})
          </button>
          <button
            className={`notif-tab ${tab === 'unread' ? 'active' : ''}`}
            onClick={() => setTab('unread')}
          >
            Unread ({unreadCount})
          </button>
        </div>

        {/* List */}
        <div className="notif-list">
          {displayed.length === 0 && (
            <div className="notif-empty">
              <Bell size={32} color="#d1d5db" />
              <p>No notifications</p>
            </div>
          )}
          {displayed.map((notif, i) => {
            const { el: Icon, bg, color } = ICON_MAP[notif.icon] || ICON_MAP.info;
            return (
              <div
                key={notif.id}
                className={`notif-item ${notif.isNew ? 'unread' : ''} ${i < displayed.length - 1 ? 'bordered' : ''}`}
              >
                <div className="notif-icon" style={{ background: bg }}>
                  <Icon size={18} color={color} strokeWidth={1.8} />
                </div>
                <div className="notif-body">
                  <div className="notif-title-row">
                    <span className="notif-title">{notif.title}</span>
                    {notif.isNew && <span className="notif-new-badge">New</span>}
                  </div>
                  <p className="notif-message">{notif.message}</p>
                  <span className="notif-time">{notif.time}</span>
                </div>
                <div className="notif-actions">
                  {notif.isNew && (
                    <button className="notif-read-btn" onClick={() => markRead(notif.id)}>
                      Mark as read
                    </button>
                  )}
                  <button className="notif-delete-btn" onClick={() => deleteNotif(notif.id)}>
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