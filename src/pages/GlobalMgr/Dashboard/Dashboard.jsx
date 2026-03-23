import React from 'react';
import { FileText, DollarSign, Users, TrendingUp } from 'lucide-react';
import { useSettings } from '../../../context/SettingsContext';
import { useAuth } from '../../../auth/AuthContext';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import './styles.css';

const monthlyData = [
  { month: 'Jan', reports: 40, finance: 24 },
  { month: 'Feb', reports: 55, finance: 38 },
  { month: 'Mar', reports: 47, finance: 30 },
  { month: 'Apr', reports: 62, finance: 45 },
  { month: 'May', reports: 58, finance: 50 },
  { month: 'Jun', reports: 75, finance: 60 },
];

const campaignData = [
  { name: 'Spring Outreach', value: 1500 },
  { name: 'Easter Campaign', value: 350  },
  { name: 'Healing Streams', value: 750  },
];

const regionData = [
  { name: 'Africa',   value: 40 },
  { name: 'Europe',   value: 25 },
  { name: 'Americas', value: 20 },
  { name: 'Asia',     value: 15 },
];

const REGION_COLORS = ['#4f46e5', '#818cf8', '#a5b4fc', '#c7d2fe'];

const activity = [
  { initials: 'JD', name: 'John Doe',   action: 'Submitted report',     time: '2 mins ago'  },
  { initials: 'JS', name: 'Jane Smith', action: 'Uploaded finance CSV',  time: '15 mins ago' },
  { initials: 'ML', name: 'Mark Lee',   action: 'Updated campaign data', time: '1 hr ago'    },
  { initials: 'SK', name: 'Sarah K.',   action: 'Added new entry',       time: '3 hrs ago'   },
];

export default function Dashboard() {
  const { t, formatDate, currSymbol } = useSettings();
  const { user } = useAuth();

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const KPI_CARDS = [
    { icon: FileText,   iconBg: '#ede9fe', iconColor: '#5b21b6', pct: '+12%', pctBg: '#ede9fe', pctColor: '#5b21b6', value: '1,284',              label: t.totalReports,    sub: '5 this week'         },
    { icon: DollarSign, iconBg: '#dcfce7', iconColor: '#16a34a', pct: '+8%',  pctBg: '#dcfce7', pctColor: '#16a34a', value: `${currSymbol}84,200`, label: t.totalFinance,    sub: '5 entries'           },
    { icon: Users,      iconBg: '#e0f2fe', iconColor: '#0284c7', pct: '+24%', pctBg: '#e0f2fe', pctColor: '#0284c7', value: '32,540',              label: t.totalAttendance, sub: 'Across all regions'  },
    { icon: TrendingUp, iconBg: '#fff7ed', iconColor: '#ea580c', pct: '+18%', pctBg: '#fff7ed', pctColor: '#ea580c', value: '92%',                 label: t.completionRate,  sub: 'This week'           },
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
          <h3>Monthly Trends</h3>
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
          <h3>Campaign Performance</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={campaignData} barSize={40}>
              <CartesianGrid strokeDasharray="4 3" stroke="#f3f4f6" vertical={false}/>
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }}/>
              <Legend iconType="square" iconSize={10} wrapperStyle={{ fontSize: 12 }}/>
              <Bar dataKey="value" name="Attendance" fill="#4f46e5" radius={[6,6,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="chart-grid">
        <div className="chart-card">
          <h3>Region-wise Statistics</h3>
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
            {activity.map((item) => (
              <div className="activity-item" key={item.name}>
                <div className="activity-avatar">{item.initials}</div>
                <div className="activity-info">
                  <p>{item.name}</p>
                  <span>{item.action}</span>
                </div>
                <div className="activity-time">{item.time}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}