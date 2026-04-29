import React, { useState, useRef, useEffect } from 'react';
import { Eye, Download, Search, Upload, X, Check, ChevronDown, Plus, FileText, Heart, BookOpen, Newspaper, Users } from 'lucide-react';
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
        {label}{required && <span style={{ color: '#4f46e5' }}> *</span>}
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
                : <div className="rp-media-img rp-media-pdf-thumb">PDF</div>}
              <button className="rp-media-remove" onClick={() => onRemove(i)}>✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Report Table ───────────────────────────────────────
function ReportTable({ reports, loading, columns, onView, onDownload }) {
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
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

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
              <span className="rp-view-label">{k.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}</span>
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

        {/* ── Header ── */}
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

        {/* ── Scrollable fields ── */}
        <div className="popup-scroll">
          {children}
        </div>

        {/* ── Sticky footer with submit ── */}
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

// spin keyframe injected once
const spinStyle = document.createElement('style');
spinStyle.textContent = '@keyframes spin { to { transform: rotate(360deg); } }';
document.head.appendChild(spinStyle);


// ══════════════════════════════════════════════════════
// FORMS
// ══════════════════════════════════════════════════════

// ── Zonal Report Form ──────────────────────────────────
function ZonalReportForm({ onClose, onSubmit: parentSubmit }) {
  const EMPTY = {
    zoneName: '', zonalManager: '', partnershipRemittance: '', newPartners: '',
    testimonies: '', httnmTranslations: '', httnmOutreaches: '', httnmPicturesVideos: '',
    pastoralAttendanceDirector: '', managerAttendanceDirector: '', managerAttendanceStrategy: '',
    healingCrusadeSponsorship: '', testimonyClarificationConcern: '', media: [], mediaFiles: [],
  };
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const ATTENDANCE = ['', 'Yes', 'No', 'Officially Excused'];

  const validate = () => {
    const e = {};
    if (!form.zoneName.trim()) e.zoneName = 'Required';
    if (!form.zonalManager.trim()) e.zonalManager = 'Required';
    if (!String(form.partnershipRemittance).trim()) e.partnershipRemittance = 'Required';
    if (!String(form.newPartners).trim()) e.newPartners = 'Required';
    if (!form.testimonies.trim()) e.testimonies = 'Required';
    return e;
  };

  const handleSubmit = async () => {
    const e = validate(); setErrors(e);
    if (Object.keys(e).length) return;
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 500));
    parentSubmit({
      zone: form.zoneName, submittedBy: form.zonalManager,
      partners: form.newPartners, remittance: form.partnershipRemittance,
      status: 'submitted', media: form.media,
      rawDate: new Date().toISOString().split('T')[0],
    });
    setSubmitting(false);
  };

  return (
    <FormPopup title="Zonal Weekly Report" eyebrow="KingsForms · Zonal Report" icon="🏛️"
      onClose={onClose} onSubmit={handleSubmit} submitting={submitting} submitLabel="Submit Zonal Report">

      <div className="popup-section-head">🏛️ Zone Information</div>
      <div className="popup-fields">
        <Field label="Zone Name" required error={errors.zoneName}>
          <input className={`kf-input${errors.zoneName ? ' kf-input-err' : ''}`} placeholder="e.g. Zone A"
            value={form.zoneName} onChange={e => set('zoneName', e.target.value)} />
        </Field>
        <Field label="Zonal Manager" required error={errors.zonalManager}>
          <input className={`kf-input${errors.zonalManager ? ' kf-input-err' : ''}`} placeholder="Full name"
            value={form.zonalManager} onChange={e => set('zonalManager', e.target.value)} />
        </Field>
      </div>

      <div className="popup-section-head">🤝 Partnership & Recruitment</div>
      <div className="popup-fields">
        <Field label="Total Partnership Remittance (Espees)" required hint="Target: 10,000 weekly" error={errors.partnershipRemittance}>
          <input className={`kf-input${errors.partnershipRemittance ? ' kf-input-err' : ''}`} type="number" min="0" placeholder="0"
            value={form.partnershipRemittance} onChange={e => set('partnershipRemittance', e.target.value)} />
        </Field>
        <Field label="New Partners Recruited" required hint="Target: 10 weekly" error={errors.newPartners}>
          <input className={`kf-input${errors.newPartners ? ' kf-input-err' : ''}`} type="number" min="0" placeholder="0"
            value={form.newPartners} onChange={e => set('newPartners', e.target.value)} />
        </Field>
        <Field label="Testimonies Submitted" required hint="Target: 50 weekly" error={errors.testimonies}>
          <textarea className={`kf-textarea${errors.testimonies ? ' kf-input-err' : ''}`} rows={3} placeholder="Describe testimonies…"
            value={form.testimonies} onChange={e => set('testimonies', e.target.value)} />
        </Field>
      </div>

      <div className="popup-section-head">📖 HTTNM Outreach</div>
      <div className="popup-fields">
        <Field label="HTTNM Translations" hint="Target: 2 weekly">
          <input className="kf-input" type="number" min="0" placeholder="0"
            value={form.httnmTranslations} onChange={e => set('httnmTranslations', e.target.value)} />
        </Field>
        <Field label="HTTNM Outreaches Held" hint="Target: 10 weekly">
          <input className="kf-input" type="number" min="0" placeholder="0"
            value={form.httnmOutreaches} onChange={e => set('httnmOutreaches', e.target.value)} />
        </Field>
        <Field label="Pictures / Videos Submitted" hint="Target: 10 weekly">
          <input className="kf-input" type="number" min="0" placeholder="0"
            value={form.httnmPicturesVideos} onChange={e => set('httnmPicturesVideos', e.target.value)} />
        </Field>
      </div>

      <div className="popup-section-head">📅 Attendance</div>
      <div className="popup-fields">
        {[
          { k: 'pastoralAttendanceDirector', label: "Zonal Pastor — Director's Meeting" },
          { k: 'managerAttendanceDirector',  label: "Zonal Manager — Director's Meeting" },
          { k: 'managerAttendanceStrategy',  label: "Zonal Manager — Strategy Meeting" },
        ].map(f => (
          <Field key={f.k} label={f.label}>
            <div className="kf-select-wrap">
              <select className="kf-select" value={form[f.k]} onChange={e => set(f.k, e.target.value)}>
                {ATTENDANCE.map(o => <option key={o} value={o}>{o || 'Please select'}</option>)}
              </select>
              <ChevronDown size={13} className="kf-select-chevron" />
            </div>
          </Field>
        ))}
      </div>

      <div className="popup-section-head">✝️ Healing Crusade</div>
      <div className="popup-fields">
        <Field label="Healing Crusade Sponsorship">
          <textarea className="kf-textarea" rows={2} placeholder="Amount / details…"
            value={form.healingCrusadeSponsorship} onChange={e => set('healingCrusadeSponsorship', e.target.value)} />
        </Field>
        <Field label="Testimony / Clarification / Concern">
          <textarea className="kf-textarea" rows={3} placeholder="Any additional notes…"
            value={form.testimonyClarificationConcern} onChange={e => set('testimonyClarificationConcern', e.target.value)} />
        </Field>
      </div>

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

// ── Partnership Report Form ────────────────────────────
const PARTNERSHIP_ARMS = [
  { key: 'healingSchool', label: 'Healing School',       icon: '🏥' },
  { key: 'rhapsody',      label: 'Rhapsody of Realities', icon: '📖' },
  { key: 'innercity',     label: 'Inner City Mission',    icon: '🏙️' },
  { key: 'lbn',           label: 'LBN',                   icon: '📡' },
];

function PartnershipForm({ onClose, onSubmit: parentSubmit }) {
  const [form, setForm] = useState({ selectedArms: [], remittances: {}, totalRemittance: '', notes: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const toggleArm = key => setForm(p => ({
    ...p, selectedArms: p.selectedArms.includes(key) ? p.selectedArms.filter(k => k !== key) : [...p.selectedArms, key],
  }));

  const handleSubmit = async () => {
    const e = {};
    if (form.selectedArms.length === 0) e.arms = 'Select at least one partnership arm';
    if (!form.totalRemittance.trim()) e.totalRemittance = 'Required';
    setErrors(e);
    if (Object.keys(e).length) return;
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 500));
    parentSubmit({ arms: form.selectedArms.join(', '), totalRemittance: form.totalRemittance, notes: form.notes, status: 'submitted', rawDate: new Date().toISOString().split('T')[0] });
    setSubmitting(false);
  };

  return (
    <FormPopup title="Partnership Remittance Report" eyebrow="KingsForms · Partnership" icon="🤝"
      onClose={onClose} onSubmit={handleSubmit} submitting={submitting} submitLabel="Submit Partnership Report">

      <div className="popup-section-head">💼 Partnership Arms</div>
      <div className="popup-fields">
        <Field label="Select applicable arms" required error={errors.arms}>
          <div className="arm-grid">
            {PARTNERSHIP_ARMS.map(arm => (
              <button key={arm.key} type="button"
                className={`arm-card ${form.selectedArms.includes(arm.key) ? 'selected' : ''}`}
                onClick={() => toggleArm(arm.key)}>
                <span className="arm-icon">{arm.icon}</span>
                <span className="arm-label">{arm.label}</span>
                <span className="arm-check">✓</span>
              </button>
            ))}
          </div>
        </Field>
      </div>

      {form.selectedArms.length > 0 && (
        <>
          <div className="popup-section-head">💰 Remittance per Arm</div>
          <div className="popup-fields">
            {form.selectedArms.map(key => {
              const arm = PARTNERSHIP_ARMS.find(a => a.key === key);
              return (
                <Field key={key} label={`${arm.icon} ${arm.label} — Remittance (Espees)`}>
                  <input className="kf-input" type="number" min="0" placeholder="0"
                    value={form.remittances[key] || ''}
                    onChange={e => setForm(p => ({ ...p, remittances: { ...p.remittances, [key]: e.target.value } }))} />
                </Field>
              );
            })}
          </div>
        </>
      )}

      <div className="popup-section-head">📊 Summary</div>
      <div className="popup-fields">
        <Field label="Total Partnership Remittance (Espees)" required error={errors.totalRemittance}>
          <input className={`kf-input${errors.totalRemittance ? ' kf-input-err' : ''}`} type="number" min="0" placeholder="0"
            value={form.totalRemittance} onChange={e => setForm(p => ({ ...p, totalRemittance: e.target.value }))} />
        </Field>
        <Field label="Additional Notes">
          <textarea className="kf-textarea" rows={3} placeholder="Any recruitment notes or special mentions…"
            value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
        </Field>
      </div>
    </FormPopup>
  );
}

// ── Testimonials Form ──────────────────────────────────
function TestimonialsForm({ onClose, onSubmit: parentSubmit }) {
  const [form, setForm] = useState({ testimony: '', beforeImages: [], afterImages: [], documents: [] });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const addFiles = (field, files) => {
    const prev = files.map(f => ({ name: f.name, type: f.type, url: f.type.startsWith('image') ? URL.createObjectURL(f) : null, size: f.size }));
    setForm(p => ({ ...p, [field]: [...p[field], ...prev] }));
  };
  const removeFile = (field, i) => setForm(p => ({ ...p, [field]: p[field].filter((_,j) => j !== i) }));

  const handleSubmit = async () => {
    const e = {};
    if (!form.testimony.trim()) e.testimony = 'Please share a testimony';
    setErrors(e);
    if (Object.keys(e).length) return;
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 500));
    parentSubmit({
      testimony: form.testimony.slice(0, 80) + (form.testimony.length > 80 ? '…' : ''),
      beforeImages: form.beforeImages.length, afterImages: form.afterImages.length, documents: form.documents.length,
      status: 'submitted', rawDate: new Date().toISOString().split('T')[0],
      media: [...form.beforeImages, ...form.afterImages, ...form.documents],
    });
    setSubmitting(false);
  };

  return (
    <FormPopup title="Submit a Testimony" eyebrow="KingsForms · Testimonials" icon="✍️"
      onClose={onClose} onSubmit={handleSubmit} submitting={submitting} submitLabel="Submit Testimony">

      <div className="popup-section-head">✍️ Your Testimony</div>
      <div className="popup-fields">
        <Field label="Share your testimony" required error={errors.testimony}>
          <textarea className={`kf-textarea${errors.testimony ? ' kf-input-err' : ''}`} rows={7}
            placeholder="Write your testimony here — what happened, how you were impacted, what God did…"
            value={form.testimony} onChange={e => setForm(p => ({ ...p, testimony: e.target.value }))} />
        </Field>
      </div>

      <div className="popup-section-head">🖼️ Before &amp; After Images</div>
      <div className="popup-fields">
        <Field label="Before Images (optional)">
          <MediaUploader files={form.beforeImages} onAdd={f => addFiles('beforeImages', f)} onRemove={i => removeFile('beforeImages', i)} label="Upload Before Images" accept="image/*" />
        </Field>
        <Field label="After Images (optional)">
          <MediaUploader files={form.afterImages} onAdd={f => addFiles('afterImages', f)} onRemove={i => removeFile('afterImages', i)} label="Upload After Images" accept="image/*" />
        </Field>
      </div>

      <div className="popup-section-head">📄 Supporting Documents</div>
      <div className="popup-fields">
        <Field label="Documents (optional)">
          <MediaUploader files={form.documents} onAdd={f => addFiles('documents', f)} onRemove={i => removeFile('documents', i)} label="Upload Documents" accept=".pdf,.doc,.docx" />
        </Field>
      </div>
    </FormPopup>
  );
}

// ── Magazine Form ──────────────────────────────────────
const LANGUAGES = ['English', 'French', 'Spanish', 'Portuguese', 'Arabic', 'Chinese', 'Swahili', 'Hausa', 'Yoruba', 'Igbo', 'Other'];

function MagazineForm({ onClose, onSubmit: parentSubmit }) {
  const [form, setForm] = useState({ language: '', orderedCopies: '', receivedCopies: '', received: '', notReceivedReason: '', notes: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    const e = {};
    if (!form.language) e.language = 'Required';
    if (!form.orderedCopies) e.orderedCopies = 'Required';
    if (!form.received) e.received = 'Please select a receipt status';
    if ((form.received === 'No' || form.received === 'Partial') && !form.notReceivedReason.trim()) e.notReceivedReason = 'Please provide a reason';
    setErrors(e);
    if (Object.keys(e).length) return;
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 500));
    parentSubmit({
      language: form.language, ordered: form.orderedCopies,
      received: form.received === 'Yes' ? form.receivedCopies : '0',
      receiptStatus: form.received, reason: form.notReceivedReason,
      status: 'submitted', rawDate: new Date().toISOString().split('T')[0],
    });
    setSubmitting(false);
  };

  return (
    <FormPopup title="Magazine Order Report" eyebrow="KingsForms · Magazine" icon="📚"
      onClose={onClose} onSubmit={handleSubmit} submitting={submitting} submitLabel="Submit Magazine Report">

      <div className="popup-section-head">📚 Order Details</div>
      <div className="popup-fields">
        <Field label="Language" required error={errors.language}>
          <div className="kf-select-wrap">
            <select className={`kf-select${errors.language ? ' kf-input-err' : ''}`} value={form.language}
              onChange={e => setForm(p => ({ ...p, language: e.target.value }))}>
              <option value="">Select language…</option>
              {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
            <ChevronDown size={13} className="kf-select-chevron" />
          </div>
        </Field>
        <Field label="Number of Copies Ordered" required error={errors.orderedCopies}>
          <input className={`kf-input${errors.orderedCopies ? ' kf-input-err' : ''}`} type="number" min="0" placeholder="0"
            value={form.orderedCopies} onChange={e => setForm(p => ({ ...p, orderedCopies: e.target.value }))} />
        </Field>
      </div>

      <div className="popup-section-head">📬 Receipt Status</div>
      <div className="popup-fields">
        <Field label="Were copies received?" required error={errors.received}>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {['Yes', 'No', 'Partial'].map(opt => (
              <button key={opt} type="button"
                className={`toggle-btn ${form.received === opt ? 'selected' : ''}`}
                onClick={() => setForm(p => ({ ...p, received: opt }))}>
                {opt}
              </button>
            ))}
          </div>
        </Field>
        {(form.received === 'Yes' || form.received === 'Partial') && (
          <Field label="Number of Copies Received">
            <input className="kf-input" type="number" min="0" placeholder="0"
              value={form.receivedCopies} onChange={e => setForm(p => ({ ...p, receivedCopies: e.target.value }))} />
          </Field>
        )}
        {(form.received === 'No' || form.received === 'Partial') && (
          <Field label="Reason for non-receipt" required error={errors.notReceivedReason}>
            <textarea className={`kf-textarea${errors.notReceivedReason ? ' kf-input-err' : ''}`} rows={3}
              placeholder="Explain why copies were not received…"
              value={form.notReceivedReason} onChange={e => setForm(p => ({ ...p, notReceivedReason: e.target.value }))} />
          </Field>
        )}
        <Field label="Additional Notes">
          <textarea className="kf-textarea" rows={2} placeholder="Any other notes…"
            value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
        </Field>
      </div>
    </FormPopup>
  );
}

// ── Outreach Report Form ───────────────────────────────
function OutreachForm({ onClose, onSubmit: parentSubmit }) {
  const [form, setForm] = useState({ date: '', locations: '', story: '', images: [] });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    const e = {};
    if (!form.date) e.date = 'Required';
    if (!form.locations.trim()) e.locations = 'Required';
    if (!form.story.trim()) e.story = 'Required';
    setErrors(e);
    if (Object.keys(e).length) return;
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 500));
    parentSubmit({
      date: formatDate(form.date), locations: form.locations,
      story: form.story.slice(0, 80) + (form.story.length > 80 ? '…' : ''),
      images: form.images.length, status: 'submitted',
      rawDate: form.date, media: form.images,
    });
    setSubmitting(false);
  };

  return (
    <FormPopup title="Outreach Activity Report" eyebrow="KingsForms · Outreach" icon="📍"
      onClose={onClose} onSubmit={handleSubmit} submitting={submitting} submitLabel="Submit Outreach Report">

      <div className="popup-section-head">📍 Outreach Details</div>
      <div className="popup-fields">
        <Field label="Date of Outreach" required error={errors.date}>
          <input className={`kf-input${errors.date ? ' kf-input-err' : ''}`} type="date"
            value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
        </Field>
        <Field label="Location(s)" required hint="Separate multiple locations with commas" error={errors.locations}>
          <input className={`kf-input${errors.locations ? ' kf-input-err' : ''}`}
            placeholder="e.g. Lagos Island, Surulere Market"
            value={form.locations} onChange={e => setForm(p => ({ ...p, locations: e.target.value }))} />
        </Field>
      </div>

      <div className="popup-section-head">📝 Outreach Story</div>
      <div className="popup-fields">
        <Field label="Tell the outreach story" required error={errors.story}>
          <textarea className={`kf-textarea${errors.story ? ' kf-input-err' : ''}`} rows={7}
            placeholder="Describe what happened — souls reached, testimonies heard, challenges, highlights…"
            value={form.story} onChange={e => setForm(p => ({ ...p, story: e.target.value }))} />
        </Field>
      </div>

      <div className="popup-section-head">📸 Outreach Images</div>
      <div className="popup-fields">
        <MediaUploader files={form.images}
          onAdd={files => {
            const prev = files.map(f => ({ name: f.name, type: f.type, url: f.type.startsWith('image') ? URL.createObjectURL(f) : null, size: f.size }));
            setForm(p => ({ ...p, images: [...p.images, ...prev] }));
          }}
          onRemove={i => setForm(p => ({ ...p, images: p.images.filter((_,j) => j !== i) }))}
          label="Upload Outreach Photos"
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
      { key: 'partners', label: 'New Partners' }, { key: 'status', label: 'Status' },
    ],
    FormComponent: ZonalReportForm, btnLabel: 'New Zonal Report',
  },
  {
    id: 'partnership', label: 'Partnership Report', icon: <Heart size={14} />, emoji: '🤝', color: '#16a34a',
    columns: [
      { key: 'id', label: 'Report ID' }, { key: 'rawDate', label: 'Date' },
      { key: 'arms', label: 'Arms' }, { key: 'totalRemittance', label: 'Remittance (Espees)' },
      { key: 'status', label: 'Status' },
    ],
    FormComponent: PartnershipForm, btnLabel: 'New Partnership Report',
  },
  {
    id: 'testimonials', label: 'Testimonials', icon: <BookOpen size={14} />, emoji: '✍️', color: '#d97706',
    columns: [
      { key: 'id', label: 'Report ID' }, { key: 'rawDate', label: 'Date' },
      { key: 'testimony', label: 'Testimony (preview)' }, { key: 'status', label: 'Status' },
    ],
    FormComponent: TestimonialsForm, btnLabel: 'New Testimony',
  },
  {
    id: 'magazine', label: 'Magazine', icon: <Newspaper size={14} />, emoji: '📚', color: '#dc2626',
    columns: [
      { key: 'id', label: 'Report ID' }, { key: 'rawDate', label: 'Date' },
      { key: 'language', label: 'Language' }, { key: 'ordered', label: 'Ordered' },
      { key: 'receiptStatus', label: 'Received?' }, { key: 'status', label: 'Status' },
    ],
    FormComponent: MagazineForm, btnLabel: 'New Magazine Report',
  },
  {
    id: 'outreach', label: 'Outreach Report', icon: <FileText size={14} />, emoji: '📍', color: '#0891b2',
    columns: [
      { key: 'id', label: 'Report ID' }, { key: 'rawDate', label: 'Date' },
      { key: 'locations', label: 'Location(s)' }, { key: 'story', label: 'Story (preview)' },
      { key: 'status', label: 'Status' },
    ],
    FormComponent: OutreachForm, btnLabel: 'New Outreach Report',
  },
];

// ══════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════
export default function ReportingPortal() {
  const [activeTab, setActiveTab]       = useState('zonal');
  const [search, setSearch]             = useState('');
  const [reportsByTab, setReportsByTab] = useState({ zonal: [], partnership: [], testimonials: [], magazine: [], outreach: [] });
  const [showForm, setShowForm]         = useState(false);
  const [viewReport, setViewReport]     = useState(null);
  const [toast, setToast]               = useState('');
  const [counters, setCounters]         = useState({ zonal: 1, partnership: 1, testimonials: 1, magazine: 1, outreach: 1 });

  const tab     = TABS_CONFIG.find(t => t.id === activeTab);
  const reports = reportsByTab[activeTab] || [];

  const filtered = reports.filter(r =>
    Object.values(r).some(v => String(v).toLowerCase().includes(search.toLowerCase()))
  );

  const handleSubmit = (data) => {
    const prefix = { zonal: 'ZR', partnership: 'PR', testimonials: 'TS', magazine: 'MG', outreach: 'OR' }[activeTab];
    const id = `${prefix}-${String(counters[activeTab]).padStart(3, '0')}`;
    setReportsByTab(p => ({ ...p, [activeTab]: [{ id, ...data }, ...p[activeTab]] }));
    setCounters(p => ({ ...p, [activeTab]: p[activeTab] + 1 }));
    setShowForm(false);
    setToast(`${tab.label} submitted (${id})`);
  };

  const handleExport = () => {
    const headers = tab.columns.map(c => c.label);
    const rows    = filtered.map(r => tab.columns.map(c => r[c.key] ?? ''));
    const content = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const a = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(new Blob([content], { type: 'text/csv' })),
      download: `${activeTab}-reports.csv`,
    });
    a.click();
    setToast(`Exported ${filtered.length} ${tab.label} reports`);
  };

  return (
    <div className="rp-page">
      {toast && <Toast message={toast} onDone={() => setToast('')} />}
      {viewReport && <ViewModal report={viewReport} onClose={() => setViewReport(null)} />}

      {showForm && (
        <tab.FormComponent
          onClose={() => setShowForm(false)}
          onSubmit={handleSubmit}
        />
      )}

      <div className="rp-page-header">
        <div>
          <h2>Reporting Portal</h2>
          <p>Submit, manage, and track weekly activity reports</p>
        </div>
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
            <button className="rp-export-btn excel" onClick={handleExport}><ExportIcon /> Export CSV</button>
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
          columns={tab.columns}
          onView={r => setViewReport(r)}
          onDownload={r => setToast(`Downloading ${r.id}…`)}
        />
      </div>
    </div>
  );
}
