import React from 'react';
import { FileText, DollarSign, Users, TrendingUp, BookOpen } from 'lucide-react';
import { useSettings } from '../../../context/SettingsContext';
import { useAuth } from '../../../auth/AuthContext';
import { useNotifications } from '../../../context/NotificationContext';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import './styles.css';

const REGION_COLORS = ['#4f46e5', '#818cf8', '#a5b4fc', '#c7d2fe'];

const monthlyData = [
  { month: 'Jan', reports: 40, finance: 24 },
  { month: 'Feb', reports: 55, finance: 38 },
  { month: 'Mar', reports: 47, finance: 30 },
  { month: 'Apr', reports: 62, finance: 45 },
  { month: 'May', reports: 58, finance: 50 },
  { month: 'Jun', reports: 75, finance: 60 },
];

const regionData = [
  { name: 'Africa',   value: 40 },
  { name: 'Europe',   value: 25 },
  { name: 'Americas', value: 20 },
  { name: 'Asia',     value: 15 },
];

export default function Dashboard() {
  const { t, formatDate, currSymbol } = useSettings();
  const { user } = useAuth();
  const { notifications } = useNotifications();
  const magazineNotifs = notifications.filter(n => n.icon === 'magazine').slice(0, 5);
  const [stats, setStats] = React.useState(null);

  React.useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/api/dashboard/stats`)
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error(err));
  }, []);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const KPI_CARDS = [
    { icon: FileText,   iconBg: '#ede9fe', iconColor: '#5b21b6', pct: '+12%', pctBg: '#ede9fe', pctColor: '#5b21b6', value: stats?.totalReports || '0',              label: t.totalReports,    sub: `${stats?.reportsThisWeek || 0} this week`         },
    { icon: DollarSign, iconBg: '#dcfce7', iconColor: '#16a34a', pct: '+8%',  pctBg: '#dcfce7', pctColor: '#16a34a', value: `${currSymbol}${stats?.totalFinance?.toLocaleString() || '0'}`, label: t.totalFinance,    sub: `${stats?.financeEntries || 0} entries`           },
    { icon: Users,      iconBg: '#e0f2fe', iconColor: '#0284c7', pct: '+24%', pctBg: '#e0f2fe', pctColor: '#0284c7', value: stats?.totalAttendance?.toLocaleString() || '0',              label: t.totalAttendance, sub: 'Across all regions'  },
    { icon: TrendingUp, iconBg: '#fff7ed', iconColor: '#ea580c', pct: '+18%', pctBg: '#fff7ed', pctColor: '#ea580c', value: `${stats?.completionRate?.toFixed(0) || 0}%`,                 label: t.completionRate,  sub: 'This week'           },
  ];

  return (
    <div className="dash-page">
      <div className="dash-welcome">
        <h2>{t.welcomeBack}, {user?.name || 'Global'}! 👋</h2>
        <p>{today}</p>
      </div>

      <div className="kpi-grid">
        {KPI_CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <div className="kpi-card" key={card.label}>
              <div className="kpi-card-top">
                <div className="kpi-icon" style={{ background: card.iconBg }}>
                  <Icon size={17} color={card.iconColor} strokeWidth={1.8} />
                </div>
                <span className="kpi-pct" style={{ color: card.pctColor, background: card.pctBg }}>
                  {card.pct}
                </span>
              </div>
              <div className="kpi-value">{card.value}</div>
              <div className="kpi-label">{card.label}</div>
              <div className="kpi-sub">{card.sub}</div>
            </div>
          );
        })}
      </div>

      <div className="chart-grid">
        <div className="chart-card">
          <h3>{t.monthlyTrends}</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="4 3" stroke="#f3f4f6" vertical={false}/>
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }}/>
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }}/>
              <Line type="monotone" dataKey="reports" stroke="#4f46e5" strokeWidth={2.5} dot={false}/>
              <Line type="monotone" dataKey="finance" stroke="#10b981" strokeWidth={2.5} dot={false}/>
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>{t.campaignPerformance}</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stats?.campaignPerformance || []} barSize={40}>
              <CartesianGrid strokeDasharray="4 3" stroke="#f3f4f6" vertical={false}/>
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }}/>
              <Legend iconType="square" iconSize={10} wrapperStyle={{ fontSize: 12 }}/>
              <Bar dataKey="attendance" name="Attendance" fill="#4f46e5" radius={[6,6,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="chart-grid">
        <div className="chart-card">
          <h3>{t.regionStats}</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={regionData} cx="50%" cy="50%" outerRadius={80}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`}
                labelLine={false}>
                {regionData.map((_, i) => (
                  <Cell key={i} fill={REGION_COLORS[i % REGION_COLORS.length]}/>
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }}/>
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>{t.recentActivity}</h3>
          <div className="activity-list">
            {(stats?.recentActivity || []).map((item, idx) => (
              <div className="activity-item" key={idx}>
                <div className="activity-avatar">{item.user?.substring(0, 2).toUpperCase()}</div>
                <div className="activity-info">
                  <p>{item.user}</p>
                  <span>Submitted report for {item.zone}</span>
                </div>
                <div className="activity-time">{item.date}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Magazine Orders Updates */}
      {magazineNotifs.length > 0 && (
        <div className="chart-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <BookOpen size={16} color="#d97706" /> Magazine Order Updates
            </h3>
            <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{magazineNotifs.length} new</span>
          </div>
          <div className="activity-list">
            {magazineNotifs.map(n => (
              <div className="activity-item" key={n.id}>
                <div className="activity-avatar" style={{ background: '#fef3c7', color: '#d97706' }}>📖</div>
                <div className="activity-info">
                  <p>{n.title}</p>
                  <span>{n.message}</span>
                </div>
                <div className="activity-time">{n.time}</div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}