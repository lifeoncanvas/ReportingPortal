import React from 'react';
import { Users, FileText, Shield, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../../context/NotificationContext';
import { useAuth } from '../../../auth/AuthContext';
import './styles.css';

const KPI = [
  { label: 'Total Users',   value: '248',    pct: '+5%',  iconBg: '#ede9fe', iconColor: '#5b21b6', icon: Users      },
  { label: 'Total Reports', value: '1,284',  pct: '+12%', iconBg: '#dcfce7', iconColor: '#16a34a', icon: FileText   },
  { label: 'Active Roles',  value: '3',      pct: '',     iconBg: '#fff7ed', iconColor: '#ea580c', icon: Shield     },
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
  const { notifications } = useNotifications();
  const magazineNotifs = notifications.filter(n => n.icon === 'magazine').slice(0, 5);
  const { user } = useAuth();
  const [stats, setStats] = React.useState(null);
  const [users, setUsers] = React.useState([]);

  React.useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/api/dashboard/stats`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => setStats(data))
      .catch(err => console.error("Stats API error:", err));

    fetch(`${process.env.REACT_APP_API_URL}/api/users`)
      .then(res => res.json())
      .then(data => setUsers(data.slice(0, 4)))
      .catch(err => console.error("Users API error:", err));
  }, []);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const KPI_DATA = [
    { label: 'Total Users',   value: stats?.totalUsers || '0',    pct: '+5%',  iconBg: '#ede9fe', iconColor: '#5b21b6', icon: Users      },
    { label: 'Total Reports', value: stats?.totalReports || '0',  pct: '+12%', iconBg: '#dcfce7', iconColor: '#16a34a', icon: FileText   },
    { label: 'Active Roles',  value: '3',      pct: '',     iconBg: '#fff7ed', iconColor: '#ea580c', icon: Shield     },
  ];

  return (
    <div className="ad-page">

      {/* Header */}
      <div className="ad-page-header">
        <div>
          <h2>Welcome back, {user?.name || 'System'}! 🛡️</h2>
          <p>{today}</p>
        </div>
        <button className="ad-export-btn">
          <Download size={15} /> Export Report
        </button>
      </div>

      {/* KPI */}
      <div className="ad-kpi-grid">
        {KPI_DATA.map(k => {
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
          {users.map((u, i) => (
            <div className="ad-user-row" key={i}>
              <div className="ad-user-av" style={{ background: '#ede9fe', color: '#5b21b6' }}>
                {u.firstName?.charAt(0) || u.name?.charAt(0) || 'U'}
              </div>
              <div className="ad-user-info">
                <p>{u.firstName} {u.lastName}</p>
                <span>{u.email}</span>
              </div>
              <span className="ad-badge" style={{ background: '#ede9fe', color: '#5b21b6' }}>
                {u.role}
              </span>
              <span className={`ad-status ${u.status || 'active'}`}>{u.status || 'active'}</span>
            </div>
          ))}
        </div>

        <div className="ad-card">
          <div className="ad-card-header">
            <h3>Recent Activity</h3>
            <button className="ad-link-btn" onClick={() => navigate('/admin/audit')}>
              View all →
            </button>
          </div>
          {(stats?.recentActivity || []).map((l, i) => (
            <div className="ad-log-row" key={i}>
              <div className="ad-log-dot" style={{ background: '#16a34a' }} />
              <div className="ad-log-info">
                <p>
                  Submitted report for {l.zone}
                  <span className="ad-mod-badge" style={{ background: '#dcfce7', color: '#16a34a' }}>
                    Reporting
                  </span>
                </p>
                <span>{l.user} · {l.date}</span>
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