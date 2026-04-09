import React, { useState, useRef } from 'react';
import { Eye, Download, Search, Filter, Upload, X, Check, ChevronDown } from 'lucide-react';
import { useSettings } from '../../../context/SettingsContext';
import { useNotifications } from '../../../context/NotificationContext';
import { downloadReportPDF } from '../../../utils/generateReportPDF';
import './styles.css';

const ListIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
    <line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/>
    <line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
  </svg>
);
const FileIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
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
function ViewModal({ report, onClose, onDownload }) {
  const { formatDate, t } = useSettings();

  const formFields = report.formData ? [
    { label: 'Zone Name',                        value: report.formData.zoneName },
    { label: 'Zonal Manager',                    value: report.formData.zonalManager },
    { label: 'Partnership Remittance',           value: report.formData.partnershipRemittance },
    { label: 'New Partners Recruited',           value: report.formData.newPartners },
    { label: 'HTTNM Translations',               value: report.formData.httnmTranslations },
    { label: 'HTTNM Outreaches Held',            value: report.formData.httnmOutreaches },
    { label: 'HTTNM Pictures/Videos',            value: report.formData.httnmPicturesVideos },
    { label: 'Pastor Attendance – Director Mtg', value: report.formData.pastoralAttendanceDirector },
    { label: 'Manager Attendance – Director Mtg',value: report.formData.managerAttendanceDirector },
    { label: 'Manager Attendance – Strategy Mtg',value: report.formData.managerAttendanceStrategy },
    { label: 'Healing Crusade Sponsorship',      value: report.formData.healingCrusadeSponsorship },
  ] : [
    { label: t?.date        || 'Date',         value: formatDate(report.rawDate) },
    { label: t?.region      || 'Region',       value: report.region              },
    { label: t?.zone        || 'Zone',         value: report.zone                },
    { label: t?.campaign    || 'Campaign',     value: report.campaign            },
    { label: t?.attendance  || 'Attendance',   value: report.attendance          },
    { label: t?.submittedBy || 'Submitted By', value: report.submittedBy         },
    { label: t?.status      || 'Status',       value: report.status              },
  ];

  const testimonies = report.formData?.testimonies;
  const concern     = report.formData?.testimonyClarificationConcern;

  return (
    <div className="rp-modal-overlay" onClick={onClose}>
      <div className="rp-modal" onClick={e => e.stopPropagation()}>
        <div className="rp-modal-header">
          <div>
            <h3>{report.id}</h3>
            <span className={`rp-badge ${report.status}`} style={{ marginTop: 4, display: 'inline-block' }}>
              {report.status}
            </span>
          </div>
          <button className="rp-remove-btn" onClick={onClose}><X size={16} /></button>
        </div>

        <div className="rp-modal-body">
          {formFields.filter(f => f.value).map(f => (
            <div className="rp-view-row" key={f.label}>
              <span className="rp-view-label">{f.label}</span>
              <span className="rp-view-value">{f.value}</span>
            </div>
          ))}

          {testimonies && (
            <div className="rp-view-row rp-view-row-col">
              <span className="rp-view-label">Testimonies Submitted</span>
              <p className="rp-view-notes">{testimonies}</p>
            </div>
          )}
          {concern && (
            <div className="rp-view-row rp-view-row-col">
              <span className="rp-view-label">Testimony / Clarification / Concern</span>
              <p className="rp-view-notes">{concern}</p>
            </div>
          )}
          {!report.formData && report.notes && (
            <div className="rp-view-row rp-view-row-col">
              <span className="rp-view-label">{t?.notes || 'Notes'}</span>
              <p className="rp-view-notes">{report.notes}</p>
            </div>
          )}

          {report.media && report.media.length > 0 && (
            <div className="rp-view-row rp-view-row-col">
              <span className="rp-view-label">Supporting Media ({report.media.length} files)</span>
              <div className="rp-media-grid" style={{ marginTop: 8 }}>
                {report.media.map((f, i) => (
                  <div className="rp-media-thumb" key={i}>
                    {f.url && f.type.startsWith('video') ? (
                      <video src={f.url} className="rp-media-img" controls muted />
                    ) : f.url ? (
                      <a href={f.url} target="_blank" rel="noreferrer">
                        <img src={f.url} alt={f.name} className="rp-media-img" />
                      </a>
                    ) : (
                      <div className="rp-media-img rp-media-pdf-thumb">PDF</div>
                    )}
                    <div className="rp-media-label">
                      {f.type.startsWith('video') ? '🎥' : f.url ? '🖼️' : '📄'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="rp-modal-footer">
          <button className="rp-submit-btn" style={{ background: '#16a34a' }} onClick={() => onDownload(report)}>
            <Download size={14} /> Download PDF
          </button>
          <button className="rp-ghost-btn" onClick={onClose}>{t?.close || 'Close'}</button>
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
    if (ext === 'pdf')                   return { color: '#dc2626', label: 'PDF'  };
    if (ext === 'doc' || ext === 'docx') return { color: '#2563eb', label: 'DOC'  };
    if (ext === 'xlsx' || ext === 'xls') return { color: '#16a34a', label: 'XLS'  };
    if (ext === 'csv')                   return { color: '#7c3aed', label: 'CSV'  };
    return                                      { color: '#6b7280', label: 'FILE' };
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
    <div className="rp-panel rp-upload-panel">
      <h3>{t?.uploadCSV || 'Upload File'}</h3>
      <input ref={fileInputRef} type="file"
        accept=".csv,.xlsx,.xls,.pdf,.doc,.docx"
        style={{ display: 'none' }} onChange={handleFileChange} />

      {!selectedFile && (
        <div className={`rp-dropzone ${dragging ? 'dragging' : ''}`}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}>
          <div className="rp-drop-icon"><Upload size={24} color="#7c3aed" /></div>
          <p>Drag &amp; drop your file here</p>
          <button className="rp-submit-btn"
            onClick={e => { e.stopPropagation(); fileInputRef.current?.click(); }}>
            Browse File
          </button>
          <small>Supports .csv, .xlsx, .xls, .pdf, .doc, .docx</small>
        </div>
      )}

      {selectedFile && !uploaded && (
        <div className="rp-file-selected">
          <div className="rp-file-icon" style={{ background: `${getFileIcon(selectedFile.name).color}18` }}>
            <span style={{ fontSize: '0.65rem', fontWeight: 700, color: getFileIcon(selectedFile.name).color, letterSpacing: '0.05em' }}>
              {getFileIcon(selectedFile.name).label}
            </span>
          </div>
          <div className="rp-file-info">
            <p className="rp-file-name">{selectedFile.name}</p>
            <span className="rp-file-size">
              {selectedFile.size < 1024 * 1024
                ? `${(selectedFile.size / 1024).toFixed(1)} KB`
                : `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB`}
            </span>
          </div>
          <div className="rp-file-actions">
            <button className="rp-submit-btn" onClick={() => setUploaded(true)}>Upload</button>
            <button className="rp-remove-btn" onClick={handleRemove}><X size={15} /></button>
          </div>
        </div>
      )}

      {selectedFile && uploaded && (
        <div className="rp-upload-success">
          <div className="rp-success-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>
          <div className="rp-file-info">
            <p className="rp-file-name">{selectedFile.name}</p>
            <span className="rp-file-size" style={{ color: '#16a34a' }}>Uploaded successfully</span>
          </div>
          <button className="rp-remove-btn" onClick={handleRemove}><X size={15} /></button>
        </div>
      )}
    </div>
  );
}

// ── Filter Panel ───────────────────────────────────────
function FilterPanel({ filters, onChange, onClose, onApply, onReset }) {
  return (
    <div className="rp-filter-panel">
      <div className="rp-filter-header">
        <span>Filters</span>
        <button className="rp-remove-btn" onClick={onClose}><X size={14} /></button>
      </div>
      <div className="rp-filter-grid">
        <div className="rp-filter-field">
          <label>Status</label>
          <select value={filters.status} onChange={e => onChange('status', e.target.value)}>
            <option value="">All</option>
            <option value="submitted">Submitted</option>
            <option value="reviewed">Reviewed</option>
            <option value="pending">Pending</option>
          </select>
        </div>
        <div className="rp-filter-field">
          <label>Zone</label>
          <select value={filters.zone} onChange={e => onChange('zone', e.target.value)}>
            <option value="">All Zones</option>
            <option>Zone A</option><option>Zone B</option>
            <option>Zone C</option><option>Zone D</option><option>Zone E</option>
          </select>
        </div>
        <div className="rp-filter-field">
          <label>Region</label>
          <select value={filters.region} onChange={e => onChange('region', e.target.value)}>
            <option value="">All Regions</option>
            <option>North America</option><option>Europe</option>
            <option>Asia Pacific</option><option>Africa</option><option>South America</option>
          </select>
        </div>
        <div className="rp-filter-field">
          <label>Campaign</label>
          <select value={filters.campaign} onChange={e => onChange('campaign', e.target.value)}>
            <option value="">All Campaigns</option>
            <option>Spring Outreach 2026</option>
            <option>Easter Campaign</option>
            <option>Healing Streams</option>
          </select>
        </div>
      </div>
      <div className="rp-filter-actions">
        <button className="rp-filter-reset" onClick={onReset}>Reset</button>
        <button className="rp-submit-btn" onClick={onApply}>Apply Filters</button>
      </div>
    </div>
  );
}

// ── Export Modal ───────────────────────────────────────
function ExportModal({ format, count, onConfirm, onCancel }) {
  const labels = { excel: 'Excel (.xlsx)', pdf: 'PDF (.pdf)', csv: 'CSV (.csv)' };
  const colors = { excel: '#16a34a', pdf: '#dc2626', csv: '#4f46e5' };
  return (
    <div className="rp-modal-overlay">
      <div className="rp-modal">
        <div className="rp-modal-header">
          <h3>Export as {labels[format]}</h3>
          <button className="rp-remove-btn" onClick={onCancel}><X size={15} /></button>
        </div>
        <div className="rp-modal-body">
          <div className="rp-modal-export-icon" style={{ background: `${colors[format]}18` }}>
            <ExportIcon />
          </div>
          <p>Export <strong>{count} report{count !== 1 ? 's' : ''}</strong> as {labels[format]}.</p>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            The file will be downloaded to your device.
          </p>
        </div>
        <div className="rp-modal-footer">
          <button className="rp-ghost-btn" onClick={onCancel}>Cancel</button>
          <button className="rp-submit-btn" style={{ background: colors[format] }} onClick={onConfirm}>
            <ExportIcon /> Export {format.toUpperCase()}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Toast ──────────────────────────────────────────────
function SuccessToast({ message, onDone }) {
  React.useEffect(() => {
    const timer = setTimeout(onDone, 3000);
    return () => clearTimeout(timer);
  }, [onDone]);
  return <div className="rp-toast"><Check size={14} /> {message}</div>;
}

// ── Progress Bar ───────────────────────────────────────
function ProgressBar({ form }) {
  const requiredKeys = ['zoneName', 'zonalManager', 'partnershipRemittance', 'newPartners', 'testimonies'];
  const filled = requiredKeys.filter(k => String(form[k] || '').trim()).length;
  const pct = Math.round((filled / requiredKeys.length) * 100);
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ height: 4, background: 'var(--border-color)', borderRadius: 4, marginBottom: 6 }}>
        <div style={{
          width: `${pct}%`, height: '100%', background: '#4f46e5',
          borderRadius: 4, transition: 'width 0.3s ease',
        }} />
      </div>
      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{pct}% Complete</span>
    </div>
  );
}

// ── Data ───────────────────────────────────────────────
const INITIAL_REPORTS = [
  { id: 'RPT-001', rawDate: '2026-03-08', region: 'North America', zone: 'Zone A', campaign: 'Spring Outreach 2026', submittedBy: 'John Smith',       attendance: '1,200', notes: '', status: 'submitted', media: [], formData: null },
  { id: 'RPT-002', rawDate: '2026-03-07', region: 'Europe',        zone: 'Zone B', campaign: 'Easter Campaign',      submittedBy: 'Sarah Johnson',    attendance: '850',   notes: '', status: 'submitted', media: [], formData: null },
  { id: 'RPT-003', rawDate: '2026-03-06', region: 'Asia Pacific',  zone: 'Zone C', campaign: 'Spring Outreach 2026', submittedBy: 'David Lee',        attendance: '2,400', notes: '', status: 'reviewed',  media: [], formData: null },
  { id: 'RPT-004', rawDate: '2026-03-05', region: 'Africa',        zone: 'Zone D', campaign: 'Healing Streams',      submittedBy: 'Mary Wilson',      attendance: '600',   notes: '', status: 'submitted', media: [], formData: null },
  { id: 'RPT-005', rawDate: '2026-03-04', region: 'South America', zone: 'Zone E', campaign: 'Spring Outreach 2026', submittedBy: 'Carlos Rodriguez', attendance: '980',   notes: '', status: 'submitted', media: [], formData: null },
];

const EMPTY_FORM = {
  zoneName: '',
  zonalManager: '',
  partnershipRemittance: '',
  newPartners: '',
  testimonies: '',
  httnmTranslations: '',
  httnmOutreaches: '',
  httnmPicturesVideos: '',
  pastoralAttendanceDirector: '',
  managerAttendanceDirector: '',
  managerAttendanceStrategy: '',
  healingCrusadeSponsorship: '',
  testimonyClarificationConcern: '',
  media: [],
};

const EMPTY_FILTERS = { status: '', region: '', zone: '', campaign: '' };

// ── Attendance select field ────────────────────────────
function AttendanceSelect({ label, value, onChange }) {
  return (
    <div className="rp-field rp-field-full">
      <label>{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)} className="rp-select">
        <option value="">Please select</option>
        <option value="present">Present</option>
        <option value="absent">Absent</option>
        <option value="represented">Represented</option>
      </select>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────
export default function ReportingPortal() {
  const { t, formatDate } = useSettings();
  const { addNotification } = useNotifications();

  const [tab, setTab]                       = useState(0);
  const [search, setSearch]                 = useState('');
  const [reports, setReports]               = useState(INITIAL_REPORTS);
  const [form, setForm]                     = useState(EMPTY_FORM);
  const [formErrors, setFormErrors]         = useState({});
  const [toast, setToast]                   = useState('');
  const [viewReport, setViewReport]         = useState(null);
  const [showFilters, setShowFilters]       = useState(false);
  const [filters, setFilters]               = useState(EMPTY_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState(EMPTY_FILTERS);
  const [exportModal, setExportModal]       = useState(null);

  const setField = (key, val) => setForm(p => ({ ...p, [key]: val }));

  const TABS = [
    { label: t?.reportingPortal || 'Reports List',     icon: <ListIcon />   },
    { label: t?.submitReport    || 'Submit Report',    icon: <FileIcon />   },
    { label: t?.uploadCSV       || 'Upload CSV/Excel', icon: <UploadIcon /> },
  ];

  const filtered = reports.filter(r => {
    const matchSearch   = Object.values(r).some(v => String(v).toLowerCase().includes(search.toLowerCase()));
    const matchStatus   = !appliedFilters.status   || r.status   === appliedFilters.status;
    const matchRegion   = !appliedFilters.region   || r.region   === appliedFilters.region;
    const matchZone     = !appliedFilters.zone     || r.zone     === appliedFilters.zone;
    const matchCampaign = !appliedFilters.campaign || r.campaign === appliedFilters.campaign;
    return matchSearch && matchStatus && matchRegion && matchZone && matchCampaign;
  });

  const activeFilterCount = Object.values(appliedFilters).filter(Boolean).length;
  const downloadRow = (row) => downloadReportPDF(row, formatDate);

  // ── Submit handler ─────────────────────────────────
  const handleSubmit = () => {
    const errors = {};
    if (!form.zoneName.trim())              errors.zoneName              = 'Required';
    if (!form.zonalManager.trim())          errors.zonalManager          = 'Required';
    if (!form.partnershipRemittance.trim()) errors.partnershipRemittance = 'Required';
    if (!String(form.newPartners).trim())   errors.newPartners           = 'Required';
    if (!form.testimonies.trim())           errors.testimonies           = 'Required';
    setFormErrors(errors);
    if (Object.keys(errors).length) return;

    const newId = `RPT-${String(reports.length + 1).padStart(3, '0')}`;
    const today = new Date().toISOString().split('T')[0];

    setReports(prev => [{
      id: newId,
      rawDate: today,
      region: '-',
      zone: form.zoneName,
      campaign: 'Weekly Report',
      submittedBy: form.zonalManager,
      attendance: form.newPartners,
      notes: form.testimonyClarificationConcern,
      media: form.media,
      formData: { ...form },
      status: 'submitted',
    }, ...prev]);

    addNotification({
      icon: 'success',
      role: 'global_admin',
      title: 'New Report Submitted',
      message: `Report ${newId} submitted for ${form.zoneName} by ${form.zonalManager}.`,
    });

    setForm(EMPTY_FORM);
    setFormErrors({});
    setToast(`Report ${newId} submitted successfully`);
    setTab(0);
  };

  // ── Excel template download ────────────────────────
  const downloadReportTemplate = () => {
    const headers = [
      'Zone Name',
      'Zonal Manager',
      'Partnership Remittance (Espees)',
      'New Partners Recruited',
      'Testimonies Submitted',
      'HTTNM Translations',
      'HTTNM Outreaches Held',
      'HTTNM Pictures/Videos Submitted',
      'Pastor Attendance - Director Meeting',
      'Manager Attendance - Director Meeting',
      'Manager Attendance - Strategy Meeting',
      'Healing Crusade Sponsorship',
      'Testimony / Clarification / Concern',
    ];
    const row = [
      form.zoneName,
      form.zonalManager,
      form.partnershipRemittance,
      form.newPartners,
      form.testimonies,
      form.httnmTranslations,
      form.httnmOutreaches,
      form.httnmPicturesVideos,
      form.pastoralAttendanceDirector,
      form.managerAttendanceDirector,
      form.managerAttendanceStrategy,
      form.healingCrusadeSponsorship,
      form.testimonyClarificationConcern,
    ];
    const tsv = [headers.join('\t'), row.join('\t')].join('\n');
    const blob = new Blob([tsv], { type: 'application/vnd.ms-excel' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `weekly-report-${new Date().toISOString().split('T')[0]}.xls`;
    a.click();
    URL.revokeObjectURL(url);
    setToast('Excel template downloaded');
  };

  // ── Export handler ─────────────────────────────────
  const handleExport = (format) => {
    const headers = ['Report ID', 'Date', 'Zone', 'Zonal Manager', 'New Partners', 'Submitted By', 'Status'];
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
        ...rows.map(r => [r.id, formatDate(r.rawDate), r.zone, r.submittedBy, r.attendance, r.submittedBy, r.status].join(','))
      ].join('\n');
      downloadFile(csv, 'reports.csv', 'text/csv');
    }
    if (format === 'excel') {
      const tsv = [headers.join('\t'),
        ...rows.map(r => [r.id, formatDate(r.rawDate), r.zone, r.submittedBy, r.attendance, r.submittedBy, r.status].join('\t'))
      ].join('\n');
      downloadFile(tsv, 'reports.xls', 'application/vnd.ms-excel');
    }
    if (format === 'pdf') {
      const html = `<html><head><title>Reports</title>
        <style>body{font-family:Arial,sans-serif;font-size:12px}
        h1{font-size:18px;margin-bottom:16px}
        table{width:100%;border-collapse:collapse}
        th,td{border:1px solid #ddd;padding:8px 10px;text-align:left}
        th{background:#f3f4f6;font-weight:600}
        tr:nth-child(even){background:#f9fafb}</style></head>
        <body><h1>Loveworld Reports — ${new Date().toLocaleDateString()}</h1>
        <table><thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>
        <tbody>${rows.map(r => `<tr>
          <td>${r.id}</td><td>${formatDate(r.rawDate)}</td>
          <td>${r.zone}</td><td>${r.submittedBy}</td>
          <td>${r.attendance}</td><td>${r.submittedBy}</td><td>${r.status}</td>
        </tr>`).join('')}</tbody></table></body></html>`;
      const win = window.open('', '_blank');
      win.document.write(html); win.document.close(); win.print();
    }
    setExportModal(null);
    setToast(`Exported ${rows.length} reports as ${format.toUpperCase()}`);
  };

  // ── Render ─────────────────────────────────────────
  return (
    <div className="rp-page">
      {toast      && <SuccessToast message={toast} onDone={() => setToast('')} />}
      {viewReport && <ViewModal report={viewReport} onClose={() => setViewReport(null)} onDownload={downloadRow} />}
      {exportModal && (
        <ExportModal format={exportModal} count={filtered.length}
          onConfirm={() => handleExport(exportModal)}
          onCancel={() => setExportModal(null)} />
      )}

      <div className="rp-page-header">
        <div>
          <h2>{t?.reportingPortal || 'Reporting Portal'}</h2>
          <p>Submit, manage, and track weekly activity reports</p>
        </div>
      </div>

      <div className="rp-tabs">
        {TABS.map((tb, i) => (
          <button key={i} onClick={() => setTab(i)} className={`rp-tab ${tab === i ? 'active' : ''}`}>
            {tb.icon} {tb.label}
          </button>
        ))}
      </div>
      <div className="rp-tab-divider" />

      {/* ── Reports List ── */}
      {tab === 0 && (
        <div className="rp-panel">
          <div className="rp-toolbar">
            <div className="rp-search">
              <Search size={14} color="#9ca3af" />
              <input type="text" placeholder={t?.search || 'Search reports...'}
                value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="rp-toolbar-right">
              <button className={`rp-filter-btn ${activeFilterCount > 0 ? 'active' : ''}`}
                onClick={() => setShowFilters(p => !p)}>
                <Filter size={14} />
                {t?.filters || 'Filters'}
                {activeFilterCount > 0 && <span className="rp-filter-count">{activeFilterCount}</span>}
                <ChevronDown size={12} style={{ marginLeft: 2, transform: showFilters ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
              </button>
              <button className="rp-export-btn excel" onClick={() => setExportModal('excel')}><ExportIcon /> Excel</button>
              <button className="rp-export-btn pdf"   onClick={() => setExportModal('pdf')}><ExportIcon /> PDF</button>
              <button className="rp-export-btn csv"   onClick={() => setExportModal('csv')}><ExportIcon /> CSV</button>
            </div>
          </div>

          {showFilters && (
            <FilterPanel
              filters={filters}
              onChange={(key, val) => setFilters(p => ({ ...p, [key]: val }))}
              onClose={() => setShowFilters(false)}
              onApply={() => { setAppliedFilters({ ...filters }); setShowFilters(false); }}
              onReset={() => { setFilters(EMPTY_FILTERS); setAppliedFilters(EMPTY_FILTERS); }}
            />
          )}

          <p className="rp-count">
            {t?.showingReports || 'Showing'} {filtered.length} {t?.reports || 'reports'}
            {activeFilterCount > 0 && (
              <button className="rp-clear-filters"
                onClick={() => { setFilters(EMPTY_FILTERS); setAppliedFilters(EMPTY_FILTERS); }}>
                Clear filters ×
              </button>
            )}
          </p>

          <table className="rp-table">
            <thead>
              <tr>
                <th>{t?.reportId   || 'Report ID'}</th>
                <th>{t?.date       || 'Date'}</th>
                <th>{t?.zone       || 'Zone'}</th>
                <th>{t?.submittedBy|| 'Submitted By'}</th>
                <th>{t?.attendance || 'New Partners'}</th>
                <th>{t?.status     || 'Status'}</th>
                <th>{t?.actions    || 'Actions'}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                    No reports match your filters.
                  </td>
                </tr>
              ) : filtered.map(row => (
                <tr key={row.id}>
                  <td className="rp-id">{row.id}</td>
                  <td>{formatDate(row.rawDate)}</td>
                  <td>{row.zone}</td>
                  <td>{row.submittedBy}</td>
                  <td>{row.attendance}</td>
                  <td><span className={`rp-badge ${row.status}`}>{row.status}</span></td>
                  <td>
                    <div className="rp-actions">
                      <button className="rp-icon-btn view" title="View" onClick={() => setViewReport(row)}>
                        <Eye size={15} />
                      </button>
                      <button className="rp-icon-btn dl" title="Download" onClick={() => downloadRow(row)}>
                        <Download size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Submit Report ── */}
      {tab === 1 && (
        <div className="rp-panel rp-form-panel">
          <h3>Weekly Activity Report</h3>
          <p className="rp-form-subtitle">
            Fill in all fields below to submit your response. Required fields are marked with *.
          </p>

          <ProgressBar form={form} />

          {/* Zone Information */}
          <p className="rp-section-label">Zone Information</p>
          <div className="rp-form-grid">
            <div className="rp-field">
              <label>Name of Zone *</label>
              <input type="text" placeholder="Enter zone name"
                value={form.zoneName}
                onChange={e => setField('zoneName', e.target.value)}
                className={formErrors.zoneName ? 'rp-input-error' : ''} />
              {formErrors.zoneName && <span className="rp-field-error">{formErrors.zoneName}</span>}
            </div>
            <div className="rp-field">
              <label>Zonal Manager *</label>
              <input type="text" placeholder="Manager name"
                value={form.zonalManager}
                onChange={e => setField('zonalManager', e.target.value)}
                className={formErrors.zonalManager ? 'rp-input-error' : ''} />
              {formErrors.zonalManager && <span className="rp-field-error">{formErrors.zonalManager}</span>}
            </div>
          </div>

          {/* Partnership & Outreach */}
          <p className="rp-section-label">Partnership &amp; Outreach Metrics</p>
          <div className="rp-form-grid">
            <div className="rp-field rp-field-full">
              <label>
                Total Partnership remittance for this week *
                <span className="rp-field-hint"> (Weekly Target: 10,000 Espees)</span>
              </label>
              <input type="text" placeholder="Amount in Espees"
                value={form.partnershipRemittance}
                onChange={e => setField('partnershipRemittance', e.target.value)}
                className={formErrors.partnershipRemittance ? 'rp-input-error' : ''} />
              {formErrors.partnershipRemittance && <span className="rp-field-error">{formErrors.partnershipRemittance}</span>}
            </div>

            <div className="rp-field">
              <label>
                New partners recruited *
                <span className="rp-field-hint"> (Target: 10/week)</span>
              </label>
              <input type="number" min="0" placeholder="#"
                value={form.newPartners}
                onChange={e => setField('newPartners', e.target.value)}
                className={formErrors.newPartners ? 'rp-input-error' : ''} />
              {formErrors.newPartners && <span className="rp-field-error">{formErrors.newPartners}</span>}
            </div>

            <div className="rp-field">
              <label>
                Testimonies submitted to Department *
                <span className="rp-field-hint"> (Target: 50/week)</span>
              </label>
              <textarea rows={3} placeholder="Describe testimonies..."
                value={form.testimonies}
                onChange={e => setField('testimonies', e.target.value)}
                className={formErrors.testimonies ? 'rp-input-error' : ''} />
              {formErrors.testimonies && <span className="rp-field-error">{formErrors.testimonies}</span>}
            </div>

            <div className="rp-field">
              <label>
                HTTNM translations achieved
                <span className="rp-field-hint"> (Target: 2/week)</span>
              </label>
              <input type="number" min="0" placeholder="#"
                value={form.httnmTranslations}
                onChange={e => setField('httnmTranslations', e.target.value)} />
            </div>

            <div className="rp-field">
              <label>
                HTTNM outreaches held
                <span className="rp-field-hint"> (Target: 10/week)</span>
              </label>
              <input type="number" min="0" placeholder="#"
                value={form.httnmOutreaches}
                onChange={e => setField('httnmOutreaches', e.target.value)} />
            </div>

            <div className="rp-field">
              <label>
                Pictures / videos from HTTNM outreaches submitted
                <span className="rp-field-hint"> (Target: 10/week)</span>
              </label>
              <input type="number" min="0" placeholder="#"
                value={form.httnmPicturesVideos}
                onChange={e => setField('httnmPicturesVideos', e.target.value)} />
            </div>
          </div>

          {/* Attendance */}
          <p className="rp-section-label">Attendance</p>
          <div className="rp-form-grid">
            <AttendanceSelect
              label="Zonal Pastor's attendance — Esteemed Director's weekly meeting?"
              value={form.pastoralAttendanceDirector}
              onChange={val => setField('pastoralAttendanceDirector', val)}
            />
            <AttendanceSelect
              label="Zonal Manager's attendance — Esteemed Director's weekly meeting?"
              value={form.managerAttendanceDirector}
              onChange={val => setField('managerAttendanceDirector', val)}
            />
            <AttendanceSelect
              label="Zonal Manager's attendance — Weekly Managers strategy meeting?"
              value={form.managerAttendanceStrategy}
              onChange={val => setField('managerAttendanceStrategy', val)}
            />
          </div>

          {/* Additional */}
          <p className="rp-section-label">Additional Information</p>
          <div className="rp-form-grid">
            <div className="rp-field rp-field-full">
              <label>How much Sponsorship was given for the Healing Crusade this week?</label>
              <textarea rows={2} placeholder="Amount and details..."
                value={form.healingCrusadeSponsorship}
                onChange={e => setField('healingCrusadeSponsorship', e.target.value)} />
            </div>
            <div className="rp-field rp-field-full">
              <label>Any Testimony, Clarification or Concern?</label>
              <textarea rows={3} placeholder="Share here..."
                value={form.testimonyClarificationConcern}
                onChange={e => setField('testimonyClarificationConcern', e.target.value)} />
            </div>
          </div>

          {/* Media Upload */}
          <p className="rp-section-label">Supporting Images / Files</p>
          <label className="rp-media-dropzone">
            <input
              type="file"
              accept="image/*,video/*,.pdf"
              multiple
              style={{ display: 'none' }}
              onChange={e => {
                const files = Array.from(e.target.files);
                const previews = files.map(f => ({
                  name: f.name,
                  type: f.type,
                  url: (f.type.startsWith('image') || f.type.startsWith('video'))
                    ? URL.createObjectURL(f) : null,
                  size: f.size,
                }));
                setForm(p => ({ ...p, media: [...p.media, ...previews] }));
                e.target.value = '';
              }}
            />
            <div className="rp-media-drop-inner">
              <Upload size={20} color="#7c3aed" />
              <span>Click to upload images or files</span>
              <small>JPG, PNG, MP4, MOV, PDF accepted · Select multiple at once</small>
            </div>
          </label>

          {form.media.length > 0 && (
            <div className="rp-media-grid">
              {form.media.map((f, i) => (
                <div className="rp-media-thumb" key={i}>
                  {f.url && f.type.startsWith('video') ? (
                    <video src={f.url} className="rp-media-img" muted />
                  ) : f.url ? (
                    <img src={f.url} alt={f.name} className="rp-media-img" />
                  ) : (
                    <div className="rp-media-img rp-media-pdf-thumb">PDF</div>
                  )}
                  <button
                    className="rp-media-remove"
                    onClick={() => setForm(p => ({ ...p, media: p.media.filter((_, j) => j !== i) }))}
                  >✕</button>
                  <div className="rp-media-label">
                    {f.type.startsWith('video') ? '🎥' : f.url ? '🖼️' : '📄'}
                  </div>
                </div>
              ))}
            </div>
          )}
          {formErrors.media && <span className="rp-field-error">{formErrors.media}</span>}

          <div className="rp-form-actions-row" style={{ marginTop: 24 }}>
            <button className="rp-submit-btn" onClick={handleSubmit}>
              {t?.submitReport || 'Submit Report'}
            </button>
            <button className="rp-ghost-btn" onClick={() => { setForm(EMPTY_FORM); setFormErrors({}); }}>
              Clear
            </button>
            <button className="rp-ghost-btn rp-download-template-btn" onClick={downloadReportTemplate}>
              <Download size={14} /> Download Excel Template
            </button>
          </div>

          <p className="rp-form-disclaimer">
            Never submit passwords through this form.
          </p>
        </div>
      )}

      {/* ── Upload CSV ── */}
      {tab === 2 && <UploadTab t={t} />}
    </div>
  );
}
