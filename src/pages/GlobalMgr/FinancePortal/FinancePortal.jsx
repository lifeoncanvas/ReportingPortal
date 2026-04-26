import React, { useState, useRef } from 'react';
import { Eye, Download, Search, Filter, Upload, X, Check, ChevronDown } from 'lucide-react';
import { useSettings } from '../../../context/SettingsContext';
import { useAuth } from '../../../auth/AuthContext';
import './styles.css';

// ── Icons ──────────────────────────────────────────────
const ListIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
    <line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/>
  </svg>
);
const DollarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23"/>
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
  </svg>
);
const UploadIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="17 8 12 3 7 8"/>
    <line x1="12" y1="3" x2="12" y2="15"/>
  </svg>
);
const ExportIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/>
    <line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);

// ── View Modal ─────────────────────────────────────────
function ViewModal({ record, onClose }) {
  const { formatDate, currSymbol } = useSettings();

  const handleDownload = () => {
    const headers = ['Entry ID','Date','Region','Zone','Category','Amount','Campaign','Submitted By'];
    const values  = [
      record.id,
      formatDate(record.rawDate),
      record.region,
      record.zone,
      record.category,
      `${currSymbol}${record.rawAmount.toLocaleString()}`,
      record.campaign,
      record.submittedBy,
    ];
    const csv  = [headers.join(','), values.join(',')].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = `${record.id}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fp-modal-overlay" onClick={onClose}>
      <div className="fp-modal" onClick={e => e.stopPropagation()}>
        <div className="fp-modal-header">
          <div>
            <h3>{record.id}</h3>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {formatDate(record.rawDate)}
            </span>
          </div>
          <button className="fp-remove-btn" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="fp-view-body">
          {[
            { label: 'Entry ID',     value: record.id                                           },
            { label: 'Date',         value: formatDate(record.rawDate)                          },
            { label: 'Region',       value: record.region                                       },
            { label: 'Zone',         value: record.zone                                         },
            { label: 'Category',     value: record.category                                     },
            { label: 'Amount',       value: `${currSymbol}${record.rawAmount.toLocaleString()}`  },
            { label: 'Campaign',     value: record.campaign                                     },
            { label: 'Submitted By', value: record.submittedBy                                  },
          ].map(f => (
            <div className="fp-view-row" key={f.label}>
              <span className="fp-view-label">{f.label}</span>
              <span className="fp-view-value">{f.value}</span>
            </div>
          ))}
        </div>

        <div className="fp-modal-footer">
          <button
            className="fp-submit-btn"
            style={{ background: '#16a34a' }}
            onClick={handleDownload}
          >
            <Download size={14} /> Download CSV
          </button>
          <button className="fp-ghost-btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

// ── Upload Tab ─────────────────────────────────────────
function UploadTab({ t }) {
  const fileInputRef                    = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragging, setDragging]         = useState(false);
  const [uploaded, setUploaded]         = useState(false);

  const getFileIcon = (name) => {
    const ext = name.split('.').pop().toLowerCase();
    if (ext === 'pdf')                    return { color: '#dc2626', label: 'PDF'  };
    if (ext === 'doc' || ext === 'docx')  return { color: '#2563eb', label: 'DOC'  };
    if (ext === 'xlsx' || ext === 'xls')  return { color: '#16a34a', label: 'XLS'  };
    if (ext === 'csv')                    return { color: '#7c3aed', label: 'CSV'  };
    return                                       { color: '#6b7280', label: 'FILE' };
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) { setSelectedFile(file); setUploaded(false); }
  };
  const handleDrop = (e) => {
    e.preventDefault(); setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) { setSelectedFile(file); setUploaded(false); }
  };
  const handleRemove = () => {
    setSelectedFile(null); setUploaded(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="fp-panel fp-upload-panel">
      <h3>{t?.uploadCSV || 'Upload File'}</h3>
      <input ref={fileInputRef} type="file"
        accept=".csv,.xlsx,.xls,.pdf,.doc,.docx"
        style={{ display: 'none' }} onChange={handleFileChange} />

      {!selectedFile && (
        <div className={`fp-dropzone ${dragging ? 'dragging' : ''}`}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}>
          <div className="fp-drop-icon"><Upload size={24} color="#7c3aed" /></div>
          <p>Drag & drop your file here</p>
          <button className="fp-submit-btn"
            onClick={e => { e.stopPropagation(); fileInputRef.current?.click(); }}>
            Browse File
          </button>
          <small>Supports .csv, .xlsx, .xls, .pdf, .doc, .docx</small>
        </div>
      )}

      {selectedFile && !uploaded && (
        <div className="fp-file-selected">
          <div className="fp-file-icon"
            style={{ background: `${getFileIcon(selectedFile.name).color}18` }}>
            <span style={{ fontSize: '0.65rem', fontWeight: 700,
              color: getFileIcon(selectedFile.name).color, letterSpacing: '0.05em' }}>
              {getFileIcon(selectedFile.name).label}
            </span>
          </div>
          <div className="fp-file-info">
            <p className="fp-file-name">{selectedFile.name}</p>
            <span className="fp-file-size">
              {selectedFile.size < 1024 * 1024
                ? `${(selectedFile.size / 1024).toFixed(1)} KB`
                : `${(selectedFile.size / (1024*1024)).toFixed(1)} MB`}
            </span>
          </div>
          <div className="fp-file-actions">
            <button className="fp-submit-btn" onClick={() => setUploaded(true)}>Upload</button>
            <button className="fp-remove-btn" onClick={handleRemove}><X size={15} /></button>
          </div>
        </div>
      )}

      {selectedFile && uploaded && (
        <div className="fp-upload-success">
          <div className="fp-success-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
              stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>
          <div className="fp-file-info">
            <p className="fp-file-name">{selectedFile.name}</p>
            <span className="fp-file-size" style={{ color: '#16a34a' }}>Uploaded successfully</span>
          </div>
          <button className="fp-remove-btn" onClick={handleRemove}><X size={15} /></button>
        </div>
      )}
    </div>
  );
}

// ── Filter Panel ───────────────────────────────────────
function FilterPanel({ filters, onChange, onClose, onApply, onReset }) {
  return (
    <div className="fp-filter-panel">
      <div className="fp-filter-header">
        <span>Filters</span>
        <button className="fp-remove-btn" onClick={onClose}><X size={14} /></button>
      </div>
      <div className="fp-filter-grid">
        <div className="fp-filter-field">
          <label>Region</label>
          <select value={filters.region} onChange={e => onChange('region', e.target.value)}>
            <option value="">All Regions</option>
            <option>North America</option><option>Europe</option>
            <option>Asia Pacific</option><option>Africa</option>
            <option>South America</option>
          </select>
        </div>
        <div className="fp-filter-field">
          <label>Zone</label>
          <select value={filters.zone} onChange={e => onChange('zone', e.target.value)}>
            <option value="">All Zones</option>
            <option>Zone A</option><option>Zone B</option>
            <option>Zone C</option><option>Zone D</option><option>Zone E</option>
          </select>
        </div>
        <div className="fp-filter-field">
          <label>Category</label>
          <select value={filters.category} onChange={e => onChange('category', e.target.value)}>
            <option value="">All Categories</option>
            <option>Event Expenses</option><option>Marketing</option>
            <option>Medical Supplies</option><option>Venue Rental</option>
            <option>Educational Materials</option>
          </select>
        </div>
        <div className="fp-filter-field">
          <label>Campaign</label>
          <select value={filters.campaign} onChange={e => onChange('campaign', e.target.value)}>
            <option value="">All Campaigns</option>
            <option>Spring Outreach 2026</option>
            <option>Easter Campaign</option>
            <option>Healing Streams</option>
          </select>
        </div>
      </div>
      <div className="fp-filter-actions">
        <button className="fp-ghost-btn" onClick={onReset}>Reset</button>
        <button className="fp-submit-btn" onClick={onApply}>Apply Filters</button>
      </div>
    </div>
  );
}

// ── Export Modal ───────────────────────────────────────
function ExportModal({ format, count, onConfirm, onCancel }) {
  const labels = { excel: 'Excel (.xlsx)', pdf: 'PDF (.pdf)', csv: 'CSV (.csv)' };
  const colors = { excel: '#16a34a', pdf: '#dc2626', csv: '#4f46e5' };
  return (
    <div className="fp-modal-overlay">
      <div className="fp-modal">
        <div className="fp-modal-header">
          <h3>Export as {labels[format]}</h3>
          <button className="fp-remove-btn" onClick={onCancel}><X size={15} /></button>
        </div>
        <div className="fp-modal-body">
          <div className="fp-modal-icon" style={{ background: `${colors[format]}18` }}>
            <ExportIcon />
          </div>
          <p>Export <strong>{count} record{count !== 1 ? 's' : ''}</strong> as {labels[format]}.</p>
          <p className="fp-modal-sub">The file will be downloaded to your device.</p>
        </div>
        <div className="fp-modal-footer">
          <button className="fp-ghost-btn" onClick={onCancel}>Cancel</button>
          <button className="fp-submit-btn" style={{ background: colors[format] }} onClick={onConfirm}>
            <ExportIcon /> Export {format.toUpperCase()}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Toast ──────────────────────────────────────────────
function Toast({ message, onDone }) {
  React.useEffect(() => {
    const timer = setTimeout(onDone, 3000);
    return () => clearTimeout(timer);
  }, [onDone]);
  return <div className="fp-toast"><Check size={14} /> {message}</div>;
}

// ── Data ───────────────────────────────────────────────
const INITIAL_RECORDS = [
  { id: 'FIN-001', rawDate: '2026-03-08', region: 'North America', zone: 'Zone A', category: 'Event Expenses',        rawAmount: 5500, campaign: 'Spring Outreach 2026', submittedBy: 'John Smith'       },
  { id: 'FIN-002', rawDate: '2026-03-07', region: 'Europe',        zone: 'Zone B', category: 'Marketing',             rawAmount: 3200, campaign: 'Easter Campaign',      submittedBy: 'Sarah Johnson'    },
  { id: 'FIN-003', rawDate: '2026-03-06', region: 'Asia Pacific',  zone: 'Zone C', category: 'Medical Supplies',      rawAmount: 8900, campaign: 'Spring Outreach 2026', submittedBy: 'David Lee'        },
  { id: 'FIN-004', rawDate: '2026-03-05', region: 'Africa',        zone: 'Zone D', category: 'Venue Rental',          rawAmount: 4500, campaign: 'Healing Streams',      submittedBy: 'Mary Wilson'      },
  { id: 'FIN-005', rawDate: '2026-03-04', region: 'South America', zone: 'Zone E', category: 'Educational Materials', rawAmount: 2800, campaign: 'Spring Outreach 2026', submittedBy: 'Carlos Rodriguez' },
];

const EMPTY_FORM    = { region: '', zone: '', category: '', campaign: '', amount: '' };
const EMPTY_FILTERS = { region: '', zone: '', category: '', campaign: '' };

// ── Main Component ─────────────────────────────────────
export default function FinancePortal() {
  const { formatDate, currSymbol, t } = useSettings();
  const { user } = useAuth();
  const [tab, setTab]                       = useState(0);
  const [search, setSearch]                 = useState('');
  const [records, setRecords]               = useState(INITIAL_RECORDS);
  const [form, setForm]                     = useState(EMPTY_FORM);
  const [formErrors, setFormErrors]         = useState({});
  const [toast, setToast]                   = useState('');
  const [exportModal, setExportModal]       = useState(null);
  const [showFilters, setShowFilters]       = useState(false);
  const [filters, setFilters]               = useState(EMPTY_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState(EMPTY_FILTERS);
  const [viewRecord, setViewRecord]         = useState(null); // ← new

  const TABS = [
    { label: 'Finance Records',                   icon: <ListIcon />   },
    { label: t?.addEntry     || 'Add Entry',      icon: <DollarIcon /> },
    { label: t?.uploadCSV    || 'Upload CSV/Excel',icon: <UploadIcon /> },
  ];

  const filtered = records.filter(r => {
    let roleAccess = true;
    if (user?.role === 'global' || user?.role === 'regional') {
      roleAccess = (r.region === user.region);
    } else if (user?.role === 'zonal') {
      roleAccess = (r.submittedBy === (user?.firstName + ' ' + user?.lastName).trim() || r.submittedBy === user?.name);
    }

    const matchSearch   = [r.id, r.region, r.zone, r.category, r.campaign, r.submittedBy]
      .some(v => v.toLowerCase().includes(search.toLowerCase()));
    const matchRegion   = !appliedFilters.region   || r.region   === appliedFilters.region;
    const matchZone     = !appliedFilters.zone     || r.zone     === appliedFilters.zone;
    const matchCategory = !appliedFilters.category || r.category === appliedFilters.category;
    const matchCampaign = !appliedFilters.campaign || r.campaign === appliedFilters.campaign;
    return roleAccess && matchSearch && matchRegion && matchZone && matchCategory && matchCampaign;
  });

  const activeFilterCount = Object.values(appliedFilters).filter(Boolean).length;
  const totalAmount       = records.reduce((sum, r) => sum + r.rawAmount, 0);
  const avgAmount         = records.length ? Math.round(totalAmount / records.length) : 0;

  const SUMMARY = [
    { label: t?.totalRecords || 'Total Records',  value: records.length.toString()                      },
    { label: t?.totalAmount  || 'Total Amount',   value: `${currSymbol}${totalAmount.toLocaleString()}` },
    { label: t?.avgAmount    || 'Average Amount', value: `${currSymbol}${avgAmount.toLocaleString()}`   },
  ];

  const downloadRow = (row) => {
    const headers = ['Entry ID','Date','Region','Zone','Category','Amount','Campaign','Submitted By'];
    const values  = [
      row.id, formatDate(row.rawDate), row.region, row.zone, row.category,
      `${currSymbol}${row.rawAmount.toLocaleString()}`, row.campaign, row.submittedBy,
    ];
    const csv  = [headers.join(','), values.join(',')].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = `${row.id}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const handleAddEntry = () => {
    const errors = {};
    if (!form.region)   errors.region   = 'Required';
    if (!form.zone)     errors.zone     = 'Required';
    if (!form.category) errors.category = 'Required';
    if (!form.campaign) errors.campaign = 'Required';
    if (!form.amount)   errors.amount   = 'Required';
    if (form.amount && isNaN(Number(form.amount.replace(/[$,£€₦]/g, ''))))
      errors.amount = 'Must be a number';
    setFormErrors(errors);
    if (Object.keys(errors).length) return;

    const newId  = `FIN-${String(records.length + 1).padStart(3, '0')}`;
    const rawAmt = Number(form.amount.replace(/[$,£€₦]/g, ''));
    const today  = new Date().toISOString().split('T')[0];

    setRecords(prev => [{
      id: newId, rawDate: today,
      region: form.region, zone: form.zone,
      category: form.category, rawAmount: rawAmt,
      campaign: form.campaign, submittedBy: 'You',
    }, ...prev]);

    setForm(EMPTY_FORM); setFormErrors({});
    setToast(`Entry ${newId} added successfully`);
    setTab(0);
  };

  const handleExport = (format) => {
    const headers = ['Entry ID','Date','Region','Zone','Category','Amount','Campaign','Submitted By'];
    const rows    = filtered;

    const downloadFile = (content, filename, mime) => {
      const blob = new Blob([content], { type: mime });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href = url; a.download = filename; a.click();
      URL.revokeObjectURL(url);
    };

    if (format === 'csv') {
      const csv = [headers.join(','),
        ...rows.map(r => [r.id, formatDate(r.rawDate), r.region, r.zone, r.category,
          `${currSymbol}${r.rawAmount.toLocaleString()}`, r.campaign, r.submittedBy].join(','))
      ].join('\n');
      downloadFile(csv, 'finance_records.csv', 'text/csv');
    }
    if (format === 'excel') {
      const tsv = [headers.join('\t'),
        ...rows.map(r => [r.id, formatDate(r.rawDate), r.region, r.zone, r.category,
          `${currSymbol}${r.rawAmount.toLocaleString()}`, r.campaign, r.submittedBy].join('\t'))
      ].join('\n');
      downloadFile(tsv, 'finance_records.xls', 'application/vnd.ms-excel');
    }
    if (format === 'pdf') {
      const html = `<html><head><title>Finance Records</title>
        <style>body{font-family:Arial,sans-serif;font-size:12px}
        h1{font-size:18px;margin-bottom:16px}
        table{width:100%;border-collapse:collapse}
        th,td{border:1px solid #ddd;padding:8px 10px;text-align:left}
        th{background:#f3f4f6;font-weight:600}
        tr:nth-child(even){background:#f9fafb}</style></head>
        <body><h1>Loveworld Finance Records — ${new Date().toLocaleDateString()}</h1>
        <table><thead><tr>${headers.map(h=>`<th>${h}</th>`).join('')}</tr></thead>
        <tbody>${rows.map(r=>`<tr>
          <td>${r.id}</td><td>${formatDate(r.rawDate)}</td>
          <td>${r.region}</td><td>${r.zone}</td><td>${r.category}</td>
          <td>${currSymbol}${r.rawAmount.toLocaleString()}</td>
          <td>${r.campaign}</td><td>${r.submittedBy}</td>
        </tr>`).join('')}</tbody></table></body></html>`;
      const win = window.open('', '_blank');
      win.document.write(html); win.document.close(); win.print();
    }
    setExportModal(null);
    setToast(`Exported ${rows.length} records as ${format.toUpperCase()}`);
  };

  return (
    <div className="fp-page">
      {toast && <Toast message={toast} onDone={() => setToast('')} />}

      {/* View modal */}
      {viewRecord && (
        <ViewModal record={viewRecord} onClose={() => setViewRecord(null)} />
      )}

      {exportModal && (
        <ExportModal format={exportModal} count={filtered.length}
          onConfirm={() => handleExport(exportModal)}
          onCancel={() => setExportModal(null)} />
      )}

      <div className="fp-page-header">
        <div>
          <h2>{t?.financePortal || 'Finance Portal'}</h2>
          <p>Manage financial records and expense tracking</p>
        </div>
      </div>

      <div className="fp-tabs">
        {TABS.map((tb, i) => (
          <button key={i} onClick={() => setTab(i)}
            className={`fp-tab ${tab === i ? 'active' : ''}`}>
            {tb.icon} {tb.label}
          </button>
        ))}
      </div>
      <div className="fp-tab-divider" />

      {tab === 0 && (
        <div className="fp-panel">
          <div className="fp-summary">
            {SUMMARY.map(s => (
              <div className="fp-stat-card" key={s.label}>
                <div className="fp-stat-label">{s.label}</div>
                <div className="fp-stat-value">{s.value}</div>
              </div>
            ))}
          </div>

          <div className="fp-toolbar">
            <div className="fp-search">
              <Search size={14} color="#9ca3af" />
              <input type="text"
                placeholder={t?.search || 'Search finance records...'}
                value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="fp-toolbar-right">
              <button
                className={`fp-filter-btn ${activeFilterCount > 0 ? 'active' : ''}`}
                onClick={() => setShowFilters(p => !p)}>
                <Filter size={14} />
                {t?.filters || 'Filters'}
                {activeFilterCount > 0 && (
                  <span className="fp-filter-count">{activeFilterCount}</span>
                )}
                <ChevronDown size={12} style={{
                  marginLeft: 2,
                  transform: showFilters ? 'rotate(180deg)' : 'none',
                  transition: 'transform 0.15s',
                }} />
              </button>
              <button className="fp-export-btn excel" onClick={() => setExportModal('excel')}>
                <ExportIcon /> Excel
              </button>
              <button className="fp-export-btn pdf" onClick={() => setExportModal('pdf')}>
                <ExportIcon /> PDF
              </button>
              <button className="fp-export-btn csv" onClick={() => setExportModal('csv')}>
                <ExportIcon /> CSV
              </button>
            </div>
          </div>

          {showFilters && (
            <FilterPanel filters={filters}
              onChange={(key, val) => setFilters(p => ({ ...p, [key]: val }))}
              onClose={() => setShowFilters(false)}
              onApply={() => { setAppliedFilters({ ...filters }); setShowFilters(false); }}
              onReset={() => { setFilters(EMPTY_FILTERS); setAppliedFilters(EMPTY_FILTERS); }}
            />
          )}

          <p className="fp-count">
            {t?.showingReports || 'Showing'} {filtered.length} {t?.reports || 'records'}
            {activeFilterCount > 0 && (
              <button className="fp-clear-filters"
                onClick={() => { setFilters(EMPTY_FILTERS); setAppliedFilters(EMPTY_FILTERS); }}>
                Clear filters ×
              </button>
            )}
          </p>

          <div className="fp-table-wrapper" style={{ overflowX: 'auto', width: '100%', WebkitOverflowScrolling: 'touch' }}>
            <table className="fp-table">
              <thead>
                <tr>
                  <th>{t?.entryId || 'Entry ID'}</th><th>{t?.date || 'Date'}</th><th>{t?.region || 'Region'}</th><th>{t?.zone || 'Zone'}</th>
                  <th>{t?.category || 'Category'}</th><th>{t?.amount || 'Amount'}</th><th>{t?.campaign || 'Campaign'}</th>
                  <th>{t?.submittedBy || 'Submitted By'}</th><th>{t?.actions || 'Actions'}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={9} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                      No records match your filters.
                    </td>
                  </tr>
                ) : filtered.map(row => (
                  <tr key={row.id}>
                    <td className="fp-id">{row.id}</td>
                    <td>{formatDate(row.rawDate)}</td>
                    <td>{row.region}</td>
                    <td>{row.zone}</td>
                    <td>{row.category}</td>
                    <td className="fp-amount">{currSymbol}{row.rawAmount.toLocaleString()}</td>
                    <td>{row.campaign}</td>
                    <td>{row.submittedBy}</td>
                    <td>
                      <div className="fp-actions">
                        <button className="fp-icon-btn view" title="View"
                          onClick={() => setViewRecord(row)}>         {/* ← wired */}
                          <Eye size={15} />
                        </button>
                        <button className="fp-icon-btn dl" title="Download as CSV"
                          onClick={() => downloadRow(row)}>
                          <Download size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 1 && (
        <div className="fp-panel fp-form-panel">
          <h3>{t?.addEntry || 'Add Finance Entry'}</h3>
          <div className="fp-form-grid">
            {[
              { key: 'region',   label: 'Region',   placeholder: 'e.g. Africa'               },
              { key: 'zone',     label: 'Zone',     placeholder: 'e.g. Zone A'               },
              { key: 'category', label: 'Category', placeholder: 'e.g. Event Expenses'       },
              { key: 'campaign', label: 'Campaign', placeholder: 'e.g. Spring Outreach 2026' },
              { key: 'amount',   label: 'Amount',   placeholder: `e.g. ${currSymbol}1,200`   },
            ].map(f => (
              <div className="fp-field" key={f.key}>
                <label>{f.label}</label>
                <input type="text" placeholder={f.placeholder}
                  value={form[f.key]}
                  onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  className={formErrors[f.key] ? 'fp-input-error' : ''} />
                {formErrors[f.key] && (
                  <span className="fp-field-error">{formErrors[f.key]}</span>
                )}
              </div>
            ))}
          </div>
          <div className="fp-form-actions-row">
            <button className="fp-submit-btn" onClick={handleAddEntry}>
              {t?.addEntry || 'Add Entry'}
            </button>
            <button className="fp-ghost-btn"
              onClick={() => { setForm(EMPTY_FORM); setFormErrors({}); }}>
              Clear
            </button>
          </div>
        </div>
      )}

      {tab === 2 && <UploadTab t={t} />}
    </div>
  );
}