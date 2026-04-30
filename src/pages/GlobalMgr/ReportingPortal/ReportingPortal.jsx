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
  const EMPTY = {
    zoneName: '',
    zonalManager: '',
    partnershipRemittance: '',
    newPartners: '',
    testimoniesSubmitted: '',
    httnmTranslations: '',
    httnmOutreaches: '',
    httnmPicturesVideos: '',
    // pastoralAttendanceDirector: '',
    // managerAttendanceDirector: '',
    // managerAttendanceStrategy: '',
    // healingCrusadeSponsorship: '',
    // testimonyClarificationConcern: '',
    media: [],
    mediaFiles: [],
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
    if (!String(form.testimoniesSubmitted).trim()) e.testimoniesSubmitted = 'Required';
    if (!String(form.httnmTranslations).trim()) e.httnmTranslations = 'Required';
    if (!String(form.httnmOutreaches).trim()) e.httnmOutreaches = 'Required';
    if (!String(form.httnmPicturesVideos).trim()) e.httnmPicturesVideos = 'Required';
    return e;
  };

  const handleSubmit = async () => {
    const e = validate(); setErrors(e);
    if (Object.keys(e).length) return;
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 500));
    parentSubmit({
      zone: form.zoneName,
      submittedBy: form.zonalManager,
      partners: form.newPartners,
      remittance: form.partnershipRemittance,
      status: 'submitted',
      media: form.media,
      rawDate: new Date().toISOString().split('T')[0],
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

      {/* Partnership */}
      <div className="popup-section-head">🤝 Partnership & Recruitment</div>
      <div className="popup-fields">
        <Field label="Total Partnership Remittance for this week" required hint="Weekly Target: 10,000 Espees" error={errors.partnershipRemittance}>
          <input className={`kf-input${errors.partnershipRemittance ? ' kf-input-err' : ''}`} type="number" min="0" placeholder="0"
            value={form.partnershipRemittance} onChange={e => set('partnershipRemittance', e.target.value)} />
        </Field>
        <Field label="How many new partners were recruited?" required hint="Target: 10 new partners weekly" error={errors.newPartners}>
          <input className={`kf-input${errors.newPartners ? ' kf-input-err' : ''}`} type="number" min="0" placeholder="0"
            value={form.newPartners} onChange={e => set('newPartners', e.target.value)} />
        </Field>
        <Field label="How many Testimonies were submitted to the Department?" required hint="Target: 50 weekly" error={errors.testimoniesSubmitted}>
          <input className={`kf-input${errors.testimoniesSubmitted ? ' kf-input-err' : ''}`} type="number" min="0" placeholder="0"
            value={form.testimoniesSubmitted} onChange={e => set('testimoniesSubmitted', e.target.value)} />
        </Field>
      </div>

      {/* HTTNM Outreach */}
      <div className="popup-section-head">📖 HTTNM Outreach</div>
      <div className="popup-fields">
        <Field label="Total number of HTTNM translations achieved?" required hint="Target: 2 weekly" error={errors.httnmTranslations}>
          <input className={`kf-input${errors.httnmTranslations ? ' kf-input-err' : ''}`} type="number" min="0" placeholder="0"
            value={form.httnmTranslations} onChange={e => set('httnmTranslations', e.target.value)} />
        </Field>
        <Field label="How many HTTNM outreaches were held this week?" required hint="Target: 10 weekly" error={errors.httnmOutreaches}>
          <input className={`kf-input${errors.httnmOutreaches ? ' kf-input-err' : ''}`} type="number" min="0" placeholder="0"
            value={form.httnmOutreaches} onChange={e => set('httnmOutreaches', e.target.value)} />
        </Field>
        <Field label="How many pictures or videos from the HTTNM outreaches were submitted?" required hint="Target: 10 weekly" error={errors.httnmPicturesVideos}>
          <input className={`kf-input${errors.httnmPicturesVideos ? ' kf-input-err' : ''}`} type="number" min="0" placeholder="0"
            value={form.httnmPicturesVideos} onChange={e => set('httnmPicturesVideos', e.target.value)} />
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
const PARTNERSHIP_ARMS = [
  { key: 'rhapsody',       label: 'Rhapsody of Realities', icon: '📖' },
  { key: 'healingSchool',  label: 'The Healing School',    icon: '🏥' },
  { key: 'lbn',            label: 'LBN',                   icon: '📡' },
  { key: 'loveworldTV',    label: 'Loveworld TV Ministry', icon: '📺' },
  { key: 'bibleSponsorship', label: 'Bible Sponsorship',   icon: '✝️' },
  { key: 'innercity',      label: 'Innercity Mission',     icon: '🏙️' },
  { key: 'internetMultimedia', label: 'Internet Multimedia', icon: '🌐' },
];

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
    selectedArms: [],
    remittances: {},
    totalRemittance: '',
    blaaast: {},
    notes: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const toggleArm = key => setForm(p => ({
    ...p,
    selectedArms: p.selectedArms.includes(key)
      ? p.selectedArms.filter(k => k !== key)
      : [...p.selectedArms, key],
  }));

  const setBlaaast = (key, val) => {
    // restrict to integers only
    const int = val === '' ? '' : String(Math.max(0, Math.floor(Number(val))));
    setForm(p => ({ ...p, blaaast: { ...p.blaaast, [key]: int } }));
  };

  const handleSubmit = async () => {
    const e = {};
    if (form.selectedArms.length === 0) e.arms = 'Select at least one partnership arm';
    if (!form.totalRemittance.trim()) e.totalRemittance = 'Required';
    setErrors(e);
    if (Object.keys(e).length) return;
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 500));
    parentSubmit({
      arms: form.selectedArms.map(k => PARTNERSHIP_ARMS.find(a => a.key === k)?.label).join(', '),
      totalRemittance: form.totalRemittance,
      notes: form.notes,
      status: 'submitted',
      rawDate: new Date().toISOString().split('T')[0],
    });
    setSubmitting(false);
  };

  return (
    <FormPopup title="Partnership Remittance Report" eyebrow="KingsForms · Partnership" icon="🤝"
      onClose={onClose} onSubmit={handleSubmit} submitting={submitting} submitLabel="Submit Partnership Report">

      {/* Partnership Arms — checkboxes */}
      <div className="popup-section-head">💼 Partnership Arms</div>
      <div className="popup-fields">
        <Field label="Select all applicable partnership arms" required error={errors.arms}>
          <div className="arm-checkbox-list">
            {PARTNERSHIP_ARMS.map(arm => (
              <label key={arm.key} className={`arm-checkbox-item ${form.selectedArms.includes(arm.key) ? 'selected' : ''}`}>
                <input
                  type="checkbox"
                  checked={form.selectedArms.includes(arm.key)}
                  onChange={() => toggleArm(arm.key)}
                  style={{ display: 'none' }}
                />
                <span className="arm-checkbox-box">
                  {form.selectedArms.includes(arm.key) && <Check size={12} />}
                </span>
                <span className="arm-checkbox-icon">{arm.icon}</span>
                <span className="arm-checkbox-label">{arm.label}</span>
              </label>
            ))}
          </div>
        </Field>
      </div>

      {/* Remittance per arm */}
      {form.selectedArms.length > 0 && (
        <>
          <div className="popup-section-head">💰 Remittance per Arm (Espees)</div>
          <div className="popup-fields">
            {form.selectedArms.map(key => {
              const arm = PARTNERSHIP_ARMS.find(a => a.key === key);
              return (
                <Field key={key} label={`${arm.icon} ${arm.label}`}>
                  <input className="kf-input" type="number" min="0" placeholder="0"
                    value={form.remittances[key] || ''}
                    onChange={e => setForm(p => ({ ...p, remittances: { ...p.remittances, [key]: e.target.value } }))} />
                </Field>
              );
            })}
          </div>
        </>
      )}

      {/* Total */}
      <div className="popup-section-head">📊 Summary</div>
      <div className="popup-fields">
        <Field label="Total Partnership Remittance (Espees)" required error={errors.totalRemittance}>
          <input className={`kf-input${errors.totalRemittance ? ' kf-input-err' : ''}`} type="number" min="0" placeholder="0"
            value={form.totalRemittance} onChange={e => setForm(p => ({ ...p, totalRemittance: e.target.value }))} />
        </Field>
      </div>

      {/* BLAAAST Categories */}
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

      {/* Notes */}
      <div className="popup-section-head">📝 Additional Notes</div>
      <div className="popup-fields">
        <Field label="Recruitment notes or special mentions">
          <textarea className="kf-textarea" rows={3} placeholder="Any recruitment notes or special mentions…"
            value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
        </Field>
      </div>
    </FormPopup>
  );
}


// ══════════════════════════════════════════════════════
// TESTIMONIALS FORM
// ══════════════════════════════════════════════════════
function TestimonialsForm({ onClose, onSubmit: parentSubmit }) {
  const [form, setForm] = useState({
    testimony: '',
    testimoniesCount: '',
    beforeImages: [],
    afterImages: [],
    documents: [],   // video, PDF, Word
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const addFiles = (field, files) => {
    const prev = files.map(f => ({
      name: f.name, type: f.type,
      url: f.type.startsWith('image') ? URL.createObjectURL(f) : f.type.startsWith('video') ? URL.createObjectURL(f) : null,
      size: f.size,
    }));
    setForm(p => ({ ...p, [field]: [...p[field], ...prev] }));
  };
  const removeFile = (field, i) => setForm(p => ({ ...p, [field]: p[field].filter((_,j) => j !== i) }));

  const handleSubmit = async () => {
    const e = {};
    // testimony is now NOT mandatory
    setErrors(e);
    if (Object.keys(e).length) return;
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 500));
    parentSubmit({
      testimony: form.testimony
        ? form.testimony.slice(0, 80) + (form.testimony.length > 80 ? '…' : '')
        : '(No written testimony)',
      testimoniesCount: form.testimoniesCount,
      beforeImages: form.beforeImages.length,
      afterImages: form.afterImages.length,
      documents: form.documents.length,
      status: 'submitted',
      rawDate: new Date().toISOString().split('T')[0],
      media: [...form.beforeImages, ...form.afterImages, ...form.documents],
    });
    setSubmitting(false);
  };

  return (
    <FormPopup title="Submit a Testimony" eyebrow="KingsForms · Testimonials" icon="✍️"
      onClose={onClose} onSubmit={handleSubmit} submitting={submitting} submitLabel="Submit Testimony">

      {/* Count */}
      <div className="popup-section-head">📊 Testimonies Count</div>
      <div className="popup-fields">
        <Field label="How many testimonies were received this week?" hint="(e.g. partnership, healing, salvation, etc.)">
          <input className="kf-input" type="number" min="0" placeholder="0"
            value={form.testimoniesCount} onChange={e => setForm(p => ({ ...p, testimoniesCount: e.target.value }))} />
        </Field>
      </div>

      {/* Written testimony — no longer mandatory */}
      <div className="popup-section-head">✍️ Written Testimony</div>
      <div className="popup-fields">
        <Field label="Share a testimony" hint="(optional)">
          <textarea className="kf-textarea" rows={6}
            placeholder="Write your testimony here — what happened, how you were impacted, what God did…"
            value={form.testimony} onChange={e => setForm(p => ({ ...p, testimony: e.target.value }))} />
        </Field>
      </div>

      {/* Before & After */}
      <div className="popup-section-head">🖼️ Before &amp; After Images</div>
      <div className="popup-fields">
        <Field label="Before Images (optional)">
          <MediaUploader files={form.beforeImages} onAdd={f => addFiles('beforeImages', f)} onRemove={i => removeFile('beforeImages', i)} label="Upload Before Images" accept="image/*" />
        </Field>
        <Field label="After Images (optional)">
          <MediaUploader files={form.afterImages} onAdd={f => addFiles('afterImages', f)} onRemove={i => removeFile('afterImages', i)} label="Upload After Images" accept="image/*" />
        </Field>
      </div>

      {/* Video / Document upload */}
      <div className="popup-section-head">🎥 Video &amp; Written Testimonies</div>
      <div className="popup-fields">
        <Field label="Upload video, PDF, or Word document testimonies (optional)">
          <MediaUploader
            files={form.documents}
            onAdd={f => addFiles('documents', f)}
            onRemove={i => removeFile('documents', i)}
            label="Upload Video / PDF / Word Files"
            accept="video/*,.pdf,.doc,.docx"
          />
        </Field>
      </div>
    </FormPopup>
  );
}


// ══════════════════════════════════════════════════════
// MAGAZINE FORM
// ══════════════════════════════════════════════════════
const LANGUAGES = ['English', 'French', 'Spanish', 'Portuguese', 'Arabic', 'Chinese', 'Swahili', 'Hausa', 'Yoruba', 'Igbo', 'Other'];

function MagazineForm({ onClose, onSubmit: parentSubmit }) {
  const [form, setForm] = useState({
    language: '',
    orderedCopies: '',
    receivedCopies: '',
    received: '',
    notReceivedReason: '',
    sponsoredCopies: '',
    healingOutreaches: '',
    healingMedia: [],
    notes: '',
  });
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
      language: form.language,
      ordered: form.orderedCopies,
      received: form.received === 'Yes' ? form.receivedCopies : '0',
      receiptStatus: form.received,
      reason: form.notReceivedReason,
      sponsoredCopies: form.sponsoredCopies,
      healingOutreaches: form.healingOutreaches,
      status: 'submitted',
      rawDate: new Date().toISOString().split('T')[0],
    });
    setSubmitting(false);
  };

  return (
    <FormPopup title="Magazine Order Report" eyebrow="KingsForms · Magazine" icon="📚"
      onClose={onClose} onSubmit={handleSubmit} submitting={submitting} submitLabel="Submit Magazine Report">

      {/* Order Details */}
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
        <Field label="Number of magazines ordered" required error={errors.orderedCopies}>
          <input className={`kf-input${errors.orderedCopies ? ' kf-input-err' : ''}`} type="number" min="0" placeholder="0"
            value={form.orderedCopies} onChange={e => setForm(p => ({ ...p, orderedCopies: e.target.value }))} />
        </Field>
      </div>

      {/* Receipt Status */}
      <div className="popup-section-head">📬 Receipt Status</div>
      <div className="popup-fields">
        <Field label="Number of copies received" required error={errors.received}>
          <input className="kf-input" type="number" min="0" placeholder="0"
            value={form.receivedCopies} onChange={e => setForm(p => ({ ...p, receivedCopies: e.target.value }))} />
        </Field>
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
        {(form.received === 'No' || form.received === 'Partial') && (
          <Field label="If not received — provide reason" required error={errors.notReceivedReason}>
            <textarea className={`kf-textarea${errors.notReceivedReason ? ' kf-input-err' : ''}`} rows={3}
              placeholder="Explain why copies were not received…"
              value={form.notReceivedReason} onChange={e => setForm(p => ({ ...p, notReceivedReason: e.target.value }))} />
          </Field>
        )}
        <Field label="How many copies were sponsored for the week?">
          <input className="kf-input" type="number" min="0" placeholder="0"
            value={form.sponsoredCopies} onChange={e => setForm(p => ({ ...p, sponsoredCopies: e.target.value }))} />
        </Field>
      </div>

      {/* Healing Outreaches */}
      <div className="popup-section-head">💊 Healing Outreaches</div>
      <div className="popup-fields">
        <Field label="How many Healing Outreaches were carried out this week?">
          <input className="kf-input" type="number" min="0" placeholder="0"
            value={form.healingOutreaches} onChange={e => setForm(p => ({ ...p, healingOutreaches: e.target.value }))} />
        </Field>
        <Field label="Upload pictures and videos from the Healing Outreach">
          <MediaUploader
            files={form.healingMedia}
            onAdd={files => {
              const prev = files.map(f => ({
                name: f.name, type: f.type,
                url: (f.type.startsWith('image') || f.type.startsWith('video')) ? URL.createObjectURL(f) : null,
                size: f.size,
              }));
              setForm(p => ({ ...p, healingMedia: [...p.healingMedia, ...prev] }));
            }}
            onRemove={i => setForm(p => ({ ...p, healingMedia: p.healingMedia.filter((_,j) => j !== i) }))}
            label="Upload Healing Outreach Photos & Videos"
            accept="image/*,video/*"
          />
        </Field>
      </div>

      {/* Notes */}
      <div className="popup-section-head">📝 Additional Notes</div>
      <div className="popup-fields">
        <Field label="Any other notes">
          <textarea className="kf-textarea" rows={2} placeholder="Any other notes…"
            value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
        </Field>
      </div>
    </FormPopup>
  );
}


// ══════════════════════════════════════════════════════
// OUTREACH REPORT FORM
// ══════════════════════════════════════════════════════
const OUTREACH_CATEGORIES = ['Healing', 'Soul-winning', 'HTTNM', 'Prison Outreach', 'School Outreach', 'Market Outreach', 'Hospital Outreach', 'Other'];

function OutreachForm({ onClose, onSubmit: parentSubmit }) {
  const [form, setForm] = useState({
    date: '',
    category: '',
    customCategory: '',
    locations: '',
    story: '',
    images: [],
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    const e = {};
    if (!form.date) e.date = 'Required';
    if (!form.category) e.category = 'Please select an outreach category';
    if (!form.locations.trim()) e.locations = 'Required';
    if (!form.story.trim()) e.story = 'Required';
    setErrors(e);
    if (Object.keys(e).length) return;
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 500));
    parentSubmit({
      date: formatDate(form.date),
      category: form.category === 'Other' ? form.customCategory || 'Other' : form.category,
      locations: form.locations,
      story: form.story.slice(0, 80) + (form.story.length > 80 ? '…' : ''),
      images: form.images.length,
      status: 'submitted',
      rawDate: form.date,
      media: form.images,
    });
    setSubmitting(false);
  };

  return (
    <FormPopup title="Outreach Activity Report" eyebrow="KingsForms · Outreach" icon="📍"
      onClose={onClose} onSubmit={handleSubmit} submitting={submitting} submitLabel="Submit Outreach Report">

      {/* Category */}
      <div className="popup-section-head">🏷️ Outreach Category</div>
      <div className="popup-fields">
        <Field label="What type of outreach was this?" required hint="(healing, soul-winning, etc.)" error={errors.category}>
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
          <Field label="Please specify outreach type">
            <input className="kf-input" placeholder="Enter outreach category…"
              value={form.customCategory} onChange={e => setForm(p => ({ ...p, customCategory: e.target.value }))} />
          </Field>
        )}
      </div>

      {/* Outreach Details */}
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

      {/* Story */}
      <div className="popup-section-head">📝 Outreach Story</div>
      <div className="popup-fields">
        <Field label="Tell the outreach story" required error={errors.story}>
          <textarea className={`kf-textarea${errors.story ? ' kf-input-err' : ''}`} rows={7}
            placeholder="Describe what happened — souls reached, testimonies heard, challenges, highlights…"
            value={form.story} onChange={e => setForm(p => ({ ...p, story: e.target.value }))} />
        </Field>
      </div>

      {/* Images */}
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
    FormComponent: ZonalReportForm, btnLabel: 'Upload a New Zonal Report',
  },
  {
    id: 'partnership', label: 'Partnership Report', icon: <Heart size={14} />, emoji: '🤝', color: '#16a34a',
    columns: [
      { key: 'id', label: 'Report ID' }, { key: 'rawDate', label: 'Date' },
      { key: 'arms', label: 'Arms' }, { key: 'totalRemittance', label: 'Remittance (Espees)' },
      { key: 'status', label: 'Status' },
    ],
    FormComponent: PartnershipForm, btnLabel: 'Upload a New Partnership Report',
  },
  {
    id: 'testimonials', label: 'Testimonials', icon: <BookOpen size={14} />, emoji: '✍️', color: '#d97706',
    columns: [
      { key: 'id', label: 'Report ID' }, { key: 'rawDate', label: 'Date' },
      { key: 'testimoniesCount', label: 'Count' },
      { key: 'testimony', label: 'Testimony (preview)' }, { key: 'status', label: 'Status' },
    ],
    FormComponent: TestimonialsForm, btnLabel: 'Upload a New Testimony',
  },
  {
    id: 'magazine', label: 'Magazine', icon: <Newspaper size={14} />, emoji: '📚', color: '#dc2626',
    columns: [
      { key: 'id', label: 'Report ID' }, { key: 'rawDate', label: 'Date' },
      { key: 'language', label: 'Language' }, { key: 'ordered', label: 'Ordered' },
      { key: 'receiptStatus', label: 'Received?' }, { key: 'status', label: 'Status' },
    ],
    FormComponent: MagazineForm, btnLabel: 'Upload a New Magazine Report',
  },
  {
    id: 'outreach', label: 'Outreach Report', icon: <FileText size={14} />, emoji: '📍', color: '#0891b2',
    columns: [
      { key: 'id', label: 'Report ID' }, { key: 'rawDate', label: 'Date' },
      { key: 'category', label: 'Category' },
      { key: 'locations', label: 'Location(s)' }, { key: 'story', label: 'Story (preview)' },
      { key: 'status', label: 'Status' },
    ],
    FormComponent: OutreachForm, btnLabel: 'Upload a New Outreach Report',
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
