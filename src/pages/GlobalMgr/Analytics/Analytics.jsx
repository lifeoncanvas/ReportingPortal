import React, { useState, useMemo } from 'react';
import { Download, TrendingUp, Users, DollarSign, BarChart2 } from 'lucide-react';
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { useSettings } from '../../../context/SettingsContext';
import './styles.css';

// ── Raw data ───────────────────────────────────────────
const ALL_DATA = {
  'This Month': {
    attendance: [
      { week: 'Week 1', attendance: 1100 },
      { week: 'Week 2', attendance: 1400 },
      { week: 'Week 3', attendance: 1650 },
      { week: 'Week 4', attendance: 2100 },
    ],
    finance: [
      { week: 'Week 1', finance: 18000 },
      { week: 'Week 2', finance: 21000 },
      { week: 'Week 3', finance: 24500 },
      { week: 'Week 4', finance: 29800 },
    ],
    kpi: { attendance: '2,460', members: '207', finance: '$24.9K', avg: '492' },
    pct: { attendance: '+24%', members: '+18%', finance: '+12%', avg: '+8%' },
  },
  'Last Month': {
    attendance: [
      { week: 'Week 1', attendance: 900  },
      { week: 'Week 2', attendance: 1100 },
      { week: 'Week 3', attendance: 1300 },
      { week: 'Week 4', attendance: 1600 },
    ],
    finance: [
      { week: 'Week 1', finance: 14000 },
      { week: 'Week 2', finance: 16500 },
      { week: 'Week 3', finance: 19000 },
      { week: 'Week 4', finance: 22000 },
    ],
    kpi: { attendance: '1,980', members: '154', finance: '$19.2K', avg: '412' },
    pct: { attendance: '+8%', members: '+5%', finance: '+6%', avg: '+3%' },
  },
  'This Quarter': {
    attendance: [
      { week: 'Month 1', attendance: 3200 },
      { week: 'Month 2', attendance: 4100 },
      { week: 'Month 3', attendance: 5400 },
    ],
    finance: [
      { week: 'Month 1', finance: 52000 },
      { week: 'Month 2', finance: 68000 },
      { week: 'Month 3', finance: 84000 },
    ],
    kpi: { attendance: '12,700', members: '842', finance: '$204K', avg: '1,247' },
    pct: { attendance: '+32%', members: '+28%', finance: '+22%', avg: '+18%' },
  },
  'This Year': {
    attendance: [
      { week: 'Q1', attendance: 12000 },
      { week: 'Q2', attendance: 18000 },
      { week: 'Q3', attendance: 22000 },
      { week: 'Q4', attendance: 28000 },
    ],
    finance: [
      { week: 'Q1', finance: 180000 },
      { week: 'Q2', finance: 240000 },
      { week: 'Q3', finance: 290000 },
      { week: 'Q4', finance: 380000 },
    ],
    kpi: { attendance: '80,000', members: '4,200', finance: '$1.09M', avg: '3,840' },
    pct: { attendance: '+45%', members: '+38%', finance: '+52%', avg: '+41%' },
  },
};

const REGION_DATA = {
  'All Regions': [
    { region: 'North America', attendance: 460 },
    { region: 'Europe',        attendance: 320 },
    { region: 'Asia Pacific',  attendance: 590 },
    { region: 'Africa',        attendance: 740 },
    { region: 'South America', attendance: 390 },
  ],
  'Africa':        [{ region: 'Africa',        attendance: 740 }],
  'Europe':        [{ region: 'Europe',         attendance: 320 }],
  'Americas':      [{ region: 'North America',  attendance: 460 }, { region: 'South America', attendance: 390 }],
  'Asia Pacific':  [{ region: 'Asia Pacific',   attendance: 590 }],
  'South America': [{ region: 'South America',  attendance: 390 }],
};

const CAMPAIGN_DATA = {
  'All Campaigns': [
    { name: 'Spring Outreach', value: 35, color: '#4f46e5' },
    { name: 'Easter Campaign', value: 25, color: '#22d3ee' },
    { name: 'Healing Streams', value: 40, color: '#22c55e' },
  ],
  'Spring Outreach 2026': [{ name: 'Spring Outreach', value: 100, color: '#4f46e5' }],
  'Easter Campaign':      [{ name: 'Easter Campaign', value: 100, color: '#22d3ee' }],
  'Healing Streams':      [{ name: 'Healing Streams', value: 100, color: '#22c55e' }],
};

// ── Export helper ──────────────────────────────────────
function exportReport(filters, kpi, attendanceData, financeData) {
  const html = `
    <html><head><title>Analytics Report</title>
    <style>
      body { font-family: Arial, sans-serif; font-size: 12px; padding: 24px; }
      h1   { font-size: 20px; margin-bottom: 4px; }
      .sub { color: #6b7280; font-size: 13px; margin-bottom: 24px; }
      .kpi-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 16px; margin-bottom: 24px; }
      .kpi-card { border: 1px solid #e5e7eb; border-radius: 8px; padding: 14px 16px; }
      .kpi-val  { font-size: 22px; font-weight: 700; margin: 4px 0; }
      .kpi-lbl  { color: #6b7280; font-size: 12px; }
      .kpi-pct  { color: #16a34a; font-size: 12px; font-weight: 600; }
      table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
      th, td { border: 1px solid #ddd; padding: 8px 10px; text-align: left; }
      th { background: #f3f4f6; font-weight: 600; }
      tr:nth-child(even) { background: #f9fafb; }
      h2 { font-size: 15px; margin: 20px 0 8px; }
    </style></head>
    <body>
      <h1>Loveworld Analytics Report</h1>
      <p class="sub">
        ${filters.timeRange} · Region: ${filters.region} ·
        Zone: ${filters.zone} · Campaign: ${filters.campaign} ·
        Generated: ${new Date().toLocaleDateString()}
      </p>

      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-pct">↗ ${kpi.pct.attendance}</div>
          <div class="kpi-val">${kpi.kpi.attendance}</div>
          <div class="kpi-lbl">Total Attendance</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-pct">↗ ${kpi.pct.members}</div>
          <div class="kpi-val">${kpi.kpi.members}</div>
          <div class="kpi-lbl">New Members</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-pct">↗ ${kpi.pct.finance}</div>
          <div class="kpi-val">${kpi.kpi.finance}</div>
          <div class="kpi-lbl">Total Finance</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-pct">↗ ${kpi.pct.avg}</div>
          <div class="kpi-val">${kpi.kpi.avg}</div>
          <div class="kpi-lbl">Avg. Attendance</div>
        </div>
      </div>

      <h2>Attendance Trend</h2>
      <table>
        <thead><tr><th>Period</th><th>Attendance</th></tr></thead>
        <tbody>
          ${attendanceData.map(r => `<tr><td>${r.week}</td><td>${r.attendance.toLocaleString()}</td></tr>`).join('')}
        </tbody>
      </table>

      <h2>Finance Trend</h2>
      <table>
        <thead><tr><th>Period</th><th>Finance ($)</th></tr></thead>
        <tbody>
          ${financeData.map(r => `<tr><td>${r.week}</td><td>$${r.finance.toLocaleString()}</td></tr>`).join('')}
        </tbody>
      </table>
    </body></html>`;

  const win = window.open('', '_blank');
  win.document.write(html);
  win.document.close();
  win.print();
}

// ── Main Component ─────────────────────────────────────
export default function Analytics() {
  const { t, currSymbol } = useSettings();

  const [filters, setFilters] = useState({
    timeRange: 'This Month',
    region:    'All Regions',
    zone:      'All Zones',
    campaign:  'All Campaigns',
  });

  // Reactive data based on filters
  const timeData     = useMemo(() => ALL_DATA[filters.timeRange] || ALL_DATA['This Month'], [filters.timeRange]);
  const regionData   = useMemo(() => REGION_DATA[filters.region]   || REGION_DATA['All Regions'],   [filters.region]);
  const campaignData = useMemo(() => CAMPAIGN_DATA[filters.campaign] || CAMPAIGN_DATA['All Campaigns'], [filters.campaign]);

  const KPI = [
    {
      label: t?.totalAttendance || 'Total Attendance',
      value: timeData.kpi.attendance,
      pct:   timeData.pct.attendance,
      iconBg: '#ede9fe', iconColor: '#5b21b6',
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    },
    {
      label: 'New Members',
      value: timeData.kpi.members,
      pct:   timeData.pct.members,
      iconBg: '#dcfce7', iconColor: '#16a34a',
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
    },
    {
      label: t?.totalFinance || 'Total Finance',
      value: timeData.kpi.finance,
      pct:   timeData.pct.finance,
      iconBg: '#fef9c3', iconColor: '#a16207',
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
    },
    {
      label: 'Avg. Attendance',
      value: timeData.kpi.avg,
      pct:   timeData.pct.avg,
      iconBg: '#ffedd5', iconColor: '#c2410c',
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>,
    },
  ];

  const handleFilterChange = (key, val) => {
    setFilters(p => ({ ...p, [key]: val }));
  };

  const handleExport = () => {
    exportReport(filters, timeData, timeData.attendance, timeData.finance);
  };

  // Chart tooltip style that works in dark mode
  const tooltipStyle = {
    borderRadius: 8,
    border: '1px solid var(--border-color)',
    background: 'var(--bg-card)',
    color: 'var(--text-primary)',
    fontSize: 12,
  };

  return (
    <div className="an-page">

      {/* Header */}
      <div className="an-page-header">
        <div>
          <h2>Analytics Dashboard</h2>
          <p>Performance insights and data visualization</p>
        </div>
        <button className="an-export-btn" onClick={handleExport}>
          <Download size={15} /> Export Report
        </button>
      </div>

      {/* Filters */}
      <div className="an-panel an-filters">
        {[
          { key: 'timeRange', label: 'Time Range', opts: ['This Month','Last Month','This Quarter','This Year'] },
          { key: 'region',    label: 'Region',     opts: ['All Regions','Africa','Europe','Americas','Asia Pacific','South America'] },
          { key: 'zone',      label: 'Zone',       opts: ['All Zones','Zone A','Zone B','Zone C','Zone D','Zone E'] },
          { key: 'campaign',  label: 'Campaign',   opts: ['All Campaigns','Spring Outreach 2026','Easter Campaign','Healing Streams'] },
        ].map(f => (
          <div className="an-filter-group" key={f.key}>
            <label>{f.label}</label>
            <select
              value={filters[f.key]}
              onChange={e => handleFilterChange(f.key, e.target.value)}
            >
              {f.opts.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
        ))}
      </div>

      {/* KPI cards */}
      <div className="an-kpi-grid">
        {KPI.map(k => (
          <div className="an-kpi-card" key={k.label}>
            <div className="an-kpi-top">
              <div className="an-kpi-icon" style={{ background: k.iconBg, color: k.iconColor }}>
                {k.icon}
              </div>
              <span className="an-kpi-pct">↗ {k.pct}</span>
            </div>
            <div className="an-kpi-value">{k.value}</div>
            <div className="an-kpi-label">{k.label}</div>
          </div>
        ))}
      </div>

      {/* Charts row 1 */}
      <div className="an-chart-grid">
        <div className="an-panel">
          <h3>Attendance Trend</h3>
          <ResponsiveContainer width="100%" height={230}>
            <AreaChart data={timeData.attendance}>
              <defs>
                <linearGradient id="attGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#818cf8" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 3" stroke="var(--border-light)" vertical={false}/>
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={tooltipStyle}/>
              <Area type="monotone" dataKey="attendance" stroke="#4f46e5" strokeWidth={2.5}
                fill="url(#attGrad)" dot={{ fill: '#4f46e5', r: 4 }}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="an-panel">
          <h3>Finance Trend</h3>
          <ResponsiveContainer width="100%" height={230}>
            <LineChart data={timeData.finance}>
              <CartesianGrid strokeDasharray="4 3" stroke="var(--border-light)" vertical={false}/>
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={tooltipStyle}/>
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }}/>
              <Line type="monotone" dataKey="finance" name="Finance ($)" stroke="#22c55e"
                strokeWidth={2.5} dot={{ fill: '#22c55e', r: 4 }}
                animationDuration={600}/>
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="an-chart-grid">
        <div className="an-panel">
          <div className="an-panel-header">
            <h3>Regional Comparison</h3>
            <span className="an-panel-sub">
              {filters.region === 'All Regions' ? 'All regions' : filters.region}
            </span>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={regionData} barSize={40}>
              <CartesianGrid strokeDasharray="4 3" stroke="var(--border-light)" vertical={false}/>
              <XAxis dataKey="region" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={tooltipStyle}/>
              <Legend iconType="square" iconSize={10} wrapperStyle={{ fontSize: 12 }}/>
              <Bar dataKey="attendance" name="Attendance" fill="#4f46e5" radius={[6,6,0,0]}
                animationDuration={600}/>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="an-panel">
          <div className="an-panel-header">
            <h3>Campaign Distribution</h3>
            <span className="an-panel-sub">
              {filters.campaign === 'All Campaigns' ? 'All campaigns' : filters.campaign}
            </span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={campaignData}
                cx="50%" cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, value }) => `${name} ${value}%`}
                labelLine={{ stroke: 'var(--text-muted)', strokeWidth: 1 }}
                animationDuration={600}
              >
                {campaignData.map((e, i) => <Cell key={i} fill={e.color}/>)}
              </Pie>
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(val) => [`${val}%`, 'Share']}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="an-legend">
            {campaignData.map(d => (
              <div className="an-legend-row" key={d.name}>
                <span className="an-legend-dot" style={{ background: d.color }}/>
                <span>{d.name}</span>
                <span className="an-legend-pct">{d.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Summary table */}
      <div className="an-panel">
        <h3>Attendance Summary by Region</h3>
        <table className="an-table">
          <thead>
            <tr>
              <th>Region</th>
              <th>Attendance</th>
              <th>Share</th>
              <th>Trend</th>
            </tr>
          </thead>
          <tbody>
            {regionData.map((r, i) => {
              const total = regionData.reduce((s, x) => s + x.attendance, 0);
              const pct   = total ? ((r.attendance / total) * 100).toFixed(1) : 0;
              return (
                <tr key={r.region}>
                  <td className="an-table-region">{r.region}</td>
                  <td>{r.attendance.toLocaleString()}</td>
                  <td>
                    <div className="an-bar-wrap">
                      <div className="an-bar-fill" style={{ width: `${pct}%` }}/>
                      <span>{pct}%</span>
                    </div>
                  </td>
                  <td className="an-trend-up">↑ {(Math.random() * 20 + 2).toFixed(1)}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

    </div>
  );
}