import React, { useState } from 'react';
import { Search, Filter, Download, Eye, X, ChevronDown } from 'lucide-react';
import './styles.css';

const INITIAL_LOGS = [];

const MODULE_COLORS = {
  'User Management':  { bg: '#ede9fe', color: '#5b21b6' },
  'Reporting Portal': { bg: '#dbeafe', color: '#1d4ed8' },
  'Analytics':        { bg: '#e0f2fe', color: '#0284c7' },
  'Finance Portal':   { bg: '#dcfce7', color: '#16a34a' },
  'Auth':             { bg: '#fef9c3', color: '#a16207' },
};

const MODULES  = ['All Modules', 'User Management', 'Reporting Portal', 'Analytics', 'Finance Portal', 'Auth'];
const ACTIONS  = ['All Actions', 'Created new user', 'Completed Registration', 'Login', 'Failed login attempt'];

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
          <input type="text" placeholder="Search user name" value={filters.user} 
            onChange={e => onChange('user', e.target.value)} />
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
  const [logs, setLogs]                   = useState(INITIAL_LOGS);

  React.useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await fetch('http://localhost:8080/api/audit-logs');
      const data = await res.json();
      setLogs(data || []);
    } catch(err) { console.error("Failed to load audit logs", err); }
  };

  // ── Filter logic ──
  const filtered = logs.filter(l => {
    const matchSearch = [l.user, l.action, l.module, l.updated]
      .some(v => v.toLowerCase().includes(search.toLowerCase()));
    const matchModule = !appliedFilters.module || l.module === appliedFilters.module;
    const matchUser   = !appliedFilters.user   || (l.user && l.user.toLowerCase().includes(appliedFilters.user.toLowerCase()));
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