import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../auth/AuthContext';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import './styles.css';

const campaignData = [
  { name: 'Spring Outreach', Attendance: 1000 },
  { name: 'Easter Campaign', Attendance: 350  },
  { name: 'Healing Streams', Attendance: 750  },
];

const activity = [
  { name: 'John Smith',       action: 'Submitted report for Zone A', date: '3/8/2026' },
  { name: 'Sarah Johnson',    action: 'Submitted report for Zone B', date: '3/7/2026' },
  { name: 'David Lee',        action: 'Submitted report for Zone C', date: '3/6/2026' },
  { name: 'Mary Wilson',      action: 'Submitted report for Zone D', date: '3/5/2026' },
  { name: 'Carlos Rodriguez', action: 'Submitted report for Zone E', date: '3/4/2026' },
];

export default function ZonalDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const KPI = [
    { label: t.totalReports,    value: '5',      sub: '5 this week',        pct: '+12%', iconBg: '#ede9fe', iconColor: '#5b21b6',
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> },
    { label: t.totalFinance,    value: '$24.9K', sub: '5 entries',          pct: '+8%',  iconBg: '#dcfce7', iconColor: '#16a34a',
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg> },
    { label: t.totalAttendance, value: '2460',   sub: 'Across all regions', pct: '+24%', iconBg: '#e0f2fe', iconColor: '#0284c7',
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
    { label: t.completionRate,  value: '92%',    sub: 'This week',          pct: '+18%', iconBg: '#fff7ed', iconColor: '#ea580c',
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg> },
  ];

  return (
    <div className="zd-page">
      {/* Welcome */}
      <div className="zd-welcome">
        <h2>{t.welcomeBack}, Zonal! 👋</h2>
        <p>{today}</p>
      </div>

      {/* Reminder banner */}
      <div className="zd-reminder">
        <div className="zd-reminder-left">
          <p className="zd-reminder-title">{t.weeklyReminderTitle}</p>
          <p className="zd-reminder-desc">{t.weeklyReminderDesc}</p>
          <button className="zd-reminder-btn" onClick={() => navigate('/zonal/reporting')}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
            {t.submitReport}
          </button>
        </div>
        <div className="zd-reminder-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8"  y1="2" x2="8"  y2="6"/>
            <line x1="3"  y1="10" x2="21" y2="10"/>
          </svg>
        </div>
      </div>

      {/* KPI */}
      <div className="zd-kpi-grid">
        {KPI.map(k => (
          <div className="zd-kpi-card" key={k.label}>
            <div className="zd-kpi-top">
              <div className="zd-kpi-icon" style={{ background: k.iconBg, color: k.iconColor }}>
                {k.icon}
              </div>
              <span className="zd-kpi-pct">{k.pct}</span>
            </div>
            <div className="zd-kpi-value">{k.value}</div>
            <div className="zd-kpi-label">{k.label}</div>
            <div className="zd-kpi-sub">{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Chart + Activity */}
      <div className="zd-bottom-grid">
        <div className="zd-card">
          <h3>{t.campaignPerformance}</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={campaignData} barSize={44}>
              <CartesianGrid strokeDasharray="4 3" stroke="#f3f4f6" vertical={false}/>
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }}/>
              <Legend iconType="square" iconSize={10} wrapperStyle={{ fontSize: 12 }}/>
              <Bar dataKey="Attendance" name={t.attendance} fill="#4f46e5" radius={[6,6,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="zd-card">
          <h3>{t.recentActivity}</h3>
          <div className="zd-activity">
            {activity.map((a, i) => (
              <div className="zd-act-item" key={i}>
                <div className="zd-act-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
                </div>
                <div className="zd-act-info">
                  <p>{a.name}</p>
                  <span>{a.action}</span>
                  <span className="zd-act-date">{a.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
