import React, { useState, useRef } from 'react';
import { Eye, Download, Search, Filter, Upload, X, Check, ChevronDown } from 'lucide-react';
import { useSettings } from '../../../context/SettingsContext';
import { useNotifications } from '../../../context/NotificationContext';
import { downloadReportPDF } from '../../../utils/generateReportPDF';
import { useAuth } from '../../../auth/AuthContext';
import './styles.css';

// ── Icons ──────────────────────────────────────────────
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
const UploadTabIcon = () => (
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

// ── KingsForms helpers ─────────────────────────────────
function KFSection({ icon, title }) {
  return (
    <div className="kf-section-header">
      <span className="kf-section-icon">{icon}</span>
      <span className="kf-section-title">{title}</span>
    </div>
  );
}

function KFField({ label, required, hint, error, children }) {
  return (
    <div className="kf-field">
      <label className="kf-label">
        {label}
        {required && <span className="kf-required"> *</span>}
        {hint && <em className="kf-hint"> {hint}</em>}
      </label>
      {children}
      {error && <span className="kf-error">{error}</span>}
    </div>
  );
}

// ── View Modal ─────────────────────────────────────────
function ViewModal({ report, onClose, onDownload, onApprove, userRole }) {
  const { formatDate, t } = useSettings();

  const formFields = report.formData ? [
    { label: 'Zone Name',                         value: report.formData.zoneName },
    { label: 'Zonal Manager',                     value: report.formData.zonalManager },
    { label: 'Partnership Remittance (Espees)',    value: report.formData.partnershipRemittance },
    { label: 'New Partners Recruited',            value: report.formData.newPartners },
    { label: 'HTTNM Translations',                value: report.formData.httnmTranslations },
    { label: 'HTTNM Outreaches Held',             value: report.formData.httnmOutreaches },
    { label: 'HTTNM Pictures/Videos Submitted',   value: report.formData.httnmPicturesVideos },
    { label: 'Pastor Attendance – Director Mtg',  value: report.formData.pastoralAttendanceDirector },
    { label: 'Manager Attendance – Director Mtg', value: report.formData.managerAttendanceDirector },
    { label: 'Manager Attendance – Strategy Mtg', value: report.formData.managerAttendanceStrategy },
    { label: 'Healing Crusade Sponsorship',       value: report.formData.healingCrusadeSponsorship },
  ] : [
    { label: t?.date        || 'Date',         value: formatDate(report.rawDate) },
    { label: 'Zone',                           value: report.zone                },
    { label: t?.submittedBy || 'Submitted By', value: report.submittedBy         },
    { label: 'New Partners',                   value: report.attendance          },
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
            <span className={`rp-badge ${report.status}`} style={{ marginTop: 4, display: 'inline-block' }}>{report.status}</span>
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
          {(userRole === 'admin' || userRole === 'global') && report.status === 'PENDING' && (
            <button className="rp-submit-btn" style={{ background: '#4f46e5' }} onClick={() => onApprove(report.id)}>
              <Check size={14} /> Approve Report
            </button>
          )}
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

  const getFileIcon = name => {
    const ext = name.split('.').pop().toLowerCase();
    if (ext === 'pdf')                   return { color: '#dc2626', label: 'PDF'  };
    if (ext === 'doc' || ext === 'docx') return { color: '#2563eb', label: 'DOC'  };
    if (ext === 'xlsx' || ext === 'xls') return { color: '#16a34a', label: 'XLS'  };
    if (ext === 'csv')                   return { color: '#7c3aed', label: 'CSV'  };
    return                                      { color: '#6b7280', label: 'FILE' };
  };

  const handleFileChange = e => { const f = e.target.files[0]; if (f) { setSelectedFile(f); setUploaded(false); } };
  const handleDrop = e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) { setSelectedFile(f); setUploaded(false); } };
  const handleRemove = () => { setSelectedFile(null); setUploaded(false); if (fileInputRef.current) fileInputRef.current.value = ''; };

  return (
    <div className="rp-panel rp-upload-panel">
      <h3>{t?.uploadCSV || 'Upload File'}</h3>
      <input ref={fileInputRef} type="file" accept=".csv,.xlsx,.xls,.pdf,.doc,.docx" style={{ display: 'none' }} onChange={handleFileChange} />
      {!selectedFile && (
        <div className={`rp-dropzone ${dragging ? 'dragging' : ''}`}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}>
          <div className="rp-drop-icon"><Upload size={24} color="#7c3aed" /></div>
          <p>Drag &amp; drop your file here</p>
          <button className="rp-submit-btn" onClick={e => { e.stopPropagation(); fileInputRef.current?.click(); }}>Browse File</button>
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
            <span className="rp-file-size">{selectedFile.size < 1024*1024 ? `${(selectedFile.size/1024).toFixed(1)} KB` : `${(selectedFile.size/(1024*1024)).toFixed(1)} MB`}</span>
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
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
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
        {[
          { key: 'status', label: 'Status', options: [['','All'],['submitted','Submitted'],['reviewed','Reviewed'],['pending','Pending']] },
          { key: 'zone',   label: 'Zone',   options: [['','All Zones'],['Zone A','Zone A'],['Zone B','Zone B'],['Zone C','Zone C'],['Zone D','Zone D'],['Zone E','Zone E']] },
        ].map(f => (
          <div className="rp-filter-field" key={f.key}>
            <label>{f.label}</label>
            <select value={filters[f.key]} onChange={e => onChange(f.key, e.target.value)}>
              {f.options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
        ))}
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
        <div className="rp-modal-body" style={{ textAlign: 'center' }}>
          <div className="rp-modal-export-icon" style={{ background: `${colors[format]}18` }}><ExportIcon /></div>
          <p>Export <strong>{count} report{count !== 1 ? 's' : ''}</strong> as {labels[format]}.</p>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>The file will be downloaded to your device.</p>
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
  React.useEffect(() => { const timer = setTimeout(onDone, 3000); return () => clearTimeout(timer); }, [onDone]);
  return <div className="rp-toast"><Check size={14} /> {message}</div>;
}

// ── Static data ────────────────────────────────────────
const INITIAL_REPORTS = [
  { id: 'RPT-001', rawDate: '2026-03-08', zone: 'Zone A', submittedBy: 'John Smith',       attendance: '12', notes: '', status: 'submitted', media: [], formData: null },
  { id: 'RPT-002', rawDate: '2026-03-07', zone: 'Zone B', submittedBy: 'Sarah Johnson',    attendance: '8',  notes: '', status: 'submitted', media: [], formData: null },
  { id: 'RPT-003', rawDate: '2026-03-06', zone: 'Zone C', submittedBy: 'David Lee',        attendance: '15', notes: '', status: 'reviewed',  media: [], formData: null },
  { id: 'RPT-004', rawDate: '2026-03-05', zone: 'Zone D', submittedBy: 'Mary Wilson',      attendance: '6',  notes: '', status: 'submitted', media: [], formData: null },
  { id: 'RPT-005', rawDate: '2026-03-04', zone: 'Zone E', submittedBy: 'Carlos Rodriguez', attendance: '10', notes: '', status: 'submitted', media: [], formData: null },
];

const EMPTY_FORM = {
  zoneName: '', zonalManager: '',
  partnershipRemittance: '', newPartners: '', testimonies: '',
  httnmTranslations: '', httnmOutreaches: '', httnmPicturesVideos: '',
  pastoralAttendanceDirector: '', managerAttendanceDirector: '', managerAttendanceStrategy: '',
  healingCrusadeSponsorship: '', testimonyClarificationConcern: '',
  media: [],       // preview objects { name, type, url, size }
  mediaFiles: [],  // raw File objects — sent in FormData to backend
};

const EMPTY_FILTERS = { status: '', zone: '' };

const ATTENDANCE_OPTIONS = [
  { value: '',             label: 'Please select' },
  { value: 'Yes',          label: 'Yes'        },
  { value: 'No',           label: 'No'         },
  { value: 'Officially Excused', label: 'Officially Excused' },
];

// ── Main Component ─────────────────────────────────────
export default function ReportingPortal() {
  const { t, formatDate } = useSettings();
  const { addNotification } = useNotifications();
  const { user } = useAuth();

  const [tab, setTab]                       = useState(0);
  const [search, setSearch]                 = useState('');
  const [reports, setReports]               = useState([]);
  const [loading, setLoading]               = useState(true);
  const [form, setForm]                     = useState(EMPTY_FORM);
  const [formErrors, setFormErrors]         = useState({});
  const [submitting, setSubmitting]         = useState(false);
  const [toast, setToast]                   = useState('');
  const [viewReport, setViewReport]         = useState(null);
  const [showFilters, setShowFilters]       = useState(false);
  const [filters, setFilters]               = useState(EMPTY_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState(EMPTY_FILTERS);
  const [exportModal, setExportModal]       = useState(null);

  React.useEffect(() => {
    fetchReports();
  }, [user?.email]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/reports?email=${user?.email || ''}`);
      if (res.ok) {
        const data = await res.json();
        setReports(data.map(r => ({
          ...r,
          rawDate: r.createdAt?.split(' ')[0] || '',
          zone: r.zoneName,
          attendance: r.newPartnersRecruited,
          status: r.status?.toLowerCase() || 'submitted'
        })));
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/reports/${id}/approve`, {
        method: 'PUT'
      });
      if (res.ok) {
        setToast("Report approved successfully");
        fetchReports();
        setViewReport(null);
      }
    } catch (err) {
      setToast("Approval failed");
    }
  };

  const setField = (key, val) => setForm(p => ({ ...p, [key]: val }));

  const TABS = [
    { label: t?.reportingPortal || 'Reports List',     icon: <ListIcon />     },
    { label: t?.submitReport    || 'Submit Report',    icon: <FileIcon />     },
    { label: t?.uploadCSV       || 'Upload CSV/Excel', icon: <UploadTabIcon /> },
  ];

  // Progress bar — 5 required fields
  const REQUIRED_KEYS = ['zoneName', 'zonalManager', 'partnershipRemittance', 'newPartners', 'testimonies'];
  const progressPct = Math.round(
    (REQUIRED_KEYS.filter(k => String(form[k] || '').trim()).length / REQUIRED_KEYS.length) * 100
  );

  const filtered = reports.filter(r => {
    const matchSearch = Object.values(r).some(v => String(v).toLowerCase().includes(search.toLowerCase()));
    const matchStatus = !appliedFilters.status || r.status === appliedFilters.status;
    const matchZone   = !appliedFilters.zone   || r.zone   === appliedFilters.zone;
    return matchSearch && matchStatus && matchZone;
  });

  const activeFilterCount = Object.values(appliedFilters).filter(Boolean).length;
  const downloadRow = row => downloadReportPDF(row, formatDate);

  // ── Validate ─────────────────────────────────────────
  const validate = () => {
    const errors = {};
    if (!form.zoneName.trim())                      errors.zoneName              = 'This field is required';
    if (!form.zonalManager.trim())                  errors.zonalManager          = 'This field is required';
    if (!String(form.partnershipRemittance).trim()) errors.partnershipRemittance = 'This field is required';
    if (!String(form.newPartners).trim())           errors.newPartners           = 'This field is required';
    if (!form.testimonies.trim())                   errors.testimonies           = 'This field is required';
    return errors;
  };

  // ── Submit to backend via multipart FormData ──────────
  // Backend receives all text fields + files under the key 'media'
  // Replace '/api/reports' with your actual API endpoint
  const handleSubmit = async () => {
    const errors = validate();
    setFormErrors(errors);
    if (Object.keys(errors).length) return;

    setSubmitting(true);
    try {
      const payload = {
        submittedBy: user?.displayName || 'User',
        submitterEmail: user?.email || '',
        submittedDate: new Date().toISOString().split('T')[0],
        submittedTime: new Date().toISOString().split('T')[1].split('.')[0],
        weekStartDate: new Date().toISOString().split('T')[0],
        zoneName: form.zoneName,
        zonalManager: form.zonalManager,
        totalPartnershipRemittance: Number(form.partnershipRemittance) || 0,
        newPartnersRecruited: Number(form.newPartners) || 0,
        testimoniesSubmitted: Number(form.testimonies) || 0,
        httnmTranslations: Number(form.httnmTranslations) || 0,
        httnmOutreachesHeld: Number(form.httnmOutreaches) || 0,
        httnmMediaSubmitted: Number(form.httnmPicturesVideos) || 0,
        zonalPastorDirectorsMeeting: form.pastoralAttendanceDirector,
        zonalManagerDirectorsMeeting: form.managerAttendanceDirector,
        zonalManagerStrategyMeeting: form.managerAttendanceStrategy,
        healingCrusadeSponsorship: Number(form.healingCrusadeSponsorship) || 0,
        testimonyClarificationConcern: form.testimonyClarificationConcern,
        regionName: user?.region || 'Global'
      };

      // ── POST ─────────────────────────────────────────
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const saved = await res.json(); // backend should return at least { id }

      const newId = saved.id || `RPT-${String(reports.length + 1).padStart(3, '0')}`;

      setReports(prev => [{
        id: newId,
        rawDate: new Date().toISOString().split('T')[0],
        zone: form.zoneName,
        submittedBy: form.zonalManager,
        attendance: form.newPartners,
        notes: form.testimonyClarificationConcern,
        media: form.media,
        formData: { ...form },
        status: 'submitted',
      }, ...prev]);

      addNotification({
        icon: 'success', role: 'global_admin',
        title: 'New Report Submitted',
        message: `Report ${newId} submitted for ${form.zoneName} by ${form.zonalManager}.`,
      });

      setForm(EMPTY_FORM);
      setFormErrors({});
      setToast(`Report ${newId} submitted successfully`);
      fetchReports();
      setTab(0);

    } catch (err) {
      console.error('Submission error:', err);
      setToast('Submission failed — please try again');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Excel download ────────────────────────────────────
  const downloadExcelTemplate = () => {
    const headers = [
      'Zone Name','Zonal Manager','Partnership Remittance (Espees)',
      'New Partners Recruited','Testimonies Submitted',
      'HTTNM Translations','HTTNM Outreaches Held','HTTNM Pictures/Videos',
      'Pastor Attendance – Director Mtg','Manager Attendance – Director Mtg',
      'Manager Attendance – Strategy Mtg',
      'Healing Crusade Sponsorship','Testimony / Clarification / Concern',
    ];
    const row = [
      form.zoneName, form.zonalManager, form.partnershipRemittance,
      form.newPartners, form.testimonies, form.httnmTranslations,
      form.httnmOutreaches, form.httnmPicturesVideos,
      form.pastoralAttendanceDirector, form.managerAttendanceDirector,
      form.managerAttendanceStrategy, form.healingCrusadeSponsorship,
      form.testimonyClarificationConcern,
    ];
    const tsv  = [headers.join('\t'), row.join('\t')].join('\n');
    const blob = new Blob([tsv], { type: 'application/vnd.ms-excel' });
    const url  = URL.createObjectURL(blob);
    const a    = Object.assign(document.createElement('a'), {
      href: url, download: `weekly-report-${new Date().toISOString().split('T')[0]}.xls`,
    });
    a.click(); URL.revokeObjectURL(url);
    setToast('Excel report downloaded');
  };

  // ── Export reports list ───────────────────────────────
  const handleExport = (format) => {
    const headers = ['Report ID','Date','Zone','Submitted By','New Partners','Status'];
    const dl = (content, name, mime) => {
      const a = Object.assign(document.createElement('a'), {
        href: URL.createObjectURL(new Blob([content], { type: mime })), download: name,
      });
      a.click();
    };
    if (format === 'csv')   dl([headers.join(','), ...filtered.map(r => [r.id, formatDate(r.rawDate), r.zone, r.submittedBy, r.attendance, r.status].join(','))].join('\n'), 'reports.csv', 'text/csv');
    if (format === 'excel') dl([headers.join('\t'), ...filtered.map(r => [r.id, formatDate(r.rawDate), r.zone, r.submittedBy, r.attendance, r.status].join('\t'))].join('\n'), 'reports.xls', 'application/vnd.ms-excel');
    if (format === 'pdf') {
      const win = window.open('', '_blank');
      win.document.write(`<html><head><title>Reports</title><style>body{font-family:Arial;font-size:12px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f3f4f6}</style></head><body><h2>Weekly Reports — ${new Date().toLocaleDateString()}</h2><table><thead><tr>${headers.map(h=>`<th>${h}</th>`).join('')}</tr></thead><tbody>${filtered.map(r=>`<tr><td>${r.id}</td><td>${formatDate(r.rawDate)}</td><td>${r.zone}</td><td>${r.submittedBy}</td><td>${r.attendance}</td><td>${r.status}</td></tr>`).join('')}</tbody></table></body></html>`);
      win.document.close(); win.print();
    }
    setExportModal(null);
    setToast(`Exported ${filtered.length} reports as ${format.toUpperCase()}`);
  };

  // ── Media helpers ─────────────────────────────────────
  const handleMediaAdd = e => {
    const files = Array.from(e.target.files);
    const previews = files.map(f => ({
      name: f.name, type: f.type,
      url: (f.type.startsWith('image') || f.type.startsWith('video')) ? URL.createObjectURL(f) : null,
      size: f.size,
    }));
    setForm(p => ({ ...p, media: [...p.media, ...previews], mediaFiles: [...p.mediaFiles, ...files] }));
    e.target.value = '';
  };

  const handleMediaRemove = i => {
    setForm(p => ({
      ...p,
      media:      p.media.filter((_,j) => j !== i),
      mediaFiles: p.mediaFiles.filter((_,j) => j !== i),
    }));
  };

  // ── Render ────────────────────────────────────────────
  return (
    <div className="rp-page">
      {toast      && <SuccessToast message={toast} onDone={() => setToast('')} />}
      {viewReport && <ViewModal report={viewReport} onClose={() => setViewReport(null)} onDownload={downloadRow} onApprove={handleApprove} userRole={user?.role} />}
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

      {/* ══ Reports List ════════════════════════════════ */}
      {tab === 0 && (
        <div className="rp-panel">
          <div className="rp-toolbar">
            <div className="rp-search">
              <Search size={14} color="#9ca3af" />
              <input type="text" placeholder={t?.search || 'Search reports...'} value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="rp-toolbar-right">
              <button className={`rp-filter-btn ${activeFilterCount > 0 ? 'active' : ''}`} onClick={() => setShowFilters(p => !p)}>
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
            <FilterPanel filters={filters}
              onChange={(key, val) => setFilters(p => ({ ...p, [key]: val }))}
              onClose={() => setShowFilters(false)}
              onApply={() => { setAppliedFilters({ ...filters }); setShowFilters(false); }}
              onReset={() => { setFilters(EMPTY_FILTERS); setAppliedFilters(EMPTY_FILTERS); }}
            />
          )}

          <p className="rp-count">
            {t?.showingReports || 'Showing'} {filtered.length} {t?.reports || 'reports'}
            {activeFilterCount > 0 && (
              <button className="rp-clear-filters" onClick={() => { setFilters(EMPTY_FILTERS); setAppliedFilters(EMPTY_FILTERS); }}>
                Clear filters ×
              </button>
            )}
          </p>

          <div className="rp-table-wrapper" style={{ overflowX: 'auto', width: '100%', WebkitOverflowScrolling: 'touch' }}>
            <table className="rp-table">
              <thead>
                <tr>
                  <th>Report ID</th><th>Date</th><th>Region</th><th>Zone</th>
                  <th>Submitted By</th><th>New Partners</th><th>Status</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={8} style={{ textAlign: 'center', padding: '32px' }}>Loading reports...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={8} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>No reports match your filters.</td></tr>
                ) : filtered.map(row => (
                  <tr key={row.id}>
                    <td className="rp-id">{row.id}</td>
                    <td>{formatDate(row.rawDate)}</td>
                    <td>{row.regionName || 'Global'}</td>
                    <td>{row.zone}</td>
                    <td>{row.submittedBy}</td>
                    <td>{row.attendance}</td>
                    <td><span className={`rp-badge ${row.status}`}>{row.status}</span></td>
                    <td>
                      <div className="rp-actions">
                        <button className="rp-icon-btn view" title="View" onClick={() => setViewReport(row)}><Eye size={15} /></button>
                        <button className="rp-icon-btn dl"   title="Download" onClick={() => downloadRow(row)}><Download size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ══ Submit Report — KingsForms style ════════════ */}
      {tab === 1 && (
        <div className="kf-wrapper">

          {/* Top bar */}
          <div className="kf-top-bar">
            <div className="kf-logo">
              <span className="kf-crown">👑</span>
              <span className="kf-logo-text">KingsForms</span>
            </div>
            <div className="kf-top-actions">
              <button className="kf-top-btn" onClick={downloadExcelTemplate}>↓ Download Template</button>
              <button className="kf-top-btn kf-top-btn-alt" onClick={() => setExportModal('excel')}>📊 Export All Reports</button>
            </div>
          </div>

          {/* Progress */}
          <div className="kf-progress-wrap">
            <div className="kf-progress-track">
              <div className="kf-progress-fill" style={{ width: `${progressPct}%` }} />
            </div>
            <span className="kf-progress-label">{progressPct}% Complete</span>
          </div>

          {/* Form card */}
          <div className="kf-form-card">

            {/* Title */}
            <div className="kf-title-block">
              <h2 className="kf-title">OCTOBER WEEK 1 (7TH OCTOBER)</h2>
              <p className="kf-subtitle">
                Please complete the fields below to submit your response.&nbsp;
                <span className="kf-required">*</span> All required fields are marked with an asterisk.
              </p>
            </div>

            {/* ── Zone Information ── */}
            <KFSection icon="🏛️" title="ZONE INFORMATION" />
            <div className="kf-fields-block">
              <KFField label="Name of Zone" required error={formErrors.zoneName}>
                <input className={`kf-input${formErrors.zoneName ? ' kf-input-err' : ''}`} type="text" placeholder="Type here…"
                  value={form.zoneName} onChange={e => setField('zoneName', e.target.value)} />
              </KFField>
              <KFField label="Zonal Manager" required error={formErrors.zonalManager}>
                <input className={`kf-input${formErrors.zonalManager ? ' kf-input-err' : ''}`} type="text" placeholder="Type here…"
                  value={form.zonalManager} onChange={e => setField('zonalManager', e.target.value)} />
              </KFField>
            </div>

            {/* ── Partnership & Recruitment ── */}
            <KFSection icon="🤝" title="PARTNERSHIP &amp; RECRUITMENT" />
            <div className="kf-fields-block">
              <KFField label="Total Partnership Remittance for this week" required
                hint="(Weekly Target of 10,000 Espees)" error={formErrors.partnershipRemittance}>
                <input className={`kf-input${formErrors.partnershipRemittance ? ' kf-input-err' : ''}`} type="number" min="0" placeholder="0"
                  value={form.partnershipRemittance} onChange={e => setField('partnershipRemittance', e.target.value)} />
              </KFField>
              <KFField label="How many new partners were recruited?" required
                hint="(Target of 10 new partners weekly)" error={formErrors.newPartners}>
                <input className={`kf-input${formErrors.newPartners ? ' kf-input-err' : ''}`} type="number" min="0" placeholder="0"
                  value={form.newPartners} onChange={e => setField('newPartners', e.target.value)} />
              </KFField>
              <KFField label="How many Testimonies were submitted to the Department?" required
                hint="(Target of 50 weekly)" error={formErrors.testimonies}>
                <textarea className={`kf-textarea${formErrors.testimonies ? ' kf-input-err' : ''}`} rows={3} placeholder="Type here…"
                  value={form.testimonies} onChange={e => setField('testimonies', e.target.value)} />
              </KFField>
            </div>

            {/* ── HTTNM Outreach ── */}
            <KFSection icon="📖" title="HTTNM OUTREACH" />
            <div className="kf-fields-block">
              <KFField label="Total number of HTTNM translations achieved?" hint="(Target of 2 weekly)">
                <input className="kf-input" type="number" min="0" placeholder="0"
                  value={form.httnmTranslations} onChange={e => setField('httnmTranslations', e.target.value)} />
              </KFField>
              <KFField label="How many HTTNM outreaches held this week?" hint="(Target of 10 weekly)">
                <input className="kf-input" type="number" min="0" placeholder="0"
                  value={form.httnmOutreaches} onChange={e => setField('httnmOutreaches', e.target.value)} />
              </KFField>
              <KFField label="How many pictures or videos from the HTTNM outreaches were submitted?" hint="(Target of 10 weekly)">
                <input className="kf-input" type="number" min="0" placeholder="0"
                  value={form.httnmPicturesVideos} onChange={e => setField('httnmPicturesVideos', e.target.value)} />
              </KFField>
            </div>

            {/* ── Attendance ── */}
            <KFSection icon="📅" title="ATTENDANCE" />
            <div className="kf-fields-block">
              {[
                { key: 'pastoralAttendanceDirector', label: "Zonal Pastor's attendance in the Esteemed Director's weekly meeting?" },
                { key: 'managerAttendanceDirector',  label: "Zonal Manager's attendance in the Esteemed Director's weekly meeting?" },
                { key: 'managerAttendanceStrategy',  label: "Zonal Manager's attendance in the weekly Managers strategy meeting?" },
              ].map(f => (
                <KFField key={f.key} label={f.label}>
                  <div className="kf-select-wrap">
                    <select className="kf-select" value={form[f.key]} onChange={e => setField(f.key, e.target.value)}>
                      {ATTENDANCE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                    <ChevronDown size={14} style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', pointerEvents:'none', color:'#8899aa' }} />
                  </div>
                </KFField>
              ))}
            </div>

            {/* ── Healing Crusade ── */}
            <KFSection icon="✝️" title="HEALING CRUSADE &amp; CLOSING" />
            <div className="kf-fields-block">
              <KFField label="How much Sponsorship was given for the Healing Crusade this week?">
                <textarea className="kf-textarea" rows={2} placeholder="Type here…"
                  value={form.healingCrusadeSponsorship} onChange={e => setField('healingCrusadeSponsorship', e.target.value)} />
              </KFField>
              <KFField label="Any Testimony, Clarification or Concern?">
                <textarea className="kf-textarea" rows={3} placeholder="Type here…"
                  value={form.testimonyClarificationConcern} onChange={e => setField('testimonyClarificationConcern', e.target.value)} />
              </KFField>
            </div>

            {/* ── Supporting Files ── */}
            <KFSection icon="📎" title="SUPPORTING IMAGES / FILES" />
            <div className="kf-fields-block">
              <label className="kf-dropzone">
                <input type="file" accept="image/*,video/*,.pdf" multiple style={{ display: 'none' }} onChange={handleMediaAdd} />
                <div className="kf-dropzone-inner">
                  <Upload size={22} color="#c9a84c" />
                  <span>Click to upload images or files</span>
                  <small>JPG, PNG, MP4, MOV, PDF accepted · Select multiple at once</small>
                </div>
              </label>

              {form.media.length > 0 && (
                <div className="rp-media-grid" style={{ marginTop: 14 }}>
                  {form.media.map((f, i) => (
                    <div className="rp-media-thumb" key={i}>
                      {f.url && f.type.startsWith('video') ? (
                        <video src={f.url} className="rp-media-img" muted />
                      ) : f.url ? (
                        <img src={f.url} alt={f.name} className="rp-media-img" />
                      ) : (
                        <div className="rp-media-img rp-media-pdf-thumb">PDF</div>
                      )}
                      <button className="rp-media-remove" onClick={() => handleMediaRemove(i)}>✕</button>
                      <div className="rp-media-label">{f.type.startsWith('video') ? '🎥' : f.url ? '🖼️' : '📄'}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── Submit / Clear ── */}
            <div className="kf-actions">
              <button className="kf-submit-btn" onClick={handleSubmit} disabled={submitting}>
                {submitting ? 'Submitting…' : 'Submit Report'}
              </button>
              <button className="kf-clear-btn" onClick={() => { setForm(EMPTY_FORM); setFormErrors({}); }} disabled={submitting}>
                Clear
              </button>
            </div>

            <p className="kf-disclaimer">
              Never submit passwords through KingsForms.<br />
              This content is neither created nor endorsed by KingsForms.
            </p>

          </div>{/* /kf-form-card */}
        </div>
      )}

      {/* ══ Upload CSV ══════════════════════════════════ */}
      {tab === 2 && <UploadTab t={t} />}
    </div>
  );
}
