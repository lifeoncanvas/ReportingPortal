import React, { useState, useMemo } from 'react';
import { Download } from 'lucide-react';
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { useSettings } from '../../../context/SettingsContext';

// ── Zone A data (this zonal manager's zone) ────────────────────
const ZONE_DATA = {
  'This Month': {
    attendance: [
      { week: 'Week 1', attendance: 320 },
      { week: 'Week 2', attendance: 410 },
      { week: 'Week 3', attendance: 390 },
      { week: 'Week 4', attendance: 520 },
    ],
    finance: [
      { week: 'Week 1', finance: 4200 },
      { week: 'Week 2', finance: 5800 },
      { week: 'Week 3', finance: 5100 },
      { week: 'Week 4', finance: 7400 },
    ],
    kpi: { attendance: '1,640', members: '48', finance: '$22.5K', avg: '410', reports: '12', completion: '92%' },
    pct: { attendance: '+18%', members: '+12%', finance: '+15%', avg: '+9%' },
  },
  'Last Month': {
    attendance: [
      { week: 'Week 1', attendance: 280 },
      { week: 'Week 2', attendance: 340 },
      { week: 'Week 3', attendance: 310 },
      { week: 'Week 4', attendance: 420 },
    ],
    finance: [
      { week: 'Week 1', finance: 3600 },
      { week: 'Week 2', finance: 4400 },
      { week: 'Week 3', finance: 4100 },
      { week: 'Week 4', finance: 5800 },
    ],
    kpi: { attendance: '1,350', members: '36', finance: '$17.9K', avg: '338', reports: '10', completion: '83%' },
    pct: { attendance: '+8%', members: '+5%', finance: '+7%', avg: '+4%' },
  },
  'This Quarter': {
    attendance: [
      { week: 'Month 1', attendance: 1200 },
      { week: 'Month 2', attendance: 1500 },
      { week: 'Month 3', attendance: 1640 },
    ],
    finance: [
      { week: 'Month 1', finance: 16000 },
      { week: 'Month 2', finance: 19500 },
      { week: 'Month 3', finance: 22500 },
    ],
    kpi: { attendance: '4,340', members: '142', finance: '$58K', avg: '482', reports: '36', completion: '89%' },
    pct: { attendance: '+28%', members: '+22%', finance: '+24%', avg: '+18%' },
  },
  'This Year': {
    attendance: [
      { week: 'Q1', attendance: 3800 },
      { week: 'Q2', attendance: 5200 },
      { week: 'Q3', attendance: 6100 },
      { week: 'Q4', attendance: 7400 },
    ],
    finance: [
      { week: 'Q1', finance: 48000 },
      { week: 'Q2', finance: 64000 },
      { week: 'Q3', finance: 78000 },
      { week: 'Q4', finance: 94000 },
    ],
    kpi: { attendance: '22,500', members: '680', finance: '$284K', avg: '1,406', reports: '148', completion: '94%' },
    pct: { attendance: '+42%', members: '+35%', finance: '+48%', avg: '+38%' },
  },
};

const CAMPAIGN_DATA = [
  { name: 'Spring Outreach', value: 38, color: '#4f46e5' },
  { name: 'Easter Campaign', value: 28, color: '#22d3ee' },
  { name: 'Healing Streams', value: 34, color: '#22c55e' },
];

const WEEKLY_BREAKDOWN = [
  { day: 'Mon', attendance: 120, finance: 1800 },
  { day: 'Tue', attendance: 85,  finance: 1200 },
  { day: 'Wed', attendance: 140, finance: 2100 },
  { day: 'Thu', attendance: 95,  finance: 1400 },
  { day: 'Fri', attendance: 160, finance: 2400 },
  { day: 'Sat', attendance: 210, finance: 3200 },
  { day: 'Sun', attendance: 380, finance: 5800 },
];

const REPORT_STATUS = [
  { name: 'Submitted', value: 12, color: '#4f46e5' },
  { name: 'Reviewed',  value: 8,  color: '#22c55e' },
  { name: 'Pending',   value: 2,  color: '#f97316' },
];

export default function ZonalAnalytics() {
  const { currSymbol } = useSettings();
  const [timeRange, setTimeRange] = useState('This Month');
  const data = useMemo(() => ZONE_DATA[timeRange] || ZONE_DATA['This Month'], [timeRange]);

  const tooltipStyle = {
    borderRadius: 8, border: '1px solid var(--border-color)',
    background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: 12,
  };

  const KPI = [
    { label: 'Zone Attendance',  value: data.kpi.attendance, pct: data.pct.attendance, bg: '#ede9fe', color: '#5b21b6' },
    { label: 'New Members',      value: data.kpi.members,    pct: data.pct.members,    bg: '#dcfce7', color: '#16a34a' },
    { label: 'Zone Finance',     value: data.kpi.finance,    pct: data.pct.finance,    bg: '#fef9c3', color: '#a16207' },
    { label: 'Avg. Attendance',  value: data.kpi.avg,        pct: data.pct.avg,        bg: '#ffedd5', color: '#c2410c' },
    { label: 'Reports Submitted',value: data.kpi.reports,    pct: '+2',                bg: '#e0f2fe', color: '#0284c7' },
    { label: 'Completion Rate',  value: data.kpi.completion, pct: '+3%',               bg: '#f0fdf4', color: '#16a34a' },
  ];

  const handleExport = () => {
    const html = `<html><head><title>Zone A Analytics</title>
    <style>body{font-family:Arial,sans-serif;font-size:12px;padding:24px}
    h1{font-size:20px}table{width:100%;border-collapse:collapse;margin:16px 0}
    th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f3f4f6}</style></head>
    <body><h1>Zone A — Analytics Report</h1>
    <p>Period: ${timeRange} · Generated: ${new Date().toLocaleDateString()}</p>
    <h2>KPI Summary</h2>
    <table><thead><tr><th>Metric</th><th>Value</th><th>Change</th></tr></thead><tbody>
    ${KPI.map(k => `<tr><td>${k.label}</td><td>${k.value}</td><td>${k.pct}</td></tr>`).join('')}
    </tbody></table>
    <h2>Attendance Trend</h2>
    <table><thead><tr><th>Period</th><th>Attendance</th></tr></thead><tbody>
    ${data.attendance.map(r => `<tr><td>${r.week}</td><td>${r.attendance}</td></tr>`).join('')}
    </tbody></table></body></html>`;
    const win = window.open('', '_blank');
    win.document.write(html); win.document.close(); win.print();
  };

  return (
    <div className="an-page">

      {/* Header */}
      <div className="an-page-header">
        <div>
          <h2>Zone Analytics</h2>
          <p>Performance insights for your zone</p>
        </div>
        <button className="an-export-btn" onClick={handleExport}>
          <Download size={15} /> Export Report
        </button>
      </div>

      {/* Time filter only — zone is fixed to this manager's zone */}
      <div className="an-panel an-filters">
        <div className="an-filter-group">
          <label>Time Range</label>
          <select value={timeRange} onChange={e => setTimeRange(e.target.value)}>
            {['This Month', 'Last Month', 'This Quarter', 'This Year'].map(o => <option key={o}>{o}</option>)}
          </select>
        </div>
        <div className="an-filter-group">
          <label>Zone</label>
          <select disabled>
            <option>Zone A (Your Zone)</option>
          </select>
        </div>
        <div className="an-filter-group">
          <label>Campaign</label>
          <select>
            {['All Campaigns', 'Spring Outreach 2026', 'Easter Campaign', 'Healing Streams'].map(o => <option key={o}>{o}</option>)}
          </select>
        </div>
      </div>

      {/* KPI grid — 6 cards */}
      <div className="an-kpi-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        {KPI.map(k => (
          <div className="an-kpi-card" key={k.label}>
            <div className="an-kpi-top">
              <div className="an-kpi-icon" style={{ background: k.bg, color: k.color }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
              </div>
              <span className="an-kpi-pct">↗ {k.pct}</span>
            </div>
            <div className="an-kpi-value">{k.value}</div>
            <div className="an-kpi-label">{k.label}</div>
          </div>
        ))}
      </div>

      {/* Charts row 1 — Attendance + Finance */}
      <div className="an-chart-grid">
        <div className="an-panel">
          <h3>Attendance Trend</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={data.attendance}>
              <defs>
                <linearGradient id="zoneAttGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#818cf8" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 3" stroke="var(--border-light)" vertical={false}/>
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={tooltipStyle}/>
              <Area type="monotone" dataKey="attendance" stroke="#4f46e5" strokeWidth={2.5} fill="url(#zoneAttGrad)" dot={{ fill: '#4f46e5', r: 4 }}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="an-panel">
          <h3>Finance Trend</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={data.finance}>
              <CartesianGrid strokeDasharray="4 3" stroke="var(--border-light)" vertical={false}/>
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={tooltipStyle}/>
              <Line type="monotone" dataKey="finance" name="Finance ($)" stroke="#22c55e" strokeWidth={2.5} dot={{ fill: '#22c55e', r: 4 }}/>
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts row 2 — Weekly breakdown + Campaign dist + Report status */}
      <div className="an-chart-grid">
        <div className="an-panel">
          <h3>Weekly Day Breakdown</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={WEEKLY_BREAKDOWN} barSize={28}>
              <CartesianGrid strokeDasharray="4 3" stroke="var(--border-light)" vertical={false}/>
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={tooltipStyle}/>
              <Legend iconType="square" iconSize={10} wrapperStyle={{ fontSize: 12 }}/>
              <Bar dataKey="attendance" name="Attendance" fill="#4f46e5" radius={[4,4,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="an-panel">
          <h3>Campaign Distribution</h3>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={CAMPAIGN_DATA} cx="50%" cy="50%" outerRadius={70} dataKey="value"
                label={({ name, value }) => `${name} ${value}%`} labelLine={false}>
                {CAMPAIGN_DATA.map((e, i) => <Cell key={i} fill={e.color}/>)}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} formatter={v => [`${v}%`, 'Share']}/>
            </PieChart>
          </ResponsiveContainer>
          <div className="an-legend">
            {CAMPAIGN_DATA.map(d => (
              <div className="an-legend-row" key={d.name}>
                <span className="an-legend-dot" style={{ background: d.color }}/>
                <span>{d.name}</span>
                <span className="an-legend-pct">{d.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Report submission status */}
      <div className="an-panel">
        <h3>Report Submission Status</h3>
        <table className="an-table">
          <thead>
            <tr><th>Status</th><th>Count</th><th>Share</th></tr>
          </thead>
          <tbody>
            {REPORT_STATUS.map(r => {
              const total = REPORT_STATUS.reduce((s, x) => s + x.value, 0);
              const pct   = ((r.value / total) * 100).toFixed(1);
              return (
                <tr key={r.name}>
                  <td>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ width: 10, height: 10, borderRadius: '50%', background: r.color, display: 'inline-block' }}/>
                      {r.name}
                    </span>
                  </td>
                  <td>{r.value}</td>
                  <td>
                    <div className="an-bar-wrap">
                      <div className="an-bar-fill" style={{ width: `${pct}%`, background: r.color }}/>
                      <span>{pct}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

    </div>
  );
}
