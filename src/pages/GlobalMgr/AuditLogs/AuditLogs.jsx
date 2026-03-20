import React, { useState } from 'react';
import { Search, Filter, Download, Eye, X, ChevronDown } from 'lucide-react';
import './styles.css';

const INITIAL_LOGS = [
  {
    id: 1,
    timestamp: '3/10/2026\n2:00:00 PM',
    user: 'System Administrator', userId: 1,
    action: 'Created new user',
    module: 'User Management',
    prev: '—', updated: 'user@example.com',
    details: 'A new user account was created with email user@example.com and assigned the role of Data Entry.',
  },
  {
    id: 2,
    timestamp: '3/8/2026\n4:00:00 PM',
    user: 'John Smith', userId: 6,
    action: 'Submitted weekly report',
    module: 'Reporting Portal',
    prev: '—', updated: 'RPT-001',
    details: 'Weekly activity report RPT-001 was submitted for Zone A covering the Spring Outreach 2026 campaign.',
  },
  {
    id: 3,
    timestamp: '3/8/2026\n8:50:00 PM',
    user: 'Regional Manager', userId: 5,
    action: 'Downloaded report',
    module: 'Analytics',
    prev: '—', updated: 'RPT-001.pdf',
    details: 'Report RPT-001 was exported and downloaded as a PDF file from the Analytics module.',
  },
  {
    id: 4,
    timestamp: '3/7/2026\n2:45:00 PM',
    user: 'System Administrator', userId: 1,
    action: 'Updated user role',
    module: 'User Management',
    prev: 'data-entry', updated: 'zonal-manager',
    details: 'User ID 3 role was changed from data-entry to zonal-manager by System Administrator.',
  },
  {
    id: 5,
    timestamp: '3/6/2026\n8:15:00 PM',
    user: 'Finance Manager', userId: 4,
    action: 'Exported finance data',
    module: 'Finance Portal',
    prev: '—', updated: 'finance_report_March_2026.xlsx',
    details: 'Finance records for March 2026 were exported to an Excel file from the Finance Portal.',
  },
  {
    id: 6,
    timestamp: '3/5/2026\n10:00:00 AM',
    user: 'John Smith', userId: 6,
    action: 'Login',
    module: 'Auth',
    prev: '—', updated: 'Success',
    details: 'User John Smith (ID: 6) successfully logged into the platform from IP 192.168.1.45.',
  },
  {
    id: 7,
    timestamp: '3/5/2026\n9:30:00 AM',
    user: 'Unknown', userId: null,
    action: 'Failed login attempt',
    module: 'Auth',
    prev: '—', updated: 'Failed',
    details: 'A failed login attempt was recorded for email unknown@example.com from IP 203.0.113.42.',
  },
];

const MODULE_COLORS = {
  'User Management':  { bg: '#ede9fe', color: '#5b21b6' },
  'Reporting Portal': { bg: '#dbeafe', color: '#1d4ed8' },
  'Analytics':        { bg: '#e0f2fe', color: '#0284c7' },
  'Finance Portal':   { bg: '#dcfce7', color: '#16a34a' },
  'Auth':             { bg: '#fef9c3', color: '#a16207' },
};

const MODULES  = ['All Modules', 'User Management', 'Reporting Portal', 'Analytics', 'Finance Portal', 'Auth'];
const USERS    = ['All Users', 'System Administrator', 'John Smith', 'Regional Manager', 'Finance Manager'];
const ACTIONS  = ['All Actions', 'Created new user', 'Submitted weekly report', 'Downloaded report', 'Updated user role', 'Exported finance data', 'Login', 'Failed login attempt'];

const EMPTY_FILTERS = { module: '', user: '', action: '', dateFrom: '', dateTo: '' };

// ── View Modal ─────────────────────────────────────────
function ViewModal({ log, onClose }) {
  const mc = MODULE_COLORS[log.module] || { bg: '#f3f4f6', color: '#374151' };
  return (
    <div className="al-modal-overlay" onClick={onClose}>
      <div className="al-modal" onClick={e => e.stopPropagation()}>
        <div className="al-modal-header">
          <h3>Log Entry Details</h3>
          <button className="al-modal-close" onClick={onClose}><X size={16} /></button>
        </div>

        <div className="al-modal-body">
          <div className="al-modal-row">
            <span className="al-modal-label">Timestamp</span>
            <span className="al-modal-value">{log.timestamp.replace('\n', ' ')}</span>
          </div>
          <div className="al-modal-row">
            <span className="al-modal-label">User</span>
            <span className="al-modal-value">
              {log.user}
              {log.userId && <span className="al-user-id" style={{ marginLeft: 6 }}>ID: {log.userId}</span>}
            </span>
          </div>
          <div className="al-modal-row">
            <span className="al-modal-label">Action</span>
            <span className="al-modal-value">{log.action}</span>
          </div>
          <div className="al-modal-row">
            <span className="al-modal-label">Module</span>
            <span className="al-module-badge" style={{ background: mc.bg, color: mc.color }}>
              {log.module}
            </span>
          </div>
          <div className="al-modal-row">
            <span className="al-modal-label">Previous Value</span>
            {log.prev === '—'
              ? <span className="al-dash">—</span>
              : <span className="al-code prev">{log.prev}</span>
            }
          </div>
          <div className="al-modal-row">
            <span className="al-modal-label">Updated Value</span>
            <span className="al-code updated">{log.updated}</span>
          </div>
          <div className="al-modal-divider" />
          <div className="al-modal-row al-modal-row-col">
            <span className="al-modal-label">Details</span>
            <p className="al-modal-details">{log.details}</p>
          </div>
        </div>

        <div className="al-modal-footer">
          <button className="al-export-btn" style={{ padding: '8px 16px', fontSize: '0.84rem' }}
            onClick={() => {
              const text = `Log ID: ${log.id}\nTimestamp: ${log.timestamp.replace('\n',' ')}\nUser: ${log.user}\nAction: ${log.action}\nModule: ${log.module}\nPrevious: ${log.prev}\nUpdated: ${log.updated}\nDetails: ${log.details}`;
              const blob = new Blob([text], { type: 'text/plain' });
              const url  = URL.createObjectURL(blob);
              const a    = document.createElement('a');
              a.href = url; a.download = `log_${log.id}.txt`; a.click();
              URL.revokeObjectURL(url);
            }}>
            <Download size={14} /> Download
          </button>
          <button className="al-filter-btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

// ── Filter Panel ───────────────────────────────────────
function FilterPanel({ filters, onChange, onApply, onReset, onClose }) {
  return (
    <div className="al-filter-panel">
      <div className="al-filter-header">
        <span>Filters</span>
        <button className="al-modal-close" onClick={onClose}><X size={14} /></button>
      </div>
      <div className="al-filter-grid">
        <div className="al-filter-field">
          <label>Module</label>
          <select value={filters.module} onChange={e => onChange('module', e.target.value)}>
            {MODULES.map(m => <option key={m} value={m === 'All Modules' ? '' : m}>{m}</option>)}
          </select>
        </div>
        <div className="al-filter-field">
          <label>User</label>
          <select value={filters.user} onChange={e => onChange('user', e.target.value)}>
            {USERS.map(u => <option key={u} value={u === 'All Users' ? '' : u}>{u}</option>)}
          </select>
        </div>
        <div className="al-filter-field">
          <label>Action</label>
          <select value={filters.action} onChange={e => onChange('action', e.target.value)}>
            {ACTIONS.map(a => <option key={a} value={a === 'All Actions' ? '' : a}>{a}</option>)}
          </select>
        </div>
        <div className="al-filter-field">
          <label>Date From</label>
          <input type="date" value={filters.dateFrom}
            onChange={e => onChange('dateFrom', e.target.value)} />
        </div>
      </div>
      <div className="al-filter-actions">
        <button className="al-filter-reset" onClick={onReset}>Reset</button>
        <button className="al-export-btn" style={{ padding: '8px 16px', fontSize: '0.84rem' }}
          onClick={onApply}>
          Apply Filters
        </button>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────
export default function AuditLogs() {
  const [search, setSearch]               = useState('');
  const [viewLog, setViewLog]             = useState(null);
  const [showFilters, setShowFilters]     = useState(false);
  const [filters, setFilters]             = useState(EMPTY_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState(EMPTY_FILTERS);
  const [logs]                            = useState(INITIAL_LOGS);

  // ── Filter logic ──
  const filtered = logs.filter(l => {
    const matchSearch = [l.user, l.action, l.module, l.updated]
      .some(v => v.toLowerCase().includes(search.toLowerCase()));
    const matchModule = !appliedFilters.module || l.module === appliedFilters.module;
    const matchUser   = !appliedFilters.user   || l.user   === appliedFilters.user;
    const matchAction = !appliedFilters.action || l.action === appliedFilters.action;
    return matchSearch && matchModule && matchUser && matchAction;
  });

  const activeFilterCount = Object.values(appliedFilters).filter(Boolean).length;

  // ── Dynamic stats ──
  const todayCount    = logs.filter(l => l.timestamp.startsWith('3/10')).length;
  const uniqueUsers   = new Set(logs.map(l => l.user)).size;
  const uniqueModules = new Set(logs.map(l => l.module)).size;

  // ── Export all logs ──
  const handleExport = () => {
    const headers = ['ID','Timestamp','User','User ID','Action','Module','Previous Value','Updated Value'];
    const rows = filtered.map(l => [
      l.id,
      l.timestamp.replace('\n', ' '),
      l.user,
      l.userId ?? '—',
      l.action,
      l.module,
      l.prev,
      l.updated,
    ].join(','));
    const csv  = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = 'audit_logs.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="al-page">
      {viewLog && <ViewModal log={viewLog} onClose={() => setViewLog(null)} />}

      {/* Header */}
      <div className="al-page-header">
        <div>
          <h2>Audit Logs</h2>
          <p>Track all system activities and changes</p>
        </div>
        <button className="al-export-btn" onClick={handleExport}>
          <Download size={15} /> Export Logs
        </button>
      </div>

      {/* Stats */}
      <div className="al-stats">
        {[
          { label: 'Total Activities', value: logs.length,    color: 'var(--text-primary)' },
          { label: 'Today',            value: todayCount,     color: '#4f46e5'             },
          { label: 'Active Users',     value: uniqueUsers,    color: '#16a34a'             },
          { label: 'Modules',          value: uniqueModules,  color: '#7c3aed'             },
        ].map(s => (
          <div className="al-stat-card" key={s.label}>
            <div className="al-stat-label">{s.label}</div>
            <div className="al-stat-value" style={{ color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="al-panel al-toolbar-panel">
        <div className="al-search">
          <Search size={14} color="#9ca3af" />
          <input
            type="text"
            placeholder="Search audit logs..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <button
          className={`al-filter-btn ${activeFilterCount > 0 ? 'active' : ''}`}
          onClick={() => setShowFilters(p => !p)}
        >
          <Filter size={14} />
          Filters
          {activeFilterCount > 0 && (
            <span className="al-filter-count">{activeFilterCount}</span>
          )}
          <ChevronDown size={12} style={{
            marginLeft: 2,
            transform: showFilters ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.15s',
          }} />
        </button>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <FilterPanel
          filters={filters}
          onChange={(key, val) => setFilters(p => ({ ...p, [key]: val }))}
          onClose={() => setShowFilters(false)}
          onApply={() => { setAppliedFilters({ ...filters }); setShowFilters(false); }}
          onReset={() => { setFilters(EMPTY_FILTERS); setAppliedFilters(EMPTY_FILTERS); }}
        />
      )}

      {/* Table */}
      <div className="al-panel">
        <p className="al-count">
          Showing {filtered.length} log entries
          {activeFilterCount > 0 && (
            <button className="al-clear-filters"
              onClick={() => { setFilters(EMPTY_FILTERS); setAppliedFilters(EMPTY_FILTERS); }}>
              Clear filters ×
            </button>
          )}
        </p>

        <table className="al-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>User</th>
              <th>Action</th>
              <th>Module</th>
              <th>Previous Value</th>
              <th>Updated Value</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} style={{
                  textAlign: 'center', padding: '32px',
                  color: 'var(--text-muted)',
                }}>
                  No log entries match your filters.
                </td>
              </tr>
            ) : filtered.map((row) => {
              const mc = MODULE_COLORS[row.module] || { bg: '#f3f4f6', color: '#374151' };
              return (
                <tr key={row.id}>
                  <td className="al-ts">
                    {row.timestamp.split('\n').map((l, j) => (
                      <div key={j}>{l}</div>
                    ))}
                  </td>
                  <td>
                    <div className="al-user-name">{row.user}</div>
                    {row.userId && (
                      <div className="al-user-id">ID: {row.userId}</div>
                    )}
                  </td>
                  <td>{row.action}</td>
                  <td>
                    <span className="al-module-badge"
                      style={{ background: mc.bg, color: mc.color }}>
                      {row.module}
                    </span>
                  </td>
                  <td>
                    {row.prev === '—'
                      ? <span className="al-dash">—</span>
                      : <span className="al-code prev">{row.prev}</span>
                    }
                  </td>
                  <td>
                    <span className="al-code updated">{row.updated}</span>
                  </td>
                  <td>
                    <button
                      className="al-view-btn"
                      title="View details"
                      onClick={() => setViewLog(row)}
                    >
                      <Eye size={15} />
                    </button>
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