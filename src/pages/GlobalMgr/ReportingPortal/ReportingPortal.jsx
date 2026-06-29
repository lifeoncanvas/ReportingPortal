import React, { useState, useRef, useEffect } from 'react';
import { Eye, Download, Search, Upload, X, Check, ChevronDown, Plus, FileText, Heart, BookOpen, Newspaper, Users, Trash2, MessageSquare } from 'lucide-react';
import { useAuth } from '../../../auth/AuthContext';
import { downloadReportPDF } from '../../../utils/generateReportPDF';
import './styles.css';

// ── Icons ──────────────────────────────────────────────
const ExportIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/>
    <line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);

// ── Helpers ────────────────────────────────────────────
function formatDate(raw) {
  if (!raw) return '—';
  const d = new Date(raw);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function Badge({ status }) {
  return <span className={`rp-badge ${status}`}>{status}</span>;
}

function Toast({ message, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3000); return () => clearTimeout(t); }, [onDone]);
  return <div className="rp-toast"><Check size={14} /> {message}</div>;
}

// ── Field wrapper ──────────────────────────────────────
function Field({ label, required, hint, error, children }) {
  return (
    <div className="kf-field">
      <label className="kf-label">
        {label}{required && <span style={{ color: '#ef4444' }}> *</span>}
        {hint && <em className="kf-hint"> {hint}</em>}
      </label>
      {children}
      {error && <span className="kf-error">{error}</span>}
    </div>
  );
}

// ── Media uploader ─────────────────────────────────────
function MediaUploader({ files, onAdd, onRemove, label = "Upload Images / Files", accept = "image/*,video/*,.pdf" }) {
  const ref = useRef();
  return (
    <div>
      <label className="kf-dropzone" onClick={() => ref.current?.click()}>
        <input ref={ref} type="file" accept={accept} multiple style={{ display: 'none' }}
          onChange={e => { onAdd(Array.from(e.target.files)); e.target.value = ''; }} />
        <div className="kf-dropzone-inner">
          <Upload size={20} color="#c9a84c" />
          <span>{label}</span>
          <small>Click to browse files</small>
        </div>
      </label>
      {files.length > 0 && (
        <div className="rp-media-grid" style={{ marginTop: 12 }}>
          {files.map((f, i) => (
            <div className="rp-media-thumb" key={i}>
              {f.url && f.type?.startsWith('video') ? <video src={f.url} className="rp-media-img" muted />
                : f.url ? <img src={f.url} alt={f.name} className="rp-media-img" />
                : <div className="rp-media-img rp-media-pdf-thumb">{f.name?.endsWith('.pdf') ? 'PDF' : 'DOC'}</div>}
              <button className="rp-media-remove" onClick={() => onRemove(i)}>✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Clarification Modal ───────────────────────────────
function ClarificationModal({ report, endpoint, onClose, onDone }) {
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const baseUrl = window.ENV?.API_PATH || process.env.REACT_APP_API_URL || 'http://65.1.248.88:8081';

  const send = async () => {
    if (!note.trim()) return;
    setLoading(true);
    try {
      await fetch(`${baseUrl}${endpoint}/${report.id.replace(/^[A-Z]+-/, '')}/clarification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note }),
      });
      onDone();
    } catch (e) {
      console.error(e);
      alert('Failed to send clarification request');
    }
    setLoading(false);
  };

  return (
    <div className="rp-modal-overlay" onClick={onClose}>
      <div className="rp-modal" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>
        <div className="rp-modal-header">
          <h3>Ask for Clarification</h3>
          <button className="rp-remove-btn" onClick={onClose}><X size={18}/></button>
        </div>
        <div className="rp-modal-body">
          <p style={{ fontSize:13, color:'#6b7280', marginBottom:12 }}>
            Your note will be saved against this report and its status will be set to <strong>Needs Clarification</strong>.
          </p>
          <textarea
            rows={4}
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Type your clarification request here..."
            className="kf-textarea"
            style={{ width:'100%', fontSize:13 }}
          />
        </div>
        <div className="rp-modal-footer">
          <button className="rp-ghost-btn" onClick={onClose}>Cancel</button>
          <button className="submit-report-btn" onClick={send} disabled={loading} style={{ '--btn-color': '#f59e0b' }}>
            {loading ? 'Sending…' : 'Send Request'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Report Table ───────────────────────────────────────
function ReportTable({ reports, loading, columns, onView, onDownload, onApprove, onClarify, onDelete, userRole }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="rp-table">
        <thead>
          <tr>
            {columns.map(c => <th key={c.key}>{c.label}</th>)}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={columns.length + 1} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>Loading…</td></tr>
          ) : reports.length === 0 ? (
            <tr><td colSpan={columns.length + 1} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No reports yet. Click the button above to submit one.</td></tr>
          ) : reports.map(row => (
            <tr key={row.id}>
              {columns.map(c => (
                <td key={c.key}>
                  {c.key === 'status' ? <Badge status={row[c.key]} />
                    : c.key === 'id' ? <span className="rp-id">{row[c.key]}</span>
                    : row[c.key] ?? '—'}
                </td>
              ))}
              <td>
                <div className="rp-actions">
                  <button className="rp-icon-btn view" title="View" onClick={() => onView(row)}><Eye size={14} /></button>
                  <button className="rp-icon-btn dl" title="Download" onClick={() => onDownload(row)}><Download size={14} /></button>
                  
                  {userRole === 'admin' && (
                    <>
                      {row.status !== 'APPROVED' && row.status !== 'approved' && (
                        <button className="rp-icon-btn approve" title="Approve" onClick={() => onApprove(row)} style={{ color: '#16a34a', borderColor: '#bbf7d0' }}>
                          <Check size={14} />
                        </button>
                      )}
                      <button className="rp-icon-btn clarify" title="Clarify" onClick={() => onClarify(row)} style={{ color: '#a16207', borderColor: '#fde68a' }}>
                        <MessageSquare size={14} />
                      </button>
                      <button className="rp-icon-btn delete" title="Delete" onClick={() => onDelete(row)} style={{ color: '#dc2626', borderColor: '#fecaca' }}>
                        <Trash2 size={14} />
                      </button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const KEY_LABELS = {
  // Zonal Report / Zone Info
  zoneName: "Name of Zone",
  zonalManager: "Zonal Manager",
  partnershipRemittance: "Total Partnership Remittance",
  remittancePurpose: "Purpose for each remittance",
  trumpetsBlown: "Trumpets Blown this week",
  greatShouts: "Great Shouts made this week",
  newPartners: "New partners recruited",
  testimoniesSubmitted: "Testimonies submitted to the Department",
  healingTranslations: "Total number of outreaches done this week",
  healingOutreaches: "Healing outreaches held this week",
  healingPicturesVideos: "Pictures and videos from Healing outreaches submitted",
  pastoralAttendanceDirector: "Zonal Pastor attendance in Executive Minister's meeting",
  managerAttendanceDirector: "Zonal Manager attendance in Executive Minister's meeting",
  managerAttendanceStrategy: "Zonal Manager attendance in strategy meeting",
  testimonyClarificationConcern: "Testimony, Clarification or Concern",
  submittedByEmail: "Submitted By Email",
  participationPrayWithMe: "Total number of participation pray with me",
  totalRegistrationHslhs: "Total Registration for HSLHS",
  heraldConference: "Brief report for Herald Conference",
  totalPartnershipRemittance: "Total Partnership Remittance",
  newPartnersRecruited: "New Partners Recruited",
  zonalPastorExecutiveMinistersMeeting: "Zonal Pastor attendance in Executive Minister's meeting",
  zonalManagerExecutiveMinistersMeeting: "Zonal Manager attendance in Executive Minister's meeting",
  zonalManagerStrategyMeeting: "Zonal Manager attendance in strategy meeting",
  zonalManagerStrategyMeetingAttendance: "Zonal Manager attendance in strategy meeting",
  regionName: "Region Name",
  submittedBy: "Submitted By",



  // Testimonials
  testimony: "Share a testimony",
  testimoniesCount: "Testimonies received this week",
  prayWithMeTestimonies: "Pray With Me Testimonies",
  translationTestimonies: "Translation Testimonies",
  partnershipTestimonies: "Partnership Testimonies",
  salvationTestimonies: "Salvation Testimonies",
  healingTestimonies: "Healing Testimonies",
  othersTestimonies: "Others Testimonies",

  // Partnership fields
  zonalPartnership: "Zonal Partnership",
  zonalPartnershipDetails: "Zonal Partnership Details",
  groupsPartnership: "Group Partnership",
  churchesPartnership: "Church Partnership",
  cellPartnership: "Cell Partnership",
  sponsoredTeenspiration: "Teenspiration (300 espees) Sponsored",
  sponsoredKidspiration: "Kidspiration (300 espees) Sponsored",


  // Magazine Report
  adultCopies: "Adult Copies Ordered",
  adultLanguages: "Adult Language(s)",
  teensCopies: "Teens Copies Ordered",
  teensLanguages: "Teens Language(s)",
  kidsCopies: "Kids Copies Ordered",
  kidsLanguages: "Kids Language(s)",
  ordered: "Total Ordered Copies",
  language: "Languages",
  received: "Total Received Copies",
  receiptStatus: "Receipt Status",
  reason: "Not received reason",
  sponsoredCopies: "Sponsored Copies",
  monthlyMinimumOrder: "Monthly Minimum Magazine Order",
  monthlyCopiesOrdered: "Cumulative number of copies sponsored for the month",
  praiseReports: "Praise Reports",
  datesReceived: "Dates Received",
  outreachLocations: "Outreach Locations",

  // Outreach Report
  date: "Date of Outreach",
  category: "Outreach Category",
  locations: "Outreach Location(s)",
  story: "Outreach Story",
  images: "Outreach Images Count",
  magazinesUsed: "Magazines Used",
  peopleInvolved: "People Involved",
  totalAttendance: "Total Attendance",
  soulsSaved: "Souls Saved",
  outreachTestimonies: "Testimonies from the outreach(es)",
  followUpPlan: "Further plans for soul retention",
};

// ── View Modal ─────────────────────────────────────────
function ViewModal({ report, onClose }) {
  if (!report) return null;
  const skip = ['id', 'media', 'mediaFiles', 'rawDate', 'formData'];
  const entries = Object.entries(report).filter(([k, v]) => !skip.includes(k) && v !== undefined && v !== null && v !== '');
  return (
    <div className="rp-modal-overlay" onClick={onClose}>
      <div className="rp-modal" onClick={e => e.stopPropagation()}>
        <div className="rp-modal-header">
          <div>
            <h3>{report.id}</h3>
            {report.status && <Badge status={report.status} />}
          </div>
          <button className="rp-remove-btn" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="rp-modal-body">
          {entries.map(([k, v]) => (
            <div className="rp-view-row" key={k}>
              <span className="rp-view-label">{KEY_LABELS[k] || k.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}</span>
              <span className="rp-view-value">{String(v)}</span>
            </div>
          ))}
          {report.media?.length > 0 && (
            <div className="rp-view-row rp-view-row-col">
              <span className="rp-view-label">Media ({report.media.length} files)</span>
              <div className="rp-media-grid" style={{ marginTop: 8 }}>
                {report.media.map((f, i) => (
                  <div className="rp-media-thumb" key={i}>
                    {f.url && f.type?.startsWith('video') ? <video src={f.url} className="rp-media-img" controls muted />
                      : f.url ? <img src={f.url} alt={f.name} className="rp-media-img" />
                      : <div className="rp-media-img rp-media-pdf-thumb">PDF</div>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="rp-modal-footer">
          <button className="rp-ghost-btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════
// POPUP WRAPPER — used by all forms
// ══════════════════════════════════════════════════════
function FormPopup({ title, eyebrow, icon, onClose, onSubmit, submitting, submitLabel, children }) {
  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-modal" onClick={e => e.stopPropagation()}>
        <div className="popup-header">
          <div className="popup-title-wrap">
            <span className="popup-eyebrow">{eyebrow}</span>
            <div className="popup-title">
              <span className="popup-title-icon">{icon}</span>
              <span>{title}</span>
            </div>
          </div>
          <button className="popup-close-btn" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="popup-scroll">
          {children}
        </div>
        <div className="popup-footer">
          <button className="popup-cancel-btn" onClick={onClose} disabled={submitting}>Cancel</button>
          <button className="popup-submit-btn" onClick={onSubmit} disabled={submitting}>
            {submitting ? (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: 'spin 0.8s linear infinite' }}>
                  <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                </svg>
                Submitting…
              </>
            ) : (
              <><Check size={15} /> {submitLabel}</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

const spinStyle = document.createElement('style');
spinStyle.textContent = '@keyframes spin { to { transform: rotate(360deg); } }';
document.head.appendChild(spinStyle);


// ══════════════════════════════════════════════════════
// ZONAL REPORT FORM — matched to kingsforms.online fields
// ══════════════════════════════════════════════════════
function ZonalReportForm({ onClose, onSubmit: parentSubmit }) {
  const { user } = useAuth();
  const EMPTY = {
    zoneName: '',
    zonalManager: '',
    partnershipRemittance: '',
    popMedia: [],
    popMediaFiles: [],
    remittancePurpose: '',
    trumpetsBlown: '',
    greatShouts: '',
    newPartners: '',
    testimoniesSubmitted: '',
    healingTranslations: '',
    healingOutreaches: '',
    healingPicturesVideos: '',
    pastoralAttendanceDirector: '',
    managerAttendanceDirector: '',
    managerAttendanceStrategy: '',
    testimonyClarificationConcern: '',
    media: [],
    mediaFiles: [],
    participationPrayWithMe: '',
    totalRegistrationHslhs: '',
    heraldConference: '',
  };
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const ATTENDANCE_OPTIONS = ['', 'Yes', 'No', 'Officially Excused'];

  const validate = () => {
    const e = {};
    if (!form.zoneName.trim()) e.zoneName = 'Required';
    if (!form.zonalManager.trim()) e.zonalManager = 'Required';
    if (!form.pastoralAttendanceDirector) e.pastoralAttendanceDirector = 'Required';
    if (!form.managerAttendanceDirector) e.managerAttendanceDirector = 'Required';
    if (!form.managerAttendanceStrategy) e.managerAttendanceStrategy = 'Required';
    return e;
  };

  const handleSubmit = async () => {
    const e = validate(); setErrors(e);
    if (Object.keys(e).length) return;
    setSubmitting(true);
    const today = new Date().toISOString().split('T')[0];
    const payload = {
      // Fields matching CreateReportRequest / zone_weekly_reports table
      submittedBy:                  form.zonalManager,
      submitterEmail:               user?.email, 
      submittedDate:                today,
      submittedTime:                new Date().toTimeString().split(' ')[0],
      weekStartDate:                today,
      zoneName:                     form.zoneName,
      zonalManager:                 form.zonalManager,
      zonalPastorExecutiveMinistersMeeting:  form.pastoralAttendanceDirector,
      zonalManagerExecutiveMinistersMeeting: form.managerAttendanceDirector,
      zonalManagerStrategyMeeting:  form.managerAttendanceStrategy,
      testimonyClarificationConcern: form.testimonyClarificationConcern,
      popMediaUrl:                  null,
      regionName:                   user?.region || 'Global',
      participationPrayWithMe:      form.participationPrayWithMe,
      totalRegistrationHslhs:       Number(form.totalRegistrationHslhs) || 0,
      heraldConference:             form.heraldConference,
    };
    try {
      await fetch(`${window.ENV?.API_PATH || process.env.REACT_APP_API_URL || 'http://65.1.248.88:8081'}/api/reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (err) {
      console.error('Failed to save zonal report to DB', err);
    }
    parentSubmit({
      zone: form.zoneName,
      submittedBy: form.zonalManager,
      partners: form.newPartners,
      remittance: form.partnershipRemittance,
      status: 'submitted',
      media: form.media,
      rawDate: today,
    });
    setSubmitting(false);
  };

  return (
    <FormPopup title="Zonal Weekly Report" eyebrow="KingsForms · Zonal Report" icon="🏛️"
      onClose={onClose} onSubmit={handleSubmit} submitting={submitting} submitLabel="Submit Zonal Report">

      {/* Zone Info */}
      <div className="popup-section-head">🏛️ Zone Information</div>
      <div className="popup-fields">
        <Field label="Name of Zone" required error={errors.zoneName}>
          <input className={`kf-input${errors.zoneName ? ' kf-input-err' : ''}`} placeholder="e.g. Zone A"
            value={form.zoneName} onChange={e => set('zoneName', e.target.value)} />
        </Field>
        <Field label="Zonal Manager" required error={errors.zonalManager}>
          <input className={`kf-input${errors.zonalManager ? ' kf-input-err' : ''}`} placeholder="Full name"
            value={form.zonalManager} onChange={e => set('zonalManager', e.target.value)} />
        </Field>
      </div>

      {/* Attendance & Sponsorship */}
      <div className="popup-section-head">📅 Meetings & Sponsorship</div>
      <div className="popup-fields">
        <Field label="Zonal Pastor's attendance in the Executive Minister's weekly meeting?" required error={errors.pastoralAttendanceDirector}>
          <div className="kf-select-wrap">
            <select className={`kf-select${errors.pastoralAttendanceDirector ? ' kf-input-err' : ''}`} value={form.pastoralAttendanceDirector} onChange={e => set('pastoralAttendanceDirector', e.target.value)}>
              <option value="">Please select</option>
              {ATTENDANCE_OPTIONS.filter(o => o).map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
            <ChevronDown size={13} className="kf-select-chevron" />
          </div>
        </Field>
        <Field label="Zonal Manager's attendance in the Executive Minister's weekly meeting?" required error={errors.managerAttendanceDirector}>
          <div className="kf-select-wrap">
            <select className={`kf-select${errors.managerAttendanceDirector ? ' kf-input-err' : ''}`} value={form.managerAttendanceDirector} onChange={e => set('managerAttendanceDirector', e.target.value)}>
              <option value="">Please select</option>
              {ATTENDANCE_OPTIONS.filter(o => o).map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
            <ChevronDown size={13} className="kf-select-chevron" />
          </div>
        </Field>
        <Field label="Zonal Manager's attendance in the weekly Managers strategy meeting?" required error={errors.managerAttendanceStrategy}>
          <div className="kf-select-wrap">
            <select className={`kf-select${errors.managerAttendanceStrategy ? ' kf-input-err' : ''}`} value={form.managerAttendanceStrategy} onChange={e => set('managerAttendanceStrategy', e.target.value)}>
              <option value="">Please select</option>
              {ATTENDANCE_OPTIONS.filter(o => o).map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
            <ChevronDown size={13} className="kf-select-chevron" />
          </div>
        </Field>
        <Field label="Any Testimony, Clarification or Concern?">
          <textarea className="kf-textarea" rows={3} placeholder="Provide details..."
            value={form.testimonyClarificationConcern} onChange={e => set('testimonyClarificationConcern', e.target.value)} />
        </Field>
      </div>

      {/* Pray With Me & HSLHS & Herald Conference */}
      <div className="popup-section-head">📣 Programs & Campaigns</div>
      <div className="popup-fields">
        <Field label="Total number of participation pray with me">
          <textarea className="kf-textarea" rows={2} placeholder="Enter details..."
            value={form.participationPrayWithMe} onChange={e => set('participationPrayWithMe', e.target.value)} />
        </Field>
        <Field label="Total Registration for HSLHS">
          <input className="kf-input" type="number" min="0" placeholder="0"
            value={form.totalRegistrationHslhs} onChange={e => set('totalRegistrationHslhs', e.target.value)} />
        </Field>
        <Field label="Brief report for Herald Conference">
          <input className="kf-input" placeholder="Enter status/details..."
            value={form.heraldConference} onChange={e => set('heraldConference', e.target.value)} />
        </Field>
      </div>

      {/* Media */}
      <div className="popup-section-head">📎 Supporting Media</div>
      <div className="popup-fields">
        <MediaUploader files={form.media}
          onAdd={files => {
            const prev = files.map(f => ({ name: f.name, type: f.type, url: (f.type.startsWith('image') || f.type.startsWith('video')) ? URL.createObjectURL(f) : null, size: f.size }));
            set('media', [...form.media, ...prev]); set('mediaFiles', [...form.mediaFiles, ...files]);
          }}
          onRemove={i => { set('media', form.media.filter((_,j)=>j!==i)); set('mediaFiles', form.mediaFiles.filter((_,j)=>j!==i)); }}
        />
      </div>
    </FormPopup>
  );
}


// ══════════════════════════════════════════════════════
// PARTNERSHIP REPORT FORM
// ══════════════════════════════════════════════════════


const BLAAAST_CATEGORIES = [
  { key: 'joyfulSound',      label: 'Make a Joyful Sound',        amount: '30 Espees' },
  { key: 'raiseBanner',      label: 'Raise a Banner',             amount: '300 Espees' },
  { key: 'takeShield',       label: 'Take Up the Shield',         amount: '1,000 Espees' },
  { key: 'greatShout',       label: 'Make a Great Shout',         amount: '2,500 Espees' },
  { key: 'advanceTroop',     label: 'Advance Against a Troop',    amount: '5,000 Espees' },
  { key: 'blowTrumpet',      label: 'Blow A Trumpet',             amount: '10,000 Espees' },
  { key: 'liftHorn',         label: 'Lift the Horn',              amount: '100,000 Espees' },
  { key: 'blastVictory',     label: 'Blast of Victory (Gold Sponsorship)', amount: '250,000 Espees' },
];

function PartnershipForm({ onClose, onSubmit: parentSubmit }) {
  const [form, setForm] = useState({
    zonalPartnership: '',
    zonalPartnershipDetails: '',
    groupsPartnership: '',
    churchesPartnership: '',
    cellPartnership: '',
    blaaast: {},
    notes: '',
    others: '',
    groupPastorsMilestones: '',
    sponsoredTeenspiration: '',
    sponsoredKidspiration: '',
    popMedia: [],
    popMediaFiles: [],
    trumpetsBlown: '',
    greatShouts: '',
    testimoniesSubmitted: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const setBlaaast = (key, val) => {
    const int = val === '' ? '' : String(Math.max(0, Math.floor(Number(val))));
    setForm(p => ({ ...p, blaaast: { ...p.blaaast, [key]: int } }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 500));
    
    const finalNotes = form.others || '';

    parentSubmit({
      zonalPartnership: form.zonalPartnership,
      zonalPartnershipDetails: form.zonalPartnershipDetails,
      groupsPartnership: form.groupsPartnership,
      churchesPartnership: form.churchesPartnership,
      cellPartnership: form.cellPartnership,
      totalRemittance: Number(form.totalRemittance) || 0,
      healingCrusadeSponsorship: 0.00,
      newPartnersRecruited: Number(form.newPartnersRecruited) || 0,
      remittancePurpose: form.remittancePurpose,
      trumpetsBlown: Number(form.trumpetsBlown) || 0,
      greatShouts: Number(form.greatShouts) || 0,
      testimoniesSubmitted: Number(form.testimoniesSubmitted) || 0,
      notes: finalNotes,
      status: 'submitted',
      rawDate: new Date().toISOString().split('T')[0],
      groupPastorsMilestones: form.groupPastorsMilestones,
      sponsoredTeenspiration: form.sponsoredTeenspiration,
      sponsoredKidspiration: form.sponsoredKidspiration,
      popMedia: form.popMedia
    });
    setSubmitting(false);
  };

  return (
    <FormPopup title="Partnership Remittance Report" eyebrow="KingsForms · Partnership" icon="🤝"
      onClose={onClose} onSubmit={handleSubmit} submitting={submitting} submitLabel="Submit Partnership Report">

      <div className="popup-section-head">💼 Partnership Breakdown (Espees)</div>
      <div className="popup-fields">
        <Field label="Total Partnership Remittance for this week">
          <input className="kf-input" type="number" min="0" placeholder="0"
            value={form.totalRemittance} onChange={e => setForm(p => ({ ...p, totalRemittance: e.target.value }))} />
        </Field>
        
        <Field label="State purpose for each remittance (e.g. HSLHS, Healing, DOME, etc.)">
          <textarea className="kf-textarea" rows={2} placeholder="Provide details..."
            value={form.remittancePurpose} onChange={e => setForm(p => ({ ...p, remittancePurpose: e.target.value }))} />
        </Field>

        <Field label="Proof of Payment (POP)" hint="Upload POP for the transactions">
          <MediaUploader files={form.popMedia}
            onAdd={files => {
              const prev = files.map(f => ({ name: f.name, type: f.type, url: (f.type.startsWith('image') || f.type.startsWith('video')) ? URL.createObjectURL(f) : null, size: f.size }));
              setForm(p => ({ ...p, popMedia: [...p.popMedia, ...prev], popMediaFiles: [...p.popMediaFiles, ...files] }));
            }}
            onRemove={i => { setForm(p => ({ ...p, popMedia: p.popMedia.filter((_,j)=>j!==i), popMediaFiles: p.popMediaFiles.filter((_,j)=>j!==i) })); }}
            label="Upload POP"
          />
        </Field>

        <Field label="How many Trumpets were blown this week?" hint="Each Zone has a target of 1000 trumpets">
          <input className="kf-input" type="number" min="0" placeholder="0"
            value={form.trumpetsBlown} onChange={e => setForm(p => ({ ...p, trumpetsBlown: e.target.value }))} />
        </Field>

        <Field label="How many great shouts were made this week?">
          <input className="kf-input" type="number" min="0" placeholder="0"
            value={form.greatShouts} onChange={e => setForm(p => ({ ...p, greatShouts: e.target.value }))} />
        </Field>

        <Field label="How many Testimonies were submitted to the Department?">
          <input className="kf-input" type="number" min="0" placeholder="0"
            value={form.testimoniesSubmitted} onChange={e => setForm(p => ({ ...p, testimoniesSubmitted: e.target.value }))} />
        </Field>

        <Field label="How many new partners were recruited?">
          <input className="kf-input" type="number" min="0" placeholder="0"
            value={form.newPartnersRecruited} onChange={e => setForm(p => ({ ...p, newPartnersRecruited: e.target.value }))} />
        </Field>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem', alignItems: 'start' }}>
          <Field label="Zonal Partnership for this week">
            <input className="kf-input" type="text" placeholder="Enter zonal partnership (e.g. 5000 espees)..."
              value={form.zonalPartnership} onChange={e => setForm(p => ({ ...p, zonalPartnership: e.target.value }))} />
          </Field>
          <Field label="Zonal Partnership Details (kindly state how much was given for each arm eg hslhs,httnm,crusade etc )">
            <textarea className="kf-textarea" rows={1} placeholder="Enter details..."
              value={form.zonalPartnershipDetails} onChange={e => setForm(p => ({ ...p, zonalPartnershipDetails: e.target.value }))} />
          </Field>
        </div>
        
        <Field label="Group Partnership (state how much was remitted by each group)">
          <input className="kf-input" type="text" placeholder="Enter group partnership..."
            value={form.groupsPartnership} onChange={e => setForm(p => ({ ...p, groupsPartnership: e.target.value }))} />
        </Field>
        
        <Field label="Church Partnership (State how much was remitted by each Church)">
          <input className="kf-input" type="text" placeholder="Enter church partnership..."
            value={form.churchesPartnership} onChange={e => setForm(p => ({ ...p, churchesPartnership: e.target.value }))} />
        </Field>
        
        <Field label="Cell Partnership (State how much was remitted by each Cell)">
          <input className="kf-input" type="text" placeholder="Enter cell partnership..."
            value={form.cellPartnership} onChange={e => setForm(p => ({ ...p, cellPartnership: e.target.value }))} />
        </Field>
      </div>

      <div className="popup-section-head">🎺 BLAAAST Partnership Categories</div>
      <div className="popup-fields">
        <p className="kf-section-note">How many partners gave in each of these BLAAAST categories this week?</p>
        <div className="blaaast-grid">
          {BLAAAST_CATEGORIES.map(cat => (
            <div key={cat.key} className="blaaast-row">
              <div className="blaaast-info">
                <span className="blaaast-label">{cat.label}</span>
                <span className="blaaast-amount">{cat.amount}</span>
              </div>
              <input
                className="kf-input blaaast-input"
                type="number"
                min="0"
                step="1"
                placeholder="0"
                value={form.blaaast[cat.key] || ''}
                onChange={e => setBlaaast(cat.key, e.target.value)}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="popup-section-head">🏆 Milestones & Campaigns</div>
      <div className="popup-fields">
        <Field label="Names of group Pastors that have advanced in the BLAAAST Milestones (please state name and new milestones)">
          <textarea className="kf-textarea" rows={2} placeholder="Enter names..."
            value={form.groupPastorsMilestones} onChange={e => setForm(p => ({ ...p, groupPastorsMilestones: e.target.value }))} />
        </Field>
        <Field label="Pastors and members that have sponsored Teenspiration (300 espees) this week">
          <textarea className="kf-textarea" rows={2} placeholder="Enter names..."
            value={form.sponsoredTeenspiration} onChange={e => setForm(p => ({ ...p, sponsoredTeenspiration: e.target.value }))} />
        </Field>
        <Field label="Pastors and members that have sponsored Kidspiration (300 espees) this week">
          <textarea className="kf-textarea" rows={2} placeholder="Enter names..."
            value={form.sponsoredKidspiration} onChange={e => setForm(p => ({ ...p, sponsoredKidspiration: e.target.value }))} />
        </Field>
      </div>

      <div className="popup-fields">
        <Field label="Additional notes">
          <textarea className="kf-textarea" rows={2} placeholder="Enter other remarks or comments..."
            value={form.others} onChange={e => setForm(p => ({ ...p, others: e.target.value }))} />
        </Field>
      </div>
    </FormPopup>
  );
}


// ══════════════════════════════════════════════════════
// TESTIMONIALS FORM
// ══════════════════════════════════════════════════════
const TESTIMONY_CATEGORIES = [
  { key: 'Healing Streams', label: 'Healing Streams' },
  { key: 'Partnership', label: 'Partnership' },
  { key: 'Healing to the nations Magazines', label: 'Healing to the nations Magazines' },
  { key: 'Prayer Clouds', label: 'Prayer Clouds' },
  { key: 'Crusades', label: 'Crusades' },
  { key: 'Pray with me', label: 'Pray with me' },
  { key: 'Heralds', label: 'Heralds' },
  { key: 'Others', label: 'Others' }
];

function TestimonialsForm({ onClose, onSubmit: parentSubmit }) {
  const [category, setCategory] = useState('');
  const [documents, setDocuments] = useState([]);
  const [videos, setVideos] = useState([]);
  const [beforeImages, setBeforeImages] = useState([]);
  const [afterImages, setAfterImages] = useState([]);
  const [memberName, setMemberName] = useState('');
  const [categoryDetails, setCategoryDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleAddFiles = (setter) => (files) => {
    const prev = files.map(f => ({
      name: f.name, type: f.type,
      url: (f.type.startsWith('image') || f.type.startsWith('video')) ? URL.createObjectURL(f) : null,
      size: f.size,
    }));
    setter(p => [...p, ...prev]);
  };

  const handleRemoveFile = (setter) => (idx) => {
    setter(p => p.filter((_, i) => i !== idx));
  };

  const formatTestimonyContent = () => {
    let parts = [];
    parts.push(`Category: ${category}`);
    if (memberName.trim()) {
      parts.push(`Member Name: ${memberName}`);
    }
    if (categoryDetails.trim()) {
      parts.push(`Testimony Details:\n${categoryDetails}`);
    }

    const filesList = [];
    if (documents.length > 0) {
      filesList.push(`Documents (${documents.length}): ${documents.map(f => f.name).join(', ')}`);
    }
    if (videos.length > 0) {
      filesList.push(`Videos (${videos.length}): ${videos.map(f => f.name).join(', ')}`);
    }
    if (beforeImages.length > 0) {
      filesList.push(`Before Images (${beforeImages.length}): ${beforeImages.map(f => f.name).join(', ')}`);
    }
    if (afterImages.length > 0) {
      filesList.push(`After Images (${afterImages.length}): ${afterImages.map(f => f.name).join(', ')}`);
    }
    
    if (filesList.length > 0) {
      parts.push(`Attachments:\n- ` + filesList.join('\n- '));
    }
    
    return parts.join('\n\n');
  };

  const handleSubmit = async () => {
    if (!category) {
      setError('Please select a category.');
      return;
    }
    setError('');
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 500));

    parentSubmit({
      testimony: '(Single testimony submitted)',
      testimoniesCount: 1, // Only one testimony
      memberName: memberName,
      categoryDetails: categoryDetails,
      beforeImages: beforeImages.length,
      afterImages: afterImages.length,
      documents: documents.length + videos.length,
      status: 'PENDING',
      rawDate: new Date().toISOString().split('T')[0],
      // We send it under the "othersTestimonies" field since it's dynamic now, or we can map it based on category. 
      // The backend saves these as text fields. We'll map it safely to "othersTestimonies" or just let the backend handle it.
      // Wait, let's just map it to the closest match or others.
      prayWithMeTestimonies: category === 'Pray with me' ? formatTestimonyContent() : '',
      translationTestimonies: category === 'Heralds' ? formatTestimonyContent() : '',
      partnershipTestimonies: category === 'Partnership' ? formatTestimonyContent() : '',
      salvationTestimonies: category === 'Crusades' ? formatTestimonyContent() : '',
      healingTestimonies: (category === 'Healing Streams' || category === 'Healing to the nations Magazines') ? formatTestimonyContent() : '',
      othersTestimonies: (category === 'Others' || category === 'Prayer Clouds') ? formatTestimonyContent() : '',
    });
    setSubmitting(false);
  };

  return (
    <FormPopup title="Submit a Testimony" eyebrow="KingsForms · Testimonials" icon="✍️"
      onClose={onClose} onSubmit={handleSubmit} submitting={submitting} submitLabel="Submit Testimony">

      {/* Category Dropdown */}
      <div className="popup-section-head">🏷️ Category</div>
      <div className="popup-fields">
        <Field label="Select a category" error={error}>
          <select className="kf-input" value={category} onChange={e => setCategory(e.target.value)}>
            <option value="">Select a category</option>
            {TESTIMONY_CATEGORIES.map(cat => (
              <option key={cat.key} value={cat.key}>{cat.label}</option>
            ))}
          </select>
        </Field>
      </div>

      {category && (
        <div style={{ padding: '20px 32px' }}>
          <div className="popup-fields" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            <Field label="Member Name" hint="Who does this testimony belong to?">
              <input className="kf-input" type="text" placeholder="e.g. Sister Anne"
                value={memberName} onChange={e => setMemberName(e.target.value)} />
            </Field>

            <Field label={`${category} Details (please write the entire testimony here)`}>
              <textarea className="kf-textarea" rows={6} placeholder={`Write ${category} testimony here...`}
                value={categoryDetails} onChange={e => setCategoryDetails(e.target.value)} />
            </Field>

            {/* Uploads */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <Field label="Upload PDF or Word files">
                <MediaUploader
                  files={documents}
                  onAdd={handleAddFiles(setDocuments)}
                  onRemove={handleRemoveFile(setDocuments)}
                  label="Upload PDF / Word"
                  accept=".pdf,.doc,.docx"
                />
              </Field>

              <Field label="Upload Video testimony">
                <MediaUploader
                  files={videos}
                  onAdd={handleAddFiles(setVideos)}
                  onRemove={handleRemoveFile(setVideos)}
                  label="Upload Video"
                  accept="video/*"
                />
              </Field>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '8px' }}>
              <Field label="Before Images">
                <MediaUploader
                  files={beforeImages}
                  onAdd={handleAddFiles(setBeforeImages)}
                  onRemove={handleRemoveFile(setBeforeImages)}
                  label="Upload Before Images"
                  accept="image/*"
                />
              </Field>

              <Field label="After Images">
                <MediaUploader
                  files={afterImages}
                  onAdd={handleAddFiles(setAfterImages)}
                  onRemove={handleRemoveFile(setAfterImages)}
                  label="Upload After Images"
                  accept="image/*"
                />
              </Field>
            </div>
          </div>
        </div>
      )}
    </FormPopup>
  );
}


// ══════════════════════════════════════════════════════
// MAGAZINE FORM
// ══════════════════════════════════════════════════════


function MagazineForm({ onClose, onSubmit: parentSubmit }) {
  const [form, setForm] = useState({
    adultCopies: '',
    adultLanguages: '',
    adultLanguagesOther: '',
    teensCopies: '',
    teensLanguages: '',
    teensLanguagesOther: '',
    kidsCopies: '',
    kidsLanguages: '',
    kidsLanguagesOther: '',
    receivedCopies: '',
    notReceivedReason: '',
    challengesFaced: '',
    praiseReports: '',
    monthlyMinimumOrder: '',
    monthlyMinimumOrderAmountPaid: '',
    monthlyCopiesOrdered: '',
    cumulativeSponsoredAmountPaid: '',
    proofOfPaymentFiles: [],
    datesReceived: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const e = {};
    const totalOrdered = (Number(form.adultCopies) || 0) + (Number(form.teensCopies) || 0) + (Number(form.kidsCopies) || 0);
    
    if (totalOrdered <= 0) {
      e.adultCopies = 'At least one magazine type must have copies ordered';
    }
    if (Number(form.adultCopies) > 0 && !form.adultLanguages.trim()) {
      e.adultLanguages = 'Required when copies are specified';
    }
    if (Number(form.teensCopies) > 0 && !form.teensLanguages.trim()) {
      e.teensLanguages = 'Required when copies are specified';
    }
    if (Number(form.kidsCopies) > 0 && !form.kidsLanguages.trim()) {
      e.kidsLanguages = 'Required when copies are specified';
    }
    
    if (!String(form.receivedCopies).trim()) e.receivedCopies = 'Required';
    if (Number(form.receivedCopies) < totalOrdered && !form.notReceivedReason.trim()) {
      e.notReceivedReason = 'Please provide a reason';
    }
    return e;
  };

  const handleSubmit = async () => {
    const e = validate(); setErrors(e);
    if (Object.keys(e).length) return;
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 500));
    
    const totalOrdered = (Number(form.adultCopies) || 0) + (Number(form.teensCopies) || 0) + (Number(form.kidsCopies) || 0);
    const getLang = (lang, other) => lang === 'Other' ? (other || 'Other') : lang;
    const combinedLanguages = [
      form.adultLanguages && `Adult: ${getLang(form.adultLanguages, form.adultLanguagesOther)}`,
      form.teensLanguages && `Teens: ${getLang(form.teensLanguages, form.teensLanguagesOther)}`,
      form.kidsLanguages && `Kids: ${getLang(form.kidsLanguages, form.kidsLanguagesOther)}`
    ].filter(Boolean).join('; ');

    parentSubmit({
      adultCopies:          Number(form.adultCopies) || 0,
      adultLanguages:       form.adultLanguages,
      teensCopies:          Number(form.teensCopies) || 0,
      teensLanguages:       form.teensLanguages,
      kidsCopies:           Number(form.kidsCopies) || 0,
      kidsLanguages:        form.kidsLanguages,
      ordered:              totalOrdered,
      language:             combinedLanguages,
      received:             Number(form.receivedCopies) || 0,
      receiptStatus:        Number(form.receivedCopies) === 0 ? 'No' : (Number(form.receivedCopies) < totalOrdered ? 'Partial' : 'Yes'),
      reason:               form.notReceivedReason,
      challengesFaced:      form.challengesFaced,
      isAdult:              (Number(form.adultCopies) || 0) > 0,
      isTeevolution:        (Number(form.teensCopies) || 0) > 0,
      isKidsMagazine:       (Number(form.kidsCopies) || 0) > 0,
      status:               'PENDING',
      rawDate:              new Date().toISOString().split('T')[0],
      monthlyMinimumOrder:  Number(form.monthlyMinimumOrder) || 0,
      monthlyMinimumOrderAmountPaid: Number(form.monthlyMinimumOrderAmountPaid) || 0,
      monthlyCopiesOrdered: Number(form.monthlyCopiesOrdered) || 0,
      cumulativeSponsoredAmountPaid: Number(form.cumulativeSponsoredAmountPaid) || 0,
      proofOfPayment:       form.proofOfPaymentFiles.length,
      praiseReports:        form.praiseReports,
      datesReceived:        form.datesReceived,
    });
    setSubmitting(false);
  };

  const totalOrdered = (Number(form.adultCopies) || 0) + (Number(form.teensCopies) || 0) + (Number(form.kidsCopies) || 0);

  return (
    <FormPopup title="Magazine Order Report" eyebrow="KingsForms · Magazine" icon="📚"
      onClose={onClose} onSubmit={handleSubmit} submitting={submitting} submitLabel="Submit Magazine Report">

      {/* Magazine Types */}
      <div className="popup-section-head">📚 Please state number of magazines ordered for each type (adult, teens, kids)</div>
      <div className="popup-fields">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <Field label="Adult Copies" error={errors.adultCopies}>
            <input className="kf-input" type="number" min="0" placeholder="0"
              value={form.adultCopies} onChange={e => setForm(p => ({ ...p, adultCopies: e.target.value }))} />
          </Field>
          <Field label="Adult Language(s)" error={errors.adultLanguages}>
            <div className="kf-select-wrap">
              <select className="kf-select" value={form.adultLanguages} onChange={e => setForm(p => ({ ...p, adultLanguages: e.target.value }))}>
                <option value="">Select Language</option>
                <option value="English">English</option><option value="French">French</option><option value="Spanish">Spanish</option><option value="Portuguese">Portuguese</option>
                <option value="German">German</option><option value="Italian">Italian</option><option value="Russian">Russian</option><option value="Chinese">Chinese</option>
                <option value="Japanese">Japanese</option><option value="Korean">Korean</option><option value="Arabic">Arabic</option><option value="Hindi">Hindi</option>
                <option value="Bengali">Bengali</option><option value="Urdu">Urdu</option><option value="Indonesian">Indonesian</option><option value="Swahili">Swahili</option>
                <option value="Dutch">Dutch</option><option value="Turkish">Turkish</option><option value="Vietnamese">Vietnamese</option><option value="Polish">Polish</option>
                <option value="Yoruba">Yoruba</option><option value="Igbo">Igbo</option><option value="Hausa">Hausa</option><option value="Other">Other</option>
              </select>
              <ChevronDown className="kf-select-chevron" size={16} />
            </div>
            {form.adultLanguages === 'Other' && (
              <input className="kf-input" style={{ marginTop: '0.5rem' }} placeholder="Specify language..."
                value={form.adultLanguagesOther} onChange={e => setForm(p => ({ ...p, adultLanguagesOther: e.target.value }))} />
            )}
          </Field>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
          <Field label="Teens Copies" error={errors.teensCopies}>
            <input className="kf-input" type="number" min="0" placeholder="0"
              value={form.teensCopies} onChange={e => setForm(p => ({ ...p, teensCopies: e.target.value }))} />
          </Field>
          <Field label="Teens Language(s)" error={errors.teensLanguages}>
            <div className="kf-select-wrap">
              <select className="kf-select" value={form.teensLanguages} onChange={e => setForm(p => ({ ...p, teensLanguages: e.target.value }))}>
                <option value="">Select Language</option>
                <option value="English">English</option><option value="French">French</option><option value="Spanish">Spanish</option><option value="Portuguese">Portuguese</option>
                <option value="German">German</option><option value="Italian">Italian</option><option value="Russian">Russian</option><option value="Chinese">Chinese</option>
                <option value="Japanese">Japanese</option><option value="Korean">Korean</option><option value="Arabic">Arabic</option><option value="Hindi">Hindi</option>
                <option value="Bengali">Bengali</option><option value="Urdu">Urdu</option><option value="Indonesian">Indonesian</option><option value="Swahili">Swahili</option>
                <option value="Dutch">Dutch</option><option value="Turkish">Turkish</option><option value="Vietnamese">Vietnamese</option><option value="Polish">Polish</option>
                <option value="Yoruba">Yoruba</option><option value="Igbo">Igbo</option><option value="Hausa">Hausa</option><option value="Other">Other</option>
              </select>
              <ChevronDown className="kf-select-chevron" size={16} />
            </div>
            {form.teensLanguages === 'Other' && (
              <input className="kf-input" style={{ marginTop: '0.5rem' }} placeholder="Specify language..."
                value={form.teensLanguagesOther} onChange={e => setForm(p => ({ ...p, teensLanguagesOther: e.target.value }))} />
            )}
          </Field>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
          <Field label="Kids Copies" error={errors.kidsCopies}>
            <input className="kf-input" type="number" min="0" placeholder="0"
              value={form.kidsCopies} onChange={e => setForm(p => ({ ...p, kidsCopies: e.target.value }))} />
          </Field>
          <Field label="Kids Language(s)" error={errors.kidsLanguages}>
            <div className="kf-select-wrap">
              <select className="kf-select" value={form.kidsLanguages} onChange={e => setForm(p => ({ ...p, kidsLanguages: e.target.value }))}>
                <option value="">Select Language</option>
                <option value="English">English</option><option value="French">French</option><option value="Spanish">Spanish</option><option value="Portuguese">Portuguese</option>
                <option value="German">German</option><option value="Italian">Italian</option><option value="Russian">Russian</option><option value="Chinese">Chinese</option>
                <option value="Japanese">Japanese</option><option value="Korean">Korean</option><option value="Arabic">Arabic</option><option value="Hindi">Hindi</option>
                <option value="Bengali">Bengali</option><option value="Urdu">Urdu</option><option value="Indonesian">Indonesian</option><option value="Swahili">Swahili</option>
                <option value="Dutch">Dutch</option><option value="Turkish">Turkish</option><option value="Vietnamese">Vietnamese</option><option value="Polish">Polish</option>
                <option value="Yoruba">Yoruba</option><option value="Igbo">Igbo</option><option value="Hausa">Hausa</option><option value="Other">Other</option>
              </select>
              <ChevronDown className="kf-select-chevron" size={16} />
            </div>
            {form.kidsLanguages === 'Other' && (
              <input className="kf-input" style={{ marginTop: '0.5rem' }} placeholder="Specify language..."
                value={form.kidsLanguagesOther} onChange={e => setForm(p => ({ ...p, kidsLanguagesOther: e.target.value }))} />
            )}
          </Field>
        </div>
      </div>

      {/* Receipt Status */}
      <div className="popup-section-head">📬 Receipt Status</div>
      <div className="popup-fields">
        <Field label="Number of copies received" required error={errors.receivedCopies}>
          <input className={`kf-input${errors.receivedCopies ? ' kf-input-err' : ''}`} type="number" min="0" placeholder="0"
            value={form.receivedCopies} onChange={e => setForm(p => ({ ...p, receivedCopies: e.target.value }))} />
        </Field>
        <Field label="Date(s) received">
          <input className="kf-input" type="date"
            value={form.datesReceived} onChange={e => setForm(p => ({ ...p, datesReceived: e.target.value }))} />
        </Field>
        {Number(form.receivedCopies) < totalOrdered && (
          <Field label="If not received — provide reason" required error={errors.notReceivedReason}>
            <textarea className={`kf-textarea${errors.notReceivedReason ? ' kf-input-err' : ''}`} rows={3}
              placeholder="Explain why copies were not received…"
              value={form.notReceivedReason} onChange={e => setForm(p => ({ ...p, notReceivedReason: e.target.value }))} />
          </Field>
        )}
        <Field label="State challenges faced or complains">
          <textarea className="kf-textarea" rows={3} placeholder="Describe any challenges faced..."
            value={form.challengesFaced} onChange={e => setForm(p => ({ ...p, challengesFaced: e.target.value }))} />
        </Field>
      </div>

      {/* Monthly Ordering */}
      <div className="popup-section-head">📦 Monthly ordered (local distributions)</div>
      <div className="popup-fields">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <Field label="Monthly Minimum Magazine Order">
            <input className="kf-input" type="number" min="0" placeholder="0"
              value={form.monthlyMinimumOrder} onChange={e => setForm(p => ({ ...p, monthlyMinimumOrder: e.target.value }))} />
          </Field>
          <Field label="Amount Paid (Minimum Order)">
            <input className="kf-input" type="number" min="0" placeholder="0.00" step="0.01"
              value={form.monthlyMinimumOrderAmountPaid} onChange={e => setForm(p => ({ ...p, monthlyMinimumOrderAmountPaid: e.target.value }))} />
          </Field>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
          <Field label="Cumulative number of copies sponsored for the month (please update the total number of copies the zone has sponsored for the month)">
            <input className="kf-input" type="number" min="0" placeholder="0"
              value={form.monthlyCopiesOrdered} onChange={e => setForm(p => ({ ...p, monthlyCopiesOrdered: e.target.value }))} />
          </Field>
          <Field label="Amount Paid (Cumulative)">
            <input className="kf-input" type="number" min="0" placeholder="0.00" step="0.01"
              value={form.cumulativeSponsoredAmountPaid} onChange={e => setForm(p => ({ ...p, cumulativeSponsoredAmountPaid: e.target.value }))} />
          </Field>
        </div>
      </div>

      {/* POP */}
      <div className="popup-section-head">🧾 Proof of Payment (POP)</div>
      <div className="popup-fields">
        <MediaUploader
          files={form.proofOfPaymentFiles}
          onAdd={files => {
            const prev = files.map(f => ({ name: f.name, type: f.type, url: (f.type.startsWith('image') || f.type.startsWith('video')) ? URL.createObjectURL(f) : null, size: f.size }));
            setForm(p => ({ ...p, proofOfPaymentFiles: [...p.proofOfPaymentFiles, ...prev] }));
          }}
          onRemove={i => setForm(p => ({ ...p, proofOfPaymentFiles: p.proofOfPaymentFiles.filter((_,j) => j !== i) }))}
          label="Upload Proof of Payment (POP)"
          accept="image/*,.pdf,.doc,.docx"
        />
      </div>

      {/* Praise Reports */}
      <div className="popup-section-head">📝 Praise Reports</div>
      <div className="popup-fields">
        <Field label="Praise reports from outreaches this week">
          <textarea className="kf-textarea" rows={2} placeholder="Share praise reports from the magazine distribution…"
            value={form.praiseReports} onChange={e => setForm(p => ({ ...p, praiseReports: e.target.value }))} />
        </Field>
      </div>
    </FormPopup>
  );
}


// ══════════════════════════════════════════════════════
// OUTREACH REPORT FORM
// ══════════════════════════════════════════════════════
const OUTREACH_CATEGORIES = ['Healing', 'Soul-winning', 'Prison Outreach', 'School Outreach', 'Market Outreach', 'Hospital Outreach', 'Other'];

function OutreachForm({ onClose, onSubmit: parentSubmit }) {
  const [form, setForm] = useState({
    date: '',
    category: '',
    customCategory: '',
    locations: '',
    story: '',
    images: [],
    magazinesUsed: '',
    peopleInvolved: '',
    totalAttendance: '',
    soulsSaved: '',
    outreachTestimonies: '',
    followUpPlan: '',
    testimonyFiles: [],
    healingTranslationsAchieved: '',
    healingOutreachesHeld: '',
    healingOutreachLocations: '',
    healingMediaSubmitted: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    const e = {};
    if (!form.date) e.date = 'Required';
    if (!form.category) e.category = 'Please select a category';
    if (!form.locations.trim()) e.locations = 'Required';
    if (!form.story.trim()) e.story = 'Required';
    setErrors(e);
    if (Object.keys(e).length) return;
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 500));
    // Payload matches outreach_reports table columns
    parentSubmit({
      submittedDate: form.date,
      category:      form.category === 'Other' ? form.customCategory || 'Other' : form.category,
      locations:     form.locations,
      story:         form.story,
      mediaCount:    form.images.length,
      status:        'PENDING',
      rawDate:       form.date,
      httnMagazineTestimoniesOutreaches: '',
      magazinesUsed:   parseInt(form.magazinesUsed) || 0,
      peopleInvolved:  parseInt(form.peopleInvolved) || 0,
      totalAttendance: parseInt(form.totalAttendance) || 0,
      soulsSaved:      parseInt(form.soulsSaved) || 0,
      outreachTestimonies: (() => {
        let finalTestimonies = form.outreachTestimonies;
        if (form.testimonyFiles && form.testimonyFiles.length > 0) {
          const filesList = form.testimonyFiles.map(f => f.name).join(', ');
          finalTestimonies = [
            form.outreachTestimonies,
            `Attachments: ${filesList}`
          ].filter(Boolean).join('\n\n');
        }
        return finalTestimonies;
      })(),
      followUpPlan:    form.followUpPlan,
      healingTranslationsAchieved:  Number(form.healingTranslationsAchieved) || 0,
      healingOutreachesHeld: Number(form.healingOutreachesHeld) || 0,
      healingOutreachLocations: form.healingOutreachLocations,
      healingMediaSubmitted: Number(form.healingMediaSubmitted) || 0,
    });
    setSubmitting(false);
  };

  return (
    <FormPopup title="Outreach / Crusade Activity Report" eyebrow="KingsForms · Outreach" icon="📍"
      onClose={onClose} onSubmit={handleSubmit} submitting={submitting} submitLabel="Submit Outreach / Crusade Report">

      {/* Category */}
      <div className="popup-section-head">🏷️ Outreach / Crusade Category</div>
      <div className="popup-fields">
        <Field label="What type of outreach / crusade was this?" required hint="(healing, soul-winning, etc.)" error={errors.category}>
          <div className="outreach-cat-grid">
            {OUTREACH_CATEGORIES.map(cat => (
              <button key={cat} type="button"
                className={`toggle-btn outreach-cat-btn ${form.category === cat ? 'selected' : ''}`}
                onClick={() => setForm(p => ({ ...p, category: cat }))}>
                {cat}
              </button>
            ))}
          </div>
        </Field>
        {form.category === 'Other' && (
          <Field label="Please specify type">
            <input className="kf-input" placeholder="Enter category…"
              value={form.customCategory} onChange={e => setForm(p => ({ ...p, customCategory: e.target.value }))} />
          </Field>
        )}
      </div>

      {/* Outreach Details */}
      <div className="popup-section-head">📍 Outreach / Crusade Details</div>
      <div className="popup-fields">
        <Field label="Date of Outreach / Crusade" required error={errors.date}>
          <input className={`kf-input${errors.date ? ' kf-input-err' : ''}`} type="date"
            value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
        </Field>
        <Field label="Location(s)" required hint="Separate multiple locations with commas" error={errors.locations}>
          <input className={`kf-input${errors.locations ? ' kf-input-err' : ''}`}
            placeholder="e.g. Lagos Island, Surulere Market"
            value={form.locations} onChange={e => setForm(p => ({ ...p, locations: e.target.value }))} />
        </Field>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
          <Field label="How many copies of magazine were used?">
            <input className="kf-input" type="number" min="0" placeholder="0"
              value={form.magazinesUsed} onChange={e => setForm(p => ({ ...p, magazinesUsed: e.target.value }))} />
          </Field>
          <Field label="How many people are involved?">
            <input className="kf-input" type="number" min="0" placeholder="0"
              value={form.peopleInvolved} onChange={e => setForm(p => ({ ...p, peopleInvolved: e.target.value }))} />
          </Field>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
          <Field label="What was the total attendance?">
            <input className="kf-input" type="number" min="0" placeholder="0"
              value={form.totalAttendance} onChange={e => setForm(p => ({ ...p, totalAttendance: e.target.value }))} />
          </Field>
          <Field label="How many souls were saved?">
            <input className="kf-input" type="number" min="0" placeholder="0"
              value={form.soulsSaved} onChange={e => setForm(p => ({ ...p, soulsSaved: e.target.value }))} />
          </Field>
        </div>

        <Field label="Kindly submit testimonies from the outreach(es) / crusade(s)">
          <textarea className="kf-textarea" rows={3} placeholder="Give testimonies..."
            value={form.outreachTestimonies} onChange={e => setForm(p => ({ ...p, outreachTestimonies: e.target.value }))} />
        </Field>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
          <Field label="Total number of Healing translations achieved?">
            <input className="kf-input" type="number" min="0" placeholder="0"
              value={form.healingTranslationsAchieved} onChange={e => setForm(p => ({ ...p, healingTranslationsAchieved: e.target.value }))} />
          </Field>
          <Field label="How many Healing Outreaches / Crusades were carried out this week with the healing to nations magazine?">
            <input className="kf-input" type="number" min="0" placeholder="0"
              value={form.healingOutreachesHeld} onChange={e => setForm(p => ({ ...p, healingOutreachesHeld: e.target.value }))} />
          </Field>
        </div>

        <Field label="State the location of healing outreaches (e.g. market, hospitals, school, etc.)">
          <input className="kf-input" placeholder="e.g. local market, community school..."
            value={form.healingOutreachLocations} onChange={e => setForm(p => ({ ...p, healingOutreachLocations: e.target.value }))} />
        </Field>

        <Field label="How many pictures and videos from the Healing outreaches / crusades were submitted?">
          <input className="kf-input" type="number" min="0" placeholder="0"
            value={form.healingMediaSubmitted} onChange={e => setForm(p => ({ ...p, healingMediaSubmitted: e.target.value }))} />
        </Field>

        <Field label="Kindly state further plans for soul retention">
          <textarea className="kf-textarea" rows={3} placeholder="State follow-up plan..."
            value={form.followUpPlan} onChange={e => setForm(p => ({ ...p, followUpPlan: e.target.value }))} />
        </Field>
      </div>

      {/* Story */}
      <div className="popup-section-head">📝 Outreach / Crusade Story</div>
      <div className="popup-fields">
        <Field label="Tell the story" required error={errors.story}>
          <textarea className={`kf-textarea${errors.story ? ' kf-input-err' : ''}`} rows={7}
            placeholder="Describe what happened — souls reached, testimonies heard, challenges, highlights…"
            value={form.story} onChange={e => setForm(p => ({ ...p, story: e.target.value }))} />
        </Field>
      </div>

      {/* Images & Videos */}
      <div className="popup-section-head">📸 Outreach / Crusade Images & Videos</div>
      <div className="popup-fields">
        <MediaUploader files={form.images}
          onAdd={files => {
            const prev = files.map(f => ({ name: f.name, type: f.type, url: (f.type.startsWith('image') || f.type.startsWith('video')) ? URL.createObjectURL(f) : null, size: f.size }));
            setForm(p => ({ ...p, images: [...p.images, ...prev] }));
          }}
          onRemove={i => setForm(p => ({ ...p, images: p.images.filter((_,j) => j !== i) }))}
          label="Upload Photos & Videos (includes Healing outreaches)"
          accept="image/*,video/*"
        />
      </div>
    </FormPopup>
  );
}


// ══════════════════════════════════════════════════════
// TABS CONFIG
// ══════════════════════════════════════════════════════
const TABS_CONFIG = [
  {
    id: 'zonal', label: 'Zonal Report', icon: <Users size={14} />, emoji: '🏛️', color: '#4f46e5',
    columns: [
      { key: 'id', label: 'Report ID' }, { key: 'rawDate', label: 'Date' },
      { key: 'zone', label: 'Zone' }, { key: 'submittedBy', label: 'Submitted By' },
      { key: 'partners', label: 'New Partners' }, 
      { key: 'totalRegistrationHslhs', label: 'HSLHS Reg' },
      { key: 'status', label: 'Status' },
    ],
    FormComponent: ZonalReportForm, btnLabel: 'Upload a New Zonal Report',
  },
  {
    id: 'partnership', label: 'Partnership Report', icon: <Heart size={14} />, emoji: '🤝', color: '#16a34a',
    columns: [
      { key: 'id', label: 'Report ID' }, { key: 'rawDate', label: 'Date' },
      { key: 'zonalPartnership', label: 'Zonal Partnership' },
      { key: 'groupsPartnership', label: 'Groups' },
      { key: 'churchesPartnership', label: 'Churches' },
      { key: 'cellPartnership', label: 'Cell' },
      { key: 'groupPastorsMilestones', label: 'BLAAAST Milestones' },
      { key: 'sponsoredTeenspiration', label: 'Teenspiration (300 espees)' },
      { key: 'sponsoredKidspiration', label: 'Kidspiration (300 espees)' },
      { key: 'status', label: 'Status' },
    ],
    FormComponent: PartnershipForm, btnLabel: 'Upload a New Partnership Report',
  },
  {
    id: 'testimonials', label: 'Testimonials', icon: <BookOpen size={14} />, emoji: '✍️', color: '#d97706',
    columns: [
      { key: 'id', label: 'Report ID' }, { key: 'rawDate', label: 'Date' },
      { key: 'memberName', label: 'Member Name' },
      { key: 'testimoniesCount', label: 'Count' },
      { key: 'prayWithMeTestimonies', label: 'Pray With Me' },
      { key: 'translationTestimonies', label: 'Translation' },
      { key: 'partnershipTestimonies', label: 'Partnership' },
      { key: 'salvationTestimonies', label: 'Salvation' },
      { key: 'healingTestimonies', label: 'Healing' },
      { key: 'othersTestimonies', label: 'Others' },
      { key: 'status', label: 'Status' },
    ],
    FormComponent: TestimonialsForm, btnLabel: 'Upload a New Testimony',
  },
  {
    id: 'magazine', label: 'Magazine', icon: <Newspaper size={14} />, emoji: '📚', color: '#dc2626',
    columns: [
      { key: 'id', label: 'Report ID' }, { key: 'rawDate', label: 'Date' },
      { key: 'language', label: 'Language' },
      { key: 'ordered', label: 'Ordered' },
      { key: 'received', label: 'Received' },
      { key: 'datesReceived', label: 'Dates Received' },
      { key: 'sponsoredCopies', label: 'Sponsored' },
      { key: 'monthlyMinimumOrder', label: 'Min Order' },
      { key: 'monthlyCopiesOrdered', label: 'Monthly Sponsored' },
      { key: 'healingOutreaches', label: 'Healing Outreaches' },
      { key: 'outreachLocations', label: 'Outreach Locations' },
      { key: 'status', label: 'Status' },
    ],
    FormComponent: MagazineForm, btnLabel: 'Upload a New Magazine Report',
  },
  {
    id: 'outreach', label: 'Outreach Report', icon: <FileText size={14} />, emoji: '📍', color: '#0891b2',
    columns: [
      { key: 'id', label: 'Report ID' }, { key: 'rawDate', label: 'Date' },
      { key: 'category', label: 'Category' },
      { key: 'locations', label: 'Location(s)' },
      { key: 'magazinesUsed', label: 'Magazines Used' },
      { key: 'peopleInvolved', label: 'Involved' },
      { key: 'totalAttendance', label: 'Attendance' },
      { key: 'soulsSaved', label: 'Saved' },
      { key: 'status', label: 'Status' },
    ],
    FormComponent: OutreachForm, btnLabel: 'Upload a New Outreach Report',
  },
];

// ══════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════
export default function ReportingPortal() {
  const { user } = useAuth();
  const [activeTab, setActiveTab]       = useState('zonal');
  const [search, setSearch]             = useState('');
  const [reportsByTab, setReportsByTab] = useState({ zonal: [], partnership: [], testimonials: [], magazine: [], outreach: [] });
  const [showForm, setShowForm]         = useState(false);
  const [viewReport, setViewReport]     = useState(null);
  const [clarifyReport, setClarifyReport] = useState(null);
  const [toast, setToast]               = useState('');


  useEffect(() => {
    if (user) fetchAllReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchAllReports = async () => {
    const baseUrl = window.ENV?.API_PATH || process.env.REACT_APP_API_URL || 'http://65.1.248.88:8081';
    const emailParam = user?.role === 'admin' ? '' : `?email=${user?.email}`;
    
    try {
      const zRes = await fetch(`${baseUrl}/api/reports${emailParam}`);
      if (!zRes.ok) throw new Error(`ZR Fetch Error: ${zRes.status}`);
      const zData = await zRes.json();
      
      // Fetch others
      const tabs = ['partnership', 'testimonials', 'magazine', 'outreach'];
      const otherData = {};
      for (const t of tabs) {
        const res = await fetch(`${baseUrl}/api/portal-reports/${t}${emailParam}`);
        if (!res.ok) {
          console.warn(`Tab ${t} fetch failed with status ${res.status}`);
          otherData[t] = [];
          continue;
        }
        otherData[t] = await res.json();
      }

      setReportsByTab({
        zonal: zData.map(r => ({
          id: `ZR-${String(r.id).padStart(3, '0')}`,
          rawDate: r.submittedAt,
          zone: r.zoneName,
          submittedBy: r.submittedBy,
          partners: r.newPartnersRecruited,
          status: r.status,
          ...r
        })),
        partnership: otherData.partnership.map(r => ({ id: `PR-${String(r.id).padStart(3, '0')}`, rawDate: r.submittedDate, ...r })),
        testimonials: otherData.testimonials.map(r => ({ id: `TS-${String(r.id).padStart(3, '0')}`, rawDate: r.submittedDate, ...r })),
        magazine: otherData.magazine.map(r => ({
          id: `MG-${String(r.id).padStart(3, '0')}`,
          rawDate: r.submittedDate,
          magazineType: [r.isAdult && 'Adult', r.isTeevolution && 'Teevolution', r.isKidsMagazine && 'Kids'].filter(Boolean).join(', ') || 'N/A',
          ...r
        })),
        outreach: otherData.outreach.map(r => ({ id: `OR-${String(r.id).padStart(3, '0')}`, rawDate: r.submittedDate, ...r })),
      });
    } catch (err) {
      console.error("Failed to fetch reports", err);
    }
  };

  const handleApprove = async (report) => {
    const baseUrl = window.ENV?.API_PATH || process.env.REACT_APP_API_URL || 'http://65.1.248.88:8081';
    const endpoint = activeTab === 'zonal' ? '/api/reports' : `/api/portal-reports/${activeTab}`;
    const id = report.id.replace(/^[A-Z]+-/, '');
    
    try {
      const res = await fetch(`${baseUrl}${endpoint}/${id}/approve`, { method: 'POST' });
      if (res.ok) {
        setToast('Report approved ✅');
        fetchAllReports();
      }
    } catch (e) {
      console.error(e);
      setToast('Failed to approve ❌');
    }
  };

  const handleDelete = async (report) => {
    if (!window.confirm('Delete this report? This cannot be undone.')) return;
    const baseUrl = window.ENV?.API_PATH || process.env.REACT_APP_API_URL || 'http://65.1.248.88:8081';
    const endpoint = activeTab === 'zonal' ? '/api/reports' : `/api/portal-reports/${activeTab}`;
    const id = report.id.replace(/^[A-Z]+-/, '');

    try {
      const res = await fetch(`${baseUrl}${endpoint}/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setToast('Report deleted 🗑️');
        fetchAllReports();
      }
    } catch (e) {
      console.error(e);
      setToast('Delete failed ❌');
    }
  };

  const tab     = TABS_CONFIG.find(t => t.id === activeTab);
  const reports = reportsByTab[activeTab] || [];

  const filtered = reports.filter(r =>
    Object.values(r).some(v => String(v).toLowerCase().includes(search.toLowerCase()))
  );

  const handleSubmit = async (data) => {
    try {
      if (['partnership', 'testimonials', 'magazine', 'outreach'].includes(activeTab)) {
        const res = await fetch(`${window.ENV?.API_PATH || process.env.REACT_APP_API_URL || 'http://65.1.248.88:8081'}/api/portal-reports/${activeTab}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...data,
            submitterEmail: user?.email,
            zoneName:       user?.zone || user?.region,
          }),
        });
        if (!res.ok) {
          const txt = await res.text();
          throw new Error(`Submit failed (${res.status}): ${txt}`);
        }
      }
      setToast(`${tab.label} submitted successfully`);
      await fetchAllReports(); // Wait for DB sync
    } catch (e) {
      console.error('Submission failed', e);
      alert(`Failed to save report: ${e.message}`);
    }
    
    setShowForm(false);
  };

  const handleExport = () => {
    const headers = tab.columns.map(c => c.label);
    const rows    = filtered.map(r => tab.columns.map(c => r[c.key] ?? ''));
    const content = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const userName = user?.name ? user.name.replace(/\s+/g, '_') : 'User';
    const formName = activeTab;
    const a = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(new Blob([content], { type: 'text/csv' })),
      download: `${userName}_${formName}.csv`,
    });
    a.click();
    setToast(`Exported ${filtered.length} ${tab.label} reports`);
  };

  return (
    <div className="rp-page">
      {toast && <Toast message={toast} onDone={() => setToast('')} />}
      {viewReport && <ViewModal report={viewReport} onClose={() => setViewReport(null)} />}
      {clarifyReport && (
        <ClarificationModal
          report={clarifyReport}
          endpoint={activeTab === 'zonal' ? '/api/reports' : `/api/portal-reports/${activeTab}`}
          onClose={() => setClarifyReport(null)}
          onDone={() => { setClarifyReport(null); setToast('Clarification request sent 💬'); fetchAllReports(); }}
        />
      )}

      {showForm && (
        <tab.FormComponent
          onClose={() => setShowForm(false)}
          onSubmit={handleSubmit}
        />
      )}

      <div className="rp-page-header">
        <div>
          <h2>Reporting Portal {user?.role === 'admin' ? '— Admin View' : ''}</h2>
          <p>{user?.role === 'admin' ? 'Review, approve, and manage all submitted reports' : 'Submit, manage, and track weekly activity reports'}</p>
        </div>
        <button className="rp-export-btn excel" onClick={handleExport}><ExportIcon /> Export CSV</button>
      </div>

      {/* ── Tabs ── */}
      <div className="rp-tabs">
        {TABS_CONFIG.map(t => (
          <button key={t.id}
            onClick={() => { setActiveTab(t.id); setSearch(''); setShowForm(false); }}
            className={`rp-tab ${activeTab === t.id ? 'active' : ''}`}
            style={activeTab === t.id ? { '--tab-color': t.color } : {}}>
            {t.icon} {t.label}
            {reportsByTab[t.id].length > 0 && (
              <span className="tab-count" style={{ background: t.color }}>{reportsByTab[t.id].length}</span>
            )}
          </button>
        ))}
      </div>
      <div className="rp-tab-divider" />

      {/* ── Panel ── */}
      <div className="rp-panel">
        <div className="rp-toolbar">
          <div className="rp-search">
            <Search size={14} color="#9ca3af" />
            <input type="text" placeholder={`Search ${tab.label.toLowerCase()}…`}
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="rp-toolbar-right">
            <button className="submit-report-btn" style={{ '--btn-color': tab.color }} onClick={() => setShowForm(true)}>
              <Plus size={14} /> {tab.btnLabel}
            </button>
          </div>
        </div>

        <p className="rp-count">
          Showing {filtered.length} {tab.label.toLowerCase()} report{filtered.length !== 1 ? 's' : ''}
        </p>

        <ReportTable
          reports={filtered.map(r => ({ ...r, rawDate: formatDate(r.rawDate) }))}
          loading={false}
          columns={user?.role === 'admin' 
            ? (tab.columns.some(c => c.key === 'submittedBy') ? tab.columns : [{ key: 'submittedBy', label: 'Submitted By' }, ...tab.columns])
            : tab.columns
          }
          onView={r => setViewReport(r)}
          onDownload={r => {
            setToast(`Downloading ${r.id}…`);
            const fullReport = reports.find(x => x.id === r.id);
            if (fullReport) {
              downloadReportPDF({ ...fullReport, formName: tab.label }, formatDate);
            }
          }}
          onApprove={handleApprove}
          onClarify={r => setClarifyReport(r)}
          onDelete={handleDelete}
          userRole={user?.role}
        />
      </div>
    </div>
  );
}
