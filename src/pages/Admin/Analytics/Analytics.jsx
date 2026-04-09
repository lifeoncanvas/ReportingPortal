import React, { useState } from 'react';
import { Download } from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

// ── All Global Managers data ───────────────────────────────────
const GLOBAL_MANAGERS = [
  { name: 'Global Mgr — Africa',        zones: 8,  attendance: 18400, finance: 284000, reports: 96,  completion: '94%', color: '#4f46e5' },
  { name: 'Global Mgr — Europe',        zones: 6,  attendance: 12200, finance: 198000, reports: 72,  completion: '88%', color: '#22d3ee' },
  { name: 'Global Mgr — Americas',      zones: 7,  attendance: 15800, finance: 241000, reports: 84,  completion: '91%', color: '#22c55e' },
  { name: 'Global Mgr — Asia Pacific',  zones: 5,  attendance: 9600,  finance: 152000, reports: 60,  completion: '85%', color: '#f97316' },
  { name: 'Global Mgr — South America', zones: 4,  attendance: 7200,  finance: 118000, reports: 48,  completion: '82%', color: '#a855f7' },
];

const TREND_DATA = [
  { month: 'Jan', africa: 14000, europe: 9200,  americas: 11800, asia: 7100,  sa: 5400  },
  { month: 'Feb', africa: 15200, europe: 10100, americas: 12600, asia: 7800,  sa: 5900  },
  { month: 'Mar', africa: 16800, europe: 10900, americas: 13900, asia: 8400,  sa: 6300  },
  { month: 'Apr', africa: 17200, europe: 11400, americas: 14600, asia: 8900,  sa: 6700  },
  { month: 'May', africa: 17900, europe: 11800, americas: 15200, asia: 9200,  sa: 6900  },
  { month: 'Jun', africa: 18400, europe: 12200, americas: 15800, asia: 9600,  sa: 7200  },
];

const FINANCE_TREND = [
  { month: 'Jan', total: 820000  },
  { month: 'Feb', total: 890000  },
  { month: 'Mar', total: 940000  },
  { month: 'Apr', total: 970000  },
  { month: 'May', total: 1010000 },
  { month: 'Jun', total: 1090000 },
];

const ZONE_BREAKDOWN = [
  { zone: 'Zone A', mgr: 'Africa',   attendance: 2400, finance: 38000, status: 'Active'   },
  { zone: 'Zone B', mgr: 'Europe',   attendance: 1800, finance: 29000, status: 'Active'   },
  { zone: 'Zone C', mgr: 'Americas', attendance: 2100, finance: 34000, status: 'Active'   },
  { zone: 'Zone D', mgr: 'Africa',   attendance: 1600, finance: 26000, status: 'Active'   },
  { zone: 'Zone E', mgr: 'Asia',     attendance: 1200, finance: 19000, status: 'Inactive' },
  { zone: 'Zone F', mgr: 'Americas', attendance: 2800, finance: 44000, status: 'Active'   },
];

const CAMPAIGN_DIST = [
  { name: 'Spring Outreach', value: 35, color: '#4f46e5' },
  { name: 'Easter Campaign', value: 22, color: '#22d3ee' },
  { name: 'Healing Streams', value: 43, color: '#22c55e' },
];

const TOTAL_KPI = [
  { label: 'Total Attendance',    value: '63,200',  pct: '+28%', bg: '#ede9fe', color: '#5b21b6' },
  { label: 'Total Finance',       value: '$993K',   pct: '+33%', bg: '#fef9c3', color: '#a16207' },
  { label: 'Global Managers',     value: '5',       pct: '',     bg: '#e0f2fe', color: '#0284c7' },
  { label: 'Total Zones',         value: '30',      pct: '+2',   bg: '#dcfce7', color: '#16a34a' },
  { label: 'Reports Submitted',   value: '360',     pct: '+18%', bg: '#ffedd5', color: '#c2410c' },
  { label: 'Avg Completion Rate', value: '88%',     pct: '+4%',  bg: '#f0fdf4', color: '#16a34a' },
];

export default function AdminAnalytics() {
  const [selectedMgr, setSelectedMgr] = useState('All');

  const tooltipStyle = {
    borderRadius: 8, border: '1px solid var(--border-color)',
    background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: 12,
  };

  const handleExport = () => {
    const html = `<html><head><title>Admin Analytics</title>
    <style>body{font-family:Arial,sans-serif;font-size:12px;padding:24px}
    h1{font-size:20px}table{width:100%;border-collapse:collapse;margin:16px 0}
    th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f3f4f6}</style></head>
    <body><h1>Admin — Global Analytics Report</h1>
    <p>Generated: ${new Date().toLocaleDateString()}</p>
    <h2>Global Managers Performance</h2>
    <table><thead><tr><th>Manager</th><th>Zones</th><th>Attendance</th><th>Finance</th><th>Reports</th><th>Completion</th></tr></thead>
    <tbody>${GLOBAL_MANAGERS.map(m => `<tr><td>${m.name}</td><td>${m.zones}</td><td>${m.attendance.toLocaleString()}</td><td>$${m.finance.toLocaleString()}</td><td>${m.reports}</td><td>${m.completion}</td></tr>`).join('')}
    </tbody></table></body></html>`;
    const win = window.open('', '_blank');
    win.document.write(html); win.document.close(); win.print();
  };

  return (
    <div className="an-page">

      <div className="an-page-header">
        <div>
          <h2>Admin Analytics</h2>
          <p>All global managers and their zones performance overview</p>
        </div>
        <button className="an-export-btn" onClick={handleExport}>
          <Download size={15} /> Export Report
        </button>
      </div>

      {/* Filters */}
      <div className="an-panel an-filters">
        <div className="an-filter-group">
          <label>Global Manager</label>
          <select value={selectedMgr} onChange={e => setSelectedMgr(e.target.value)}>
            <option value="All">All Managers</option>
            {GLOBAL_MANAGERS.map(m => <option key={m.name}>{m.name}</option>)}
          </select>
        </div>
        <div className="an-filter-group">
          <label>Time Range</label>
          <select><option>This Month</option><option>Last Month</option><option>This Quarter</option><option>This Year</option></select>
        </div>
        <div className="an-filter-group">
          <label>Campaign</label>
          <select><option>All Campaigns</option><option>Spring Outreach 2026</option><option>Easter Campaign</option><option>Healing Streams</option></select>
        </div>
      </div>

      {/* KPI grid */}
      <div className="an-kpi-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        {TOTAL_KPI.map(k => (
          <div className="an-kpi-card" key={k.label}>
            <div className="an-kpi-top">
              <div className="an-kpi-icon" style={{ background: k.bg, color: k.color }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
              </div>
              {k.pct && <span className="an-kpi-pct">↗ {k.pct}</span>}
            </div>
            <div className="an-kpi-value">{k.value}</div>
            <div className="an-kpi-label">{k.label}</div>
          </div>
        ))}
      </div>

      {/* Global Managers comparison bar chart */}
      <div className="an-panel">
        <h3>Global Managers — Attendance Comparison</h3>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={GLOBAL_MANAGERS} barSize={36}>
            <CartesianGrid strokeDasharray="4 3" stroke="var(--border-light)" vertical={false}/>
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false}/>
            <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false}/>
            <Tooltip contentStyle={tooltipStyle}/>
            <Bar dataKey="attendance" name="Attendance" radius={[6,6,0,0]}>
              {GLOBAL_MANAGERS.map((e, i) => <Cell key={i} fill={e.color}/>)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Trend + Finance */}
      <div className="an-chart-grid">
        <div className="an-panel">
          <h3>Attendance Trend by Region</h3>
          <ResponsiveContainer width="100%" height={230}>
            <LineChart data={TREND_DATA}>
              <CartesianGrid strokeDasharray="4 3" stroke="var(--border-light)" vertical={false}/>
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={tooltipStyle}/>
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }}/>
              <Line type="monotone" dataKey="africa"   name="Africa"   stroke="#4f46e5" strokeWidth={2} dot={false}/>
              <Line type="monotone" dataKey="europe"   name="Europe"   stroke="#22d3ee" strokeWidth={2} dot={false}/>
              <Line type="monotone" dataKey="americas" name="Americas" stroke="#22c55e" strokeWidth={2} dot={false}/>
              <Line type="monotone" dataKey="asia"     name="Asia"     stroke="#f97316" strokeWidth={2} dot={false}/>
              <Line type="monotone" dataKey="sa"       name="S. America" stroke="#a855f7" strokeWidth={2} dot={false}/>
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="an-panel">
          <h3>Total Finance Trend</h3>
          <ResponsiveContainer width="100%" height={230}>
            <AreaChart data={FINANCE_TREND}>
              <defs>
                <linearGradient id="adminFinGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#22c55e" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 3" stroke="var(--border-light)" vertical={false}/>
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={tooltipStyle} formatter={v => [`$${(v/1000).toFixed(0)}K`, 'Finance']}/>
              <Area type="monotone" dataKey="total" stroke="#22c55e" strokeWidth={2.5} fill="url(#adminFinGrad)" dot={{ fill: '#22c55e', r: 3 }}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Campaign dist + Global Mgr table */}
      <div className="an-chart-grid">
        <div className="an-panel">
          <h3>Campaign Distribution</h3>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={CAMPAIGN_DIST} cx="50%" cy="50%" outerRadius={70} dataKey="value"
                label={({ name, value }) => `${name} ${value}%`} labelLine={false}>
                {CAMPAIGN_DIST.map((e, i) => <Cell key={i} fill={e.color}/>)}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} formatter={v => [`${v}%`, 'Share']}/>
            </PieChart>
          </ResponsiveContainer>
          <div className="an-legend">
            {CAMPAIGN_DIST.map(d => (
              <div className="an-legend-row" key={d.name}>
                <span className="an-legend-dot" style={{ background: d.color }}/>
                <span>{d.name}</span>
                <span className="an-legend-pct">{d.value}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="an-panel">
          <h3>Global Managers Summary</h3>
          <table className="an-table">
            <thead>
              <tr><th>Manager</th><th>Zones</th><th>Attendance</th><th>Completion</th></tr>
            </thead>
            <tbody>
              {GLOBAL_MANAGERS.map(m => (
                <tr key={m.name}>
                  <td style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: m.color, display: 'inline-block', flexShrink: 0 }}/>
                    {m.name.replace('Global Mgr — ', '')}
                  </td>
                  <td>{m.zones}</td>
                  <td>{m.attendance.toLocaleString()}</td>
                  <td>
                    <div className="an-bar-wrap">
                      <div className="an-bar-fill" style={{ width: m.completion, background: m.color }}/>
                      <span>{m.completion}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Zone breakdown table */}
      <div className="an-panel">
        <h3>Zone-level Breakdown</h3>
        <table className="an-table">
          <thead>
            <tr><th>Zone</th><th>Global Manager</th><th>Attendance</th><th>Finance</th><th>Status</th></tr>
          </thead>
          <tbody>
            {ZONE_BREAKDOWN.map(z => (
              <tr key={z.zone}>
                <td className="an-table-region">{z.zone}</td>
                <td>{z.mgr}</td>
                <td>{z.attendance.toLocaleString()}</td>
                <td>${z.finance.toLocaleString()}</td>
                <td>
                  <span style={{
                    padding: '2px 10px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600,
                    background: z.status === 'Active' ? '#dcfce7' : '#fee2e2',
                    color: z.status === 'Active' ? '#16a34a' : '#dc2626',
                  }}>{z.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
