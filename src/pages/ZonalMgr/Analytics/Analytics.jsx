import React, { useState, useEffect, useCallback } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import './styles.css';

// ── Icons ────────────────────────────────────────────
const TrendUpIcon = ({ color = '#22c55e' }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const FilterIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);

const ChevronIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const BellIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const SettingsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

// ── Zone Master List ─────────────────────────────────
const ALL_ZONES = [
  'All Zones',
  // ── ZONE/CHURCH ──────────────────────────────────────
  'CE Lagos zone 5', 'CE Lagos Virtual Zone', 'CE Lagos zone 1', 'CE Lagos zone 2',
  'CE Lagos zone 3', 'CE Lagos zone 4', 'CE Lagos zone 6',
  'CE Lagos Sub Zone A', 'CE Lagos Sub Zone B', 'CE Lagos Sub Zone C', 'CE Egbeda Sub Zone',
  // ── MC/ZONES IN NIGERIA ───────────────────────────
  'CE Port harcourt zone 1', 'CE Port harcourt zone 2', 'CE Port harcourt zone 3',
  'CE Benin zone 1', 'CE Benin Zone 2', 'CE Midwest Zone',
  'CE Abuja Zone 1', 'CE Abuja Zone 2', 'CE Edo North & Central Zone',
  'CE Aba Zone', 'CE Warri DSC',
  'South South Zone 1', 'South South Zone 2', 'South South Zone 3',
  'South East Zone 1', 'South East Zone 3',
  'Ministry Centre Abuja', 'Ministry Centre Warri', 'Ministry Centre Calabar',
  'North Central Zone 1', 'North Central Zone 2',
  'North West Zone 1', 'North West Zone 2', 'North East Zone 1',
  'Ministry Centre Abeokuta', 'Ministry Centre Ibadan',
  'CE Onitsha Zone',
  'South West Zone 2', 'South West Zone 3', 'South West Zone 4', 'South West Zone 5',
  'CE Ibadan Zone 1', 'CE Ibadan Zone 2', 'LOVEWORLD CHURCH ZONE', 'CE Abakaliki Zone',
  // ── INTERNATIONAL ────────────────────────────────
  'CE UK Zone 1, DSP Region', 'CE UK Zone 2, DSP Region', 'CE UK Zone 3, DSP Region', 'CE UK Zone 4, DSP Region',
  'CE UK Zone 1, Region 2', 'CE UK Zone 3, Region 2', 'CE UK Zone 4, Region 2', 'CE Barking DSP',
  'Western Europe Zone 1', 'Western Europe Zone 2', 'Western Europe Zone 3', 'Western Europe Zone 4',
  'Eastern Europe Virtual Region',
  'USA Zone 1, Region 1', 'USA Zone 2, Region 1', 'Hawaii Zone', 'USA Region 2', 'USA Region 3',
  'CE Dallas Zone', 'Toronto Zone', 'CE Ottawa Zone', 'CE Quebec',
  'Middle East & South East Asia Region',
  'India Zone 1', 'India Zone 2', 'Australia Region',
  'South America and Pacific Islands Region', 'Intl Missions for Southeast Asia',
  'CE Amsterdem, DSP', 'CE Ireland Sub-Zone',
  // ── SOUTHERN AFRICA ──────────────────────────────
  'Southern Africa Zone 1', 'Southern Africa Zone 2', 'Southern Africa Zone 3', 'Southern Africa Zone 5',
  'CE Cape Town 1', 'CE Cape Town 2', 'CE Durban',
  // ── EWCA ──────────────────────────────────────────
  'Accra Ghana Zone', 'Kenya Zone',
  'EWCAVZ1 (Ethiopia)', 'EWCAVZ2 (Togo)', 'EWCAVZ3 (Uganda)', 'EWCAVZ4 (Cameroun)', 'EWCAVZ5 (Nungua)', 'EWCAVZ6',
  'CE Chad Zone', 'CE Cameroon West Zone', 'CE Tanzania Zone',
  'GRAND TOTAL (CHURCH ZONES)',
  // ── BLW CAMPUSES ─────────────────────────────────
  'BLW ZONE C (UNILAG)', 'BLW ZONE J (UNIBEN)', 'BLW ZONE H (UNIPORT)', 'BLW ZONE A (EKPOMA)',
  'BLW ZONE B (AWKA)', 'BLW ZONE D (ZARIA)', 'BLW ZONE E (ILE-IFE)', 'BLW ZONE F (ABSU)',
  'BLW ZONE G (AKURE)', 'BLW ZONE I (UNIJOS)', 'BLW ZONE K (ABUJA)', 'BLW ZONE L (CALABAR)',
  'BLW ZONE N',
  'BLW ZONE Ghana A', 'BLW ZONE Ghana B', 'BLW ZONE Ghana C', 'BLW ZONE Ghana D', 'BLW ZONE Ghana E', 'BLW ZONE Ghana F',
  'BLW ZONE SA A', 'BLW ZONE SA B', 'BLW ZONE SA C', 'BLW ZONE SA D', 'BLW ZONE SA E', 'BLW ZONE SA F', 'BLW ZONE SA G', 'BLW ZONE SA H',
  'BLW UK ZONE A', 'BLW UK ZONE B', 'BLW UK ZONE C',
  'BLW UGANDA ZONE A', 'ZIMBABWE ZONE', 'BOTSWANA ZONE',
  'BLW USA REGION  1', 'BLW USA REGION  2', 'BLW USA REGION 1, ZONE B', 'BLW USA REGION 2, ZONE B',
  'BLW CAMEROON GROUP A', 'BLW CAMEROON GROUP B', 'BLW CAMEROON GROUP 2', 'BLW CAMEROON GROUP 3',
  'BLW NORTH CYPRUS', 'BLW NAMIBIA', 'BLW IRELAND', 'BLW CANADA GROUP', 'BLW CANADA REGION',
  'BLW TURKEY GROUP', 'BLW WALES', 'BLW MIDDLE EAST & NORTH AFRICA', 'BLW BURKINA FASO',
  'BLW DRC ZONE', 'BLW KENYA ZONE A', 'BLW BENIN REPUBLIC ZONE A', 'BLW BENIN REPUBLIC ZONE B',
  'BLW CONGO DRC', 'BLW KENYA ZONE B', 'BLW UGANDA ZONE B', 'BLW EUROPE ZONE 1',
  'GRAND TOTAL (CAMPUS ZONES)',
];

const API = process.env.REACT_APP_API_URL || 'http://65.0.71.13:8080';

// ── Data ─────────────────────────────────────────────
const DATA = {
  overview: {
    kpis: [
      { label: 'Total Reports', value: '247', trend: '+18%', icon: '📊', color: 'purple' },
      { label: 'New Partners',  value: '318',  trend: '+9%',  icon: '🤝', color: 'green' },
      { label: 'Total Remittance', value: '₦2.4M', trend: '+12%', icon: '💰', color: 'amber' },
      { label: 'Testimonies',  value: '524',  trend: '+34%', icon: '✍️', color: 'blue' },
      { label: 'Outreach Events', value: '82', trend: '+6%', icon: '📍', color: 'teal' },
      { label: 'Completion Rate', value: '87%', trend: '+3%', icon: '✅', color: 'green' },
    ],
    trend: [
      { week: 'Week 1', submissions: 24 },
      { week: 'Week 2', submissions: 31 },
      { week: 'Week 3', submissions: 38 },
      { week: 'Week 4', submissions: 52 },
    ],
    categoryDist: [
      { name: 'Zonal',         value: 68,  color: '#818cf8' },
      { name: 'Partnership',   value: 54,  color: '#22c55e' },
      { name: 'Testimonials',  value: 71,  color: '#f59e0b' },
      { name: 'Magazine',      value: 32,  color: '#ef4444' },
      { name: 'Outreach',      value: 22,  color: '#2dd4bf' },
    ],
    targets: [
      { label: 'Partnership Remittance', pct: 78, color: '#f59e0b', target: '10,000 espees', achieved: '7,800' },
      { label: 'New Partners Recruited', pct: 92, color: '#22c55e', target: '10 / week',     achieved: '9.2 avg' },
      { label: 'Testimonies Submitted',  pct: 61, color: '#818cf8', target: '50 / week',     achieved: '30.5 avg' },
      { label: 'Healing Outreaches',       pct: 84, color: '#2dd4bf', target: '10 / week',     achieved: '8.4 avg' },
    ],
  },
  zonal: {
    kpis: [
      { label: 'Active Zones',       value: '24',    trend: '+2',   icon: '🏛️', color: 'purple' },
      { label: 'Reports Submitted',  value: '68',    trend: '+18%', icon: '📋', color: 'blue' },
      { label: 'Avg New Partners',   value: '9.2',   trend: '+9%',  icon: '🤝', color: 'green' },
      { label: 'Total Remittance',   value: '₦1.87M', trend: '+12%', icon: '💰', color: 'amber' },
    ],
    remittance: [
      { zone: 'Zone A', amount: 124 }, { zone: 'Zone B', amount: 98 },
      { zone: 'Zone C', amount: 145 }, { zone: 'Zone D', amount: 76 },
      { zone: 'Zone E', amount: 110 }, { zone: 'Zone F', amount: 92 },
      { zone: 'Zone G', amount: 133 },
    ],
    attendance: { pastor: { yes: 18, no: 4, excused: 2 }, manager: { yes: 21, no: 2, excused: 1 } },
    httnm: [
      { label: 'Translations completed', value: '11' },
      { label: 'Outreaches held',        value: '67' },
      { label: 'Pictures / Videos',      value: '48' },
      { label: 'Avg outreaches per zone', value: '2.8' },
      { label: 'Zones hitting target',   value: '16 / 24' },
    ],
    zones: [
      { id: 'ZR-001', name: 'Zone A', manager: 'Bro. Emmanuel', remit: '₦124K', partners: 12, outreaches: 8, status: 'On track' },
      { id: 'ZR-002', name: 'Zone B', manager: 'Sis. Chisom',   remit: '₦98K',  partners: 9,  outreaches: 6, status: 'Submitted' },
      { id: 'ZR-003', name: 'Zone C', manager: 'Bro. Femi',     remit: '₦145K', partners: 14, outreaches: 11, status: 'On track' },
      { id: 'ZR-004', name: 'Zone D', manager: 'Sis. Adaobi',   remit: '₦76K',  partners: 7,  outreaches: 5,  status: 'Partial' },
      { id: 'ZR-005', name: 'Zone E', manager: 'Bro. Kehinde',  remit: '₦110K', partners: 11, outreaches: 9,  status: 'Submitted' },
    ],
  },
  partnership: {
    kpis: [
      { label: 'Total Remittance', value: '₦2.4M',  trend: '+12%', icon: '💰', color: 'green' },
      { label: 'Reports Filed',    value: '54',      trend: '+8%',  icon: '📋', color: 'blue' },
      { label: 'New Partners',     value: '318',     trend: '+9%',  icon: '🤝', color: 'amber' },
      { label: 'Arms Active',      value: '4',       trend: '—',    icon: '📡', color: 'purple' },
    ],
    arms: [
      { key: 'healingSchool', icon: '🏥', label: 'Healing School',      amount: '₦840K', zones: 18, color: '#ef4444' },
      { key: 'rhapsody',      icon: '📖', label: 'Rhapsody of Realities', amount: '₦720K', zones: 24, color: '#f59e0b' },
      { key: 'innercity',     icon: '🏙️', label: 'Inner City Mission',    amount: '₦510K', zones: 15, color: '#22c55e' },
      { key: 'lbn',           icon: '📡', label: 'LBN',                   amount: '₦330K', zones: 11, color: '#4a9eff' },
    ],
    dist: [
      { name: 'Healing School', value: 840, color: '#ef4444' },
      { name: 'Rhapsody',       value: 720, color: '#f59e0b' },
      { name: 'Inner City',     value: 510, color: '#22c55e' },
      { name: 'LBN',            value: 330, color: '#4a9eff' },
    ],
    trend: [
      { month: 'Nov', healingSchool: 620, rhapsody: 520, innerCity: 380, lbn: 240 },
      { month: 'Dec', healingSchool: 780, rhapsody: 640, innerCity: 420, lbn: 280 },
      { month: 'Jan', healingSchool: 710, rhapsody: 580, innerCity: 450, lbn: 290 },
      { month: 'Feb', healingSchool: 840, rhapsody: 690, innerCity: 490, lbn: 320 },
      { month: 'Mar', healingSchool: 760, rhapsody: 680, innerCity: 500, lbn: 310 },
      { month: 'Apr', healingSchool: 840, rhapsody: 720, innerCity: 510, lbn: 330 },
    ],
  },
  testimonials: {
    kpis: [
      { label: 'Total Testimonies',   value: '524', trend: '+34%', icon: '✍️', color: 'amber' },
      { label: 'With Before/After',   value: '213', trend: '+21%', icon: '🖼️', color: 'blue' },
      { label: 'With Documents',      value: '87',  trend: '+15%', icon: '📄', color: 'green' },
      { label: 'Avg per Zone',        value: '21.8', trend: '+9%', icon: '📊', color: 'purple' },
    ],
    weekly: [
      { week: 'W1', target: 50, actual: 30 }, { week: 'W2', target: 50, actual: 38 },
      { week: 'W3', target: 50, actual: 44 }, { week: 'W4', target: 50, actual: 41 },
      { week: 'W5', target: 50, actual: 52 }, { week: 'W6', target: 50, actual: 48 },
      { week: 'W7', target: 50, actual: 58 }, { week: 'W8', target: 50, actual: 62 },
    ],
    zones: [
      { id: 'TS-C', zone: 'Zone C', count: 48, pct: '96%', media: 32, docs: 12, status: 'On track' },
      { id: 'TS-A', zone: 'Zone A', count: 44, pct: '88%', media: 28, docs: 9,  status: 'On track' },
      { id: 'TS-E', zone: 'Zone E', count: 37, pct: '74%', media: 19, docs: 7,  status: 'Submitted' },
      { id: 'TS-B', zone: 'Zone B', count: 29, pct: '58%', media: 14, docs: 4,  status: 'Submitted' },
      { id: 'TS-D', zone: 'Zone D', count: 18, pct: '36%', media: 8,  docs: 1,  status: 'Below' },
    ],
  },
  magazine: {
    kpis: [
      { label: 'Reports Filed',    value: '32',    trend: '+5%',  icon: '📋', color: 'blue' },
      { label: 'Copies Ordered',   value: '14.2K', trend: '-3%',  icon: '📚', color: 'amber' },
      { label: 'Copies Received',  value: '11.8K', trend: '+2%',  icon: '📬', color: 'green' },
      { label: 'Languages Active', value: '7',     trend: '—',    icon: '🌍', color: 'purple' },
    ],
    languages: [
      { lang: 'English',    ordered: 5200, received: 5200, pct: 100 },
      { lang: 'French',     ordered: 2800, received: 2350, pct: 84 },
      { lang: 'Yoruba',     ordered: 2100, received: 0,    pct: 0 },
      { lang: 'Hausa',      ordered: 1500, received: 1500, pct: 100 },
      { lang: 'Igbo',       ordered: 1200, received: 980,  pct: 82 },
      { lang: 'Portuguese', ordered: 900,  received: 900,  pct: 100 },
      { lang: 'Spanish',    ordered: 500,  received: 420,  pct: 84 },
    ],
    receipt: [
      { name: 'Received', value: 22, color: '#22c55e' },
      { name: 'Partial',  value: 7,  color: '#f59e0b' },
      { name: 'Not Yet',  value: 3,  color: '#ef4444' },
    ],
    orders: [
      { id: 'MG-001', lang: 'English',  ordered: 500, received: 500, status: 'Yes',     reason: '—' },
      { id: 'MG-002', lang: 'French',   ordered: 300, received: 250, status: 'Partial', reason: 'Logistics delay' },
      { id: 'MG-003', lang: 'Yoruba',   ordered: 400, received: 0,   status: 'No',      reason: 'Not dispatched' },
      { id: 'MG-004', lang: 'Hausa',    ordered: 200, received: 200, status: 'Yes',     reason: '—' },
    ],
  },
  outreach: {
    kpis: [
      { label: 'Outreach Reports',   value: '22',  trend: '+6%',  icon: '📍', color: 'teal' },
      { label: 'Locations Covered',  value: '82',  trend: '+11%', icon: '🗺️', color: 'blue' },
      { label: 'Photos Submitted',   value: '347', trend: '+24%', icon: '📸', color: 'green' },
      { label: 'Avg Locations/Event',value: '3.7', trend: '+5%',  icon: '📊', color: 'amber' },
    ],
    weekly: [
      { week: 'W1', events: 8 }, { week: 'W2', events: 11 }, { week: 'W3', events: 9 },
      { week: 'W4', events: 14 }, { week: 'W5', events: 12 }, { week: 'W6', events: 16 },
      { week: 'W7', events: 10 }, { week: 'W8', events: 18 },
    ],
    reports: [
      { id: 'OR-001', date: '25 Apr 2026', locations: 'Lagos Island, Surulere', photos: 24, status: 'Reviewed' },
      { id: 'OR-002', date: '24 Apr 2026', locations: 'Ikeja Market',           photos: 18, status: 'Submitted' },
      { id: 'OR-003', date: '22 Apr 2026', locations: 'Oshodi, Agege, Mushin',  photos: 31, status: 'Reviewed' },
      { id: 'OR-004', date: '20 Apr 2026', locations: 'Victoria Island',         photos: 12, status: 'Submitted' },
      { id: 'OR-005', date: '18 Apr 2026', locations: 'Lekki Phase 1',           photos: 0,  status: 'No Media' },
    ],
  },
};

const TABS = [
  { id: 'overview',      label: 'Overview',     dot: '#c9a84c' },
  { id: 'zonal',         label: 'Zonal',        dot: '#818cf8' },
  { id: 'partnership',   label: 'Partnership',  dot: '#22c55e' },
  { id: 'testimonials',  label: 'Testimonials', dot: '#f59e0b' },
  { id: 'magazine',      label: 'Magazine',     dot: '#ef4444' },
  { id: 'outreach',      label: 'Outreach',     dot: '#2dd4bf' },
];

const COLOR_MAP = {
  purple: { bg: '#f0effe', icon: '#818cf8' },
  green:  { bg: '#f0fdf4', icon: '#22c55e' },
  amber:  { bg: '#fffbeb', icon: '#f59e0b' },
  blue:   { bg: '#eff6ff', icon: '#4a9eff' },
  teal:   { bg: '#f0fdfa', icon: '#2dd4bf' },
  red:    { bg: '#fef2f2', icon: '#ef4444' },
};

const STATUS_CLASS = {
  'On track': 'badge-green', 'Reviewed': 'badge-green',
  'Submitted': 'badge-blue', 'Partial': 'badge-amber',
  'Below': 'badge-red', 'No Media': 'badge-red',
  'Yes': 'badge-green', 'No': 'badge-red',
};

// ── Sub-components ────────────────────────────────────
function KpiCard({ label, value, trend, icon, color }) {
  const c = COLOR_MAP[color] || COLOR_MAP.blue;
  const isNeg = trend.startsWith('-');
  const isNeutral = trend === '—';
  return (
    <div className="kpi-card">
      <div className="kpi-card-top">
        <div className="kpi-icon" style={{ background: c.bg }}>
          <span style={{ fontSize: 18 }}>{icon}</span>
        </div>
        {!isNeutral && (
          <span className={`kpi-trend ${isNeg ? 'neg' : 'pos'}`}>
            <TrendUpIcon color={isNeg ? '#ef4444' : '#22c55e'} />
            {trend}
          </span>
        )}
      </div>
      <div className="kpi-value">{value}</div>
      <div className="kpi-label">{label}</div>
    </div>
  );
}

function SectionCard({ title, icon, children, noPad }) {
  return (
    <div className="section-card">
      <div className="section-card-header">
        <span className="section-card-icon">{icon}</span>
        <span className="section-card-title">{title}</span>
      </div>
      <div className={noPad ? 'section-card-body no-pad' : 'section-card-body'}>
        {children}
      </div>
    </div>
  );
}

function ProgressRow({ label, pct, color, target, achieved }) {
  return (
    <div className="prog-row">
      <div className="prog-header">
        <span className="prog-label">{label}</span>
        <span className="prog-val" style={{ color }}>{pct}%</span>
      </div>
      <div className="prog-track">
        <div className="prog-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
      <div className="prog-meta">Target: {target} · Achieved: {achieved}</div>
    </div>
  );
}

function Badge({ status }) {
  const cls = STATUS_CLASS[status] || 'badge-blue';
  return <span className={`badge ${cls}`}>{status}</span>;
}

function DataTable({ headers, rows }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="data-table">
        <thead>
          <tr>{headers.map(h => <th key={h}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j} className={j === 0 ? 'td-id' : ''}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AttPill({ val, label, color }) {
  return (
    <div className="att-pill">
      <div className="att-pill-val" style={{ color }}>{val}</div>
      <div className="att-pill-lbl">{label}</div>
    </div>
  );
}

// ── Custom Tooltip ────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <p className="tooltip-label">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color, margin: '2px 0', fontSize: 12 }}>
          {p.name}: <strong>{typeof p.value === 'number' ? p.value.toLocaleString() : p.value}</strong>
        </p>
      ))}
    </div>
  );
};

// ── Tab Panels ────────────────────────────────────────
function OverviewPanel({ stats }) {
  const d = DATA.overview;
  const kpis = [
    { label: 'Total Reports',   value: stats?.totalReports   ?? d.kpis[0].value, trend: '+18%', icon: '📊', color: 'purple' },
    { label: 'New Partners',    value: stats?.newPartners    ?? d.kpis[1].value, trend: '+9%',  icon: '🤝', color: 'green' },
    { label: 'Total Remittance',value: stats?.totalRemittance != null ? '₦' + Number(stats.totalRemittance).toLocaleString() : d.kpis[2].value, trend: '+12%', icon: '💰', color: 'amber' },
    { label: 'Testimonies',     value: stats?.testimonies    ?? d.kpis[3].value, trend: '+34%', icon: '✍️', color: 'blue' },
    { label: 'Outreach Events', value: stats?.outreachEvents ?? d.kpis[4].value, trend: '+6%',  icon: '📍', color: 'teal' },
    { label: 'Completion Rate', value: stats?.completionRate ?? d.kpis[5].value, trend: '+3%',  icon: '✅', color: 'green' },
  ];
  return (
    <div className="panel">
      <div className="kpi-grid">
        {kpis.map(k => <KpiCard key={k.label} {...k} />)}
      </div>

      <div className="two-col">
        <SectionCard title="Weekly Submission Trend" icon="📈">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={d.trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="submissions" stroke="#818cf8" strokeWidth={2.5} dot={{ r: 4, fill: '#818cf8' }} name="Submissions" />
            </LineChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="Reports by Category" icon="📊">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={d.categoryDist}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} name="Reports">
                {d.categoryDist.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>
      </div>

      <SectionCard title="Weekly Target Attainment" icon="🎯">
        <div className="targets-grid">
          {d.targets.map(t => <ProgressRow key={t.label} {...t} />)}
        </div>
      </SectionCard>
    </div>
  );
}

function ZonalPanel({ stats }) {
  const d = DATA.zonal;
  const kpis = [
    { label: 'Active Zones',      value: stats?.activeZones      ?? d.kpis[0].value, trend: '+2',   icon: '🏛️', color: 'purple' },
    { label: 'Reports Submitted', value: stats?.reportsSubmitted ?? d.kpis[1].value, trend: '+18%', icon: '📋', color: 'blue' },
    { label: 'Avg New Partners',  value: stats?.avgNewPartners   ?? d.kpis[2].value, trend: '+9%',  icon: '🤝', color: 'green' },
    { label: 'Total Remittance',  value: stats?.totalRemittance != null ? '₦' + Number(stats.totalRemittance).toLocaleString() : d.kpis[3].value, trend: '+12%', icon: '💰', color: 'amber' },
  ];
  return (
    <div className="panel">
      <div className="kpi-grid">
        {kpis.map(k => <KpiCard key={k.label} {...k} />)}
      </div>

      <div className="two-col">
        <SectionCard title="Remittance per Zone (₦K)" icon="🏛️">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={d.remittance} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis dataKey="zone" type="category" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={55} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="amount" fill="#c9a84c" radius={[0, 6, 6, 0]} name="₦K" />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>

        <div className="flex-col-gap">
          <SectionCard title="Director's Meeting — Pastors" icon="📅">
            <div className="att-grid">
              <AttPill val={d.attendance.pastor.yes} label="Present" color="#22c55e" />
              <AttPill val={d.attendance.pastor.no} label="Absent" color="#ef4444" />
              <AttPill val={d.attendance.pastor.excused} label="Excused" color="#f59e0b" />
            </div>
          </SectionCard>
          <SectionCard title="Strategy Meeting — Managers" icon="📅">
            <div className="att-grid">
              <AttPill val={d.attendance.manager.yes} label="Present" color="#22c55e" />
              <AttPill val={d.attendance.manager.no} label="Absent" color="#ef4444" />
              <AttPill val={d.attendance.manager.excused} label="Excused" color="#f59e0b" />
            </div>
          </SectionCard>
        </div>
      </div>

      <div className="two-col">
        <SectionCard title="Healing Outreach Metrics" icon="📖">
          {d.httnm.map(s => (
            <div key={s.label} className="stat-pair">
              <span className="stat-key">{s.label}</span>
              <span className="stat-val">{s.value}</span>
            </div>
          ))}
        </SectionCard>

        <SectionCard title="Zone-by-Zone Breakdown" icon="📋" noPad>
          <DataTable
            headers={['Zone', 'Manager', 'Remittance', 'Partners', 'Outreaches', 'Status']}
            rows={d.zones.map(z => [z.name, z.manager, z.remit, z.partners, z.outreaches, <Badge key={z.id} status={z.status} />])}
          />
        </SectionCard>
      </div>
    </div>
  );
}

function PartnershipPanel() {
  const d = DATA.partnership;
  return (
    <div className="panel">
      <div className="kpi-grid">
        {d.kpis.map(k => <KpiCard key={k.label} {...k} />)}
      </div>

      <div className="two-col">
        <SectionCard title="Remittance by Partnership Arm" icon="💼">
          <div className="arm-grid">
            {d.arms.map(a => (
              <div key={a.key} className="arm-card">
                <div className="arm-card-top">
                  <span style={{ fontSize: 20 }}>{a.icon}</span>
                  <span className="arm-name">{a.label}</span>
                </div>
                <div className="arm-amount" style={{ color: a.color }}>{a.amount}</div>
                <div className="arm-zones">{a.zones} zones reporting</div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Arm Distribution" icon="📊">
          <div className="legend-row">
            {d.dist.map(x => (
              <div key={x.name} className="legend-item">
                <div className="legend-dot" style={{ background: x.color }} />
                <span>{x.name}</span>
              </div>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={d.dist} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                {d.dist.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </SectionCard>
      </div>

      <SectionCard title="Monthly Remittance Trend (₦K)" icon="📈">
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={d.trend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
            <Line type="monotone" dataKey="healingSchool" stroke="#ef4444" strokeWidth={2} dot={false} name="Healing School" />
            <Line type="monotone" dataKey="rhapsody"      stroke="#f59e0b" strokeWidth={2} dot={false} name="Rhapsody" />
            <Line type="monotone" dataKey="innerCity"     stroke="#22c55e" strokeWidth={2} dot={false} name="Inner City" />
            <Line type="monotone" dataKey="lbn"           stroke="#4a9eff" strokeWidth={2} dot={false} name="LBN" />
          </LineChart>
        </ResponsiveContainer>
      </SectionCard>
    </div>
  );
}

function TestimonialsPanel() {
  const d = DATA.testimonials;
  return (
    <div className="panel">
      <div className="kpi-grid">
        {d.kpis.map(k => <KpiCard key={k.label} {...k} />)}
      </div>

      <div className="two-col">
        <SectionCard title="Testimonies vs Target (Weekly)" icon="📊">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={d.weekly}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="target" fill="#e2e8f0" radius={[4, 4, 0, 0]} name="Target" />
              <Bar dataKey="actual" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Actual" />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="Top Zones by Testimonies" icon="🏆" noPad>
          <DataTable
            headers={['Zone', 'Count', 'vs Target', 'Media', 'Docs', 'Status']}
            rows={d.zones.map(z => [z.zone, z.count, z.pct, z.media, z.docs, <Badge key={z.id} status={z.status} />])}
          />
        </SectionCard>
      </div>
    </div>
  );
}

function MagazinePanel() {
  const d = DATA.magazine;
  return (
    <div className="panel">
      <div className="kpi-grid">
        {d.kpis.map(k => <KpiCard key={k.label} {...k} />)}
      </div>

      <div className="two-col">
        <SectionCard title="Orders by Language" icon="🌍">
          {d.languages.map(l => (
            <div key={l.lang} className="prog-row">
              <div className="prog-header">
                <span className="prog-label">{l.lang}</span>
                <span className="prog-val-sm">{l.ordered.toLocaleString()} ordered</span>
              </div>
              <div className="prog-track">
                <div className="prog-fill" style={{ width: `${l.pct}%`, background: l.pct === 100 ? '#22c55e' : l.pct === 0 ? '#ef4444' : '#f59e0b' }} />
              </div>
              <div className="prog-meta">{l.received.toLocaleString()} received · {l.pct}% receipt rate</div>
            </div>
          ))}
        </SectionCard>

        <div className="flex-col-gap">
          <SectionCard title="Receipt Status" icon="📬">
            <div className="legend-row">
              {d.receipt.map(r => (
                <div key={r.name} className="legend-item">
                  <div className="legend-dot" style={{ background: r.color }} />
                  <span>{r.name}: <strong>{r.value}</strong></span>
                </div>
              ))}
            </div>
            <ResponsiveContainer width="100%" height={140}>
              <PieChart>
                <Pie data={d.receipt} cx="50%" cy="50%" innerRadius={38} outerRadius={60} paddingAngle={4} dataKey="value">
                  {d.receipt.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </SectionCard>

          <SectionCard title="Magazine Order Details" icon="📋" noPad>
            <DataTable
              headers={['ID', 'Language', 'Ordered', 'Received', 'Status']}
              rows={d.orders.map(o => [o.id, o.lang, o.ordered, o.received, <Badge key={o.id} status={o.status} />])}
            />
          </SectionCard>
        </div>
      </div>
    </div>
  );
}

function OutreachPanel() {
  const d = DATA.outreach;
  return (
    <div className="panel">
      <div className="kpi-grid">
        {d.kpis.map(k => <KpiCard key={k.label} {...k} />)}
      </div>

      <div className="two-col">
        <SectionCard title="Outreach Events by Week" icon="📈">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={d.weekly}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="events" fill="#2dd4bf" radius={[6, 6, 0, 0]} name="Events" />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="Recent Outreach Reports" icon="📋" noPad>
          <DataTable
            headers={['ID', 'Date', 'Locations', 'Photos', 'Status']}
            rows={d.reports.map(r => [r.id, r.date, r.locations, r.photos, <Badge key={r.id} status={r.status} />])}
          />
        </SectionCard>
      </div>
    </div>
  );
}

// Wrapper so panels receive live stats
const PANEL_MAP = {
  overview:     (props) => <OverviewPanel     {...props} />,
  zonal:        (props) => <ZonalPanel        {...props} />,
  partnership:  (props) => <PartnershipPanel  {...props} />,
  testimonials: (props) => <TestimonialsPanel {...props} />,
  magazine:     (props) => <MagazinePanel     {...props} />,
  outreach:     (props) => <OutreachPanel     {...props} />,
};

// ── Main Component ────────────────────────────────────
export default function AnalyticsDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('This Month');
  const [zone, setZone]           = useState('All Zones');
  const [campaign, setCampaign]   = useState('All Campaigns');
  const [apiStats, setApiStats]   = useState(null);
  const [loading, setLoading]     = useState(false);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const url = `${API}/api/analytics/stats?tab=${activeTab}&timeRange=${encodeURIComponent(timeRange)}&zone=${encodeURIComponent(zone)}`;
      const res  = await fetch(url);
      const data = await res.json();
      setApiStats(data);
    } catch (e) {
      console.error('Analytics fetch failed:', e);
      setApiStats(null);
    } finally {
      setLoading(false);
    }
  }, [activeTab, timeRange, zone]);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const ActivePanel = PANEL_MAP[activeTab];
  const panelKey = `${activeTab}-${timeRange}-${zone}`; // force re-render on filter change

  return (
    <div className="dashboard">
      {/* Top bar */}
      <div className="topbar">
        <div className="topbar-left">
          <span className="topbar-crown">👑</span>
          <span className="topbar-brand">KingsForms Analytics</span>
        </div>
        <div className="topbar-right">
          <button className="icon-btn notif"><BellIcon /><span className="notif-dot" /></button>
          <button className="icon-btn"><SettingsIcon /></button>
          <div className="avatar">ZP</div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <div className="filter-group">
          <label className="filter-label">Time Range</label>
          <div className="select-wrap">
            <select className="filter-select" value={timeRange} onChange={e => setTimeRange(e.target.value)}>
              {['This Week', 'This Month', 'This Quarter', 'This Year'].map(o => <option key={o}>{o}</option>)}
            </select>
            <ChevronIcon />
          </div>
        </div>
        <div className="filter-group">
          <label className="filter-label">Zone</label>
          <div className="select-wrap">
          <select className="filter-select" value={zone} onChange={e => setZone(e.target.value)}>
              {ALL_ZONES.map(o => <option key={o}>{o}</option>)}
            </select>
            <ChevronIcon />
          </div>
        </div>
        <div className="filter-group">
          <label className="filter-label">Campaign</label>
          <div className="select-wrap">
            <select className="filter-select" value={campaign} onChange={e => setCampaign(e.target.value)}>
              {['All Campaigns', 'Healing School', 'Rhapsody', 'Inner City Mission', 'LBN'].map(o => <option key={o}>{o}</option>)}
            </select>
            <ChevronIcon />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-bar">
        {TABS.map(t => (
          <button
            key={t.id}
            className={`tab-btn ${activeTab === t.id ? 'active' : ''}`}
            onClick={() => setActiveTab(t.id)}
          >
            <span className="tab-dot" style={{ background: activeTab === t.id ? t.dot : '#cbd5e1' }} />
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="content">
        {loading && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8', fontSize: 14 }}>
            ⏳ Loading analytics data…
          </div>
        )}
        {!loading && <ActivePanel key={panelKey} stats={apiStats} />}
      </div>
    </div>
  );
}
