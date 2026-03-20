import React from 'react';
import { Users, FileText, DollarSign, Shield, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './styles.css';

const KPI = [
  { label: 'Total Users',   value: '248',    pct: '+5%',  iconBg: '#ede9fe', iconColor: '#5b21b6', icon: Users      },
  { label: 'Total Reports', value: '1,284',  pct: '+12%', iconBg: '#dcfce7', iconColor: '#16a34a', icon: FileText   },
  { label: 'Total Finance', value: '$84.2K', pct: '+8%',  iconBg: '#e0f2fe', iconColor: '#0284c7', icon: DollarSign },
  { label: 'Active Roles',  value: '3',      pct: '',     iconBg: '#fff7ed', iconColor: '#ea580c', icon: Shield     },
];

const USERS = [
  { initials: 'G', bg: '#e0e7ff', color: '#4f46e5', name: 'Global Partnership Manager', email: 'global@loveworld.com', role: 'Global',  roleBg: '#ede9fe', roleColor: '#5b21b6', status: 'active'   },
  { initials: 'Z', bg: '#dbeafe', color: '#1d4ed8', name: 'Zonal Partnership Manager',  email: 'zonal@loveworld.com',  role: 'Zonal',   roleBg: '#dbeafe', roleColor: '#1d4ed8', status: 'active'   },
  { initials: 'S', bg: '#fef9c3', color: '#a16207', name: 'System Administrator',        email: 'admin@loveworld.com',  role: 'Admin',   roleBg: '#fef9c3', roleColor: '#a16207', status: 'active'   },
  { initials: 'F', bg: '#fce7f3', color: '#9d174d', name: 'Finance Manager',             email: 'finance@loveworld.com',role: 'Finance', roleBg: '#fce7f3', roleColor: '#9d174d', status: 'inactive' },
];

const LOGS = [
  { dot: '#4f46e5', action: 'Created new user',       module: 'User Mgmt',  moduleBg: '#ede9fe', moduleColor: '#5b21b6', user: 'System Administrator', time: '3/10/2026 2:00 PM'  },
  { dot: '#16a34a', action: 'Submitted weekly report', module: 'Reporting',  moduleBg: '#dcfce7', moduleColor: '#16a34a', user: 'John Smith',           time: '3/8/2026 4:00 PM'   },
  { dot: '#0284c7', action: 'Downloaded report',       module: 'Analytics',  moduleBg: '#e0f2fe', moduleColor: '#0284c7', user: 'Regional Manager',     time: '3/8/2026 8:50 PM'   },
  { dot: '#a16207', action: 'Updated user role',       module: 'User Mgmt',  moduleBg: '#fef9c3', moduleColor: '#a16207', user: 'System Administrator', time: '3/7/2026 2:45 PM'   },
  { dot: '#9d174d', action: 'Exported finance data',   module: 'Finance',    moduleBg: '#fce7f3', moduleColor: '#9d174d', user: 'Finance Manager',      time: '3/6/2026 8:15 PM'   },
];

const REGION_STATS = [
  { label: 'North America', count: 412, pct: 80 },
  { label: 'Africa',        count: 334, pct: 65 },
  { label: 'Europe',        count: 268, pct: 52 },
  { label: 'Asia Pacific',  count: 206, pct: 40 },
  { label: 'South America', count: 164, pct: 32 },
];

const ROLE_DIST = [
  { label: 'Zonal Managers',    count: 86,  pct: 70, color: '#1d4ed8' },
  { label: 'Finance Managers',  count: 48,  pct: 45, color: '#9d174d' },
  { label: 'Global Managers',   count: 12,  pct: 30, color: '#5b21b6' },
  { label: 'Administrators',    count: 4,   pct: 10, color: '#a16207' },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <div className="ad-page">

      {/* Header */}
      <div className="ad-page-header">
        <div>
          <h2>Welcome back, System! 🛡️</h2>
          <p>{today}</p>
        </div>
        <button className="ad-export-btn">
          <Download size={15} /> Export Report
        </button>
      </div>

      {/* KPI */}
      <div className="ad-kpi-grid">
        {KPI.map(k => {
          const Icon = k.icon;
          return (
            <div className="ad-kpi-card" key={k.label}>
              <div className="ad-kpi-top">
                <div className="ad-kpi-icon" style={{ background: k.iconBg }}>
                  <Icon size={18} color={k.iconColor} strokeWidth={1.8} />
                </div>
                {k.pct && <span className="ad-kpi-pct">{k.pct}</span>}
              </div>
              <div className="ad-kpi-value">{k.value}</div>
              <div className="ad-kpi-label">{k.label}</div>
            </div>
          );
        })}
      </div>

      {/* Row 2: Users + Logs */}
      <div className="ad-row2">
        <div className="ad-card">
          <div className="ad-card-header">
            <h3>User Management</h3>
            <button className="ad-link-btn" onClick={() => navigate('/admin/users')}>
              View all →
            </button>
          </div>
          {USERS.map((u, i) => (
            <div className="ad-user-row" key={i}>
              <div className="ad-user-av" style={{ background: u.bg, color: u.color }}>
                {u.initials}
              </div>
              <div className="ad-user-info">
                <p>{u.name}</p>
                <span>{u.email}</span>
              </div>
              <span className="ad-badge" style={{ background: u.roleBg, color: u.roleColor }}>
                {u.role}
              </span>
              <span className={`ad-status ${u.status}`}>{u.status}</span>
            </div>
          ))}
        </div>

        <div className="ad-card">
          <div className="ad-card-header">
            <h3>Recent Audit Logs</h3>
            <button className="ad-link-btn" onClick={() => navigate('/admin/audit')}>
              View all →
            </button>
          </div>
          {LOGS.map((l, i) => (
            <div className="ad-log-row" key={i}>
              <div className="ad-log-dot" style={{ background: l.dot }} />
              <div className="ad-log-info">
                <p>
                  {l.action}
                  <span className="ad-mod-badge" style={{ background: l.moduleBg, color: l.moduleColor }}>
                    {l.module}
                  </span>
                </p>
                <span>{l.user} · {l.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Row 3: Stats */}
      <div className="ad-row3">
        <div className="ad-card">
          <h3>Reports by Region</h3>
          {REGION_STATS.map(r => (
            <div className="ad-stat-row" key={r.label}>
              <span className="ad-stat-lbl">{r.label}</span>
              <div className="ad-bar-bg">
                <div className="ad-bar-fill" style={{ width: `${r.pct}%`, background: '#4f46e5' }} />
              </div>
              <span className="ad-stat-val">{r.count}</span>
            </div>
          ))}
        </div>

        <div className="ad-card">
          <h3>System Health</h3>
          {[
            { label: 'API Uptime',      value: '99.9%',   color: '#16a34a' },
            { label: 'DB Connections',  value: '24 / 100',color: ''        },
            { label: 'Last Backup',     value: '2h ago',  color: ''        },
            { label: 'Pending Jobs',    value: '3',       color: '#ea580c' },
            { label: 'Error Rate',      value: '0.02%',   color: '#16a34a' },
            { label: 'Active Sessions', value: '18',      color: ''        },
          ].map(s => (
            <div className="ad-health-row" key={s.label}>
              <span className="ad-stat-lbl">{s.label}</span>
              <span className="ad-stat-val" style={s.color ? { color: s.color } : {}}>
                {s.value}
              </span>
            </div>
          ))}
        </div>

        <div className="ad-card">
          <h3>Role Distribution</h3>
          {ROLE_DIST.map(r => (
            <div className="ad-stat-row" key={r.label}>
              <span className="ad-stat-lbl">{r.label}</span>
              <div className="ad-bar-bg">
                <div className="ad-bar-fill" style={{ width: `${r.pct}%`, background: r.color }} />
              </div>
              <span className="ad-stat-val">{r.count}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}