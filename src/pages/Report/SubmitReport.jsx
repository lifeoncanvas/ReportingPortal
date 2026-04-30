// SubmitReport.jsx – Kingsforms weekly report form with upload/download
import React, { useState } from "react";
import { useAuth } from "../../auth/AuthContext";

const API = `${process.env.REACT_APP_API_URL}/api/reports`;
const ATTENDANCE_OPTIONS = ["Yes", "No", "Officially Excused"];

const initialForm = {
  zoneName: "",
  zonalManager: "",
  totalPartnershipRemittance: "",
  newPartnersRecruited: "",
  testimoniesSubmitted: "",
  httnmTranslations: "",
  httnmOutreaches: "",
  httnmMediaSubmitted: "",
  zonalPastorAttendance: "",
  zonalManagerDirectorMeeting: "",
  zonalManagerStrategyMeeting: "",
  sponsorshipHealingCrusade: "",
  notes: "",
};

const FIELDS = [
  {
    section: "Zone Information",
    icon: "🏛️",
    fields: [
      { key: "zoneName", label: "Name of Zone", type: "text", required: true },
      { key: "zonalManager", label: "Zonal Manager", type: "text", required: true }
    ]
  },
  {
    section: "Partnership & Recruitment",
    icon: "🤝",
    fields: [
      { key: "totalPartnershipRemittance", label: "Total Partnership Remittance for this week", type: "number", required: true, hint: "Weekly Target of 10,000 Espees" },
      { key: "newPartnersRecruited", label: "How many new partners were recruited?", type: "number", required: true, hint: "Target of 10 new partners weekly" }
    ]
  },
  {
    section: "Testimonies & HTTNM Outreach",
    icon: "📣",
    fields: [
      { key: "testimoniesSubmitted", label: "How many Testimonies were submitted to the Department?", type: "number", required: true, hint: "Target of 50 weekly" },
      { key: "httnmTranslations", label: "Total number of Healing translations achieved?", type: "number", required: true, hint: "Target of 2 weekly" },
      { key: "httnmOutreaches", label: "How many Healing outreaches held this week?", type: "number", required: true, hint: "Target of 10 weekly" },
      { key: "httnmMediaSubmitted", label: "How many pictures or videos from the Healing outreaches were submitted?", type: "number", required: true, hint: "Target of 10 weekly" }
    ]
  },
  {
    section: "Attendance",
    icon: "✅",
    fields: [
      { key: "zonalPastorAttendance", label: "Zonal Pastor's attendance in the Esteemed Director's weekly meeting?", type: "select", required: true },
      { key: "zonalManagerDirectorMeeting", label: "Zonal Manager's attendance in the Esteemed Director's weekly meeting?", type: "select", required: true },
      { key: "zonalManagerStrategyMeeting", label: "Zonal Manager's attendance in the weekly Managers strategy meeting?", type: "select", required: true }
    ]
  },
  {
    section: "Healing Crusade & Comments",
    icon: "✨",
    fields: [
      { key: "sponsorshipHealingCrusade", label: "How much Sponsorship was given for the Healing Crusade this week?", type: "number", required: true, hint: "Amount in Espees" },
      { key: "notes", label: "Any Testimony, Clarification or Concern?", type: "textarea", required: false }
    ]
  }
];

export default function SubmitReport() {
  const { user } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState(null);
  const [progress, setProgress] = useState(0);

  const requiredKeys = FIELDS.flatMap(s => s.fields.filter(f => f.required).map(f => f.key));
  const filled = requiredKeys.filter(k => form[k] !== "" && form[k] !== null).length;
  const pct = Math.round((filled / requiredKeys.length) * 100);

  const handleChange = (key, val) => {
    setForm(prev => ({ ...prev, [key]: val }));
    setErrors(prev => ({ ...prev, [key]: undefined }));
  };

  const validate = () => {
    const errs = {};
    requiredKeys.forEach(k => {
      if (form[k] === "" || form[k] === null) errs[k] = "This field is required";
    });
    return errs;
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setStatus("loading");
    try {
      const payload = {
        ...form,
        totalPartnershipRemittance: parseFloat(form.totalPartnershipRemittance) || 0,
        newPartnersRecruited: parseInt(form.newPartnersRecruited) || 0,
        testimoniesSubmitted: parseInt(form.testimoniesSubmitted) || 0,
        httnmTranslations: parseInt(form.httnmTranslations) || 0,
        httnmOutreaches: parseInt(form.httnmOutreaches) || 0,
        httnmMediaSubmitted: parseInt(form.httnmMediaSubmitted) || 0,
        sponsorshipHealingCrusade: parseFloat(form.sponsorshipHealingCrusade) || 0,
        submittedBy: user?.displayName || 'User',
        submitterEmail: user?.email || '',
        submittedDate: new Date().toISOString().split('T')[0],
        submittedTime: new Date().toISOString().split('T')[1].split('.')[0],
        weekStartDate: new Date().toISOString().split('T')[0],
      };
      const res = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error(await res.text());
      setStatus("success");
      setForm(initialForm);
    } catch (e) {
      console.error(e);
      setStatus("error");
    }
  };

  const downloadTemplate = () => {
    window.open(`${API}/template`, "_blank");
  };

  const exportExcel = () => {
    window.open(`${API}/export`, "_blank");
  };

  const handleUpload = async e => {
    const file = e.target.files[0];
    if (!file) return;
    setStatus("loading");
    setProgress(0);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", `${API}/upload`, true);
      xhr.upload.onprogress = ev => {
        if (ev.lengthComputable) {
          const percent = Math.round((ev.loaded / ev.total) * 100);
          setProgress(percent);
        }
      };
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) setStatus("success");
        else setStatus("error");
        setProgress(0);
      };
      xhr.onerror = () => {
        setStatus("error");
        setProgress(0);
      };
      xhr.send(formData);
    } catch (err) {
      console.error(err);
      setStatus("error");
      setProgress(0);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div style={styles.logo}>
          <span style={styles.logoIcon}>👑</span>
          <span style={styles.logoText}>KingsForms</span>
        </div>
        <div style={styles.headerActions}>
          <button onClick={downloadTemplate} style={styles.btnSecondary}>⬇ Download Template</button>
          <button onClick={exportExcel} style={styles.btnSecondary}>📊 Export All Reports</button>
        </div>
      </div>

      <div style={styles.progressWrap}>
        <div style={styles.progressBar}>
          <div style={{ ...styles.progressFill, width: `${pct}%` }} />
        </div>
        <span style={styles.progressLabel}>{pct}% Complete</span>
      </div>

      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <h1 style={styles.title}>OCTOBER WEEK 1 (7TH OCTOBER)</h1>
          <p style={styles.subtitle}>Please complete the fields below to submit your response. <span style={styles.asterisk}>*</span> All required fields are marked with an asterisk.</p>
        </div>
        {FIELDS.map(section => (
          <div key={section.section} style={styles.section}>
            <div style={styles.sectionHeader}>
              <span style={styles.sectionIcon}>{section.icon}</span>
              <span style={styles.sectionTitle}>{section.section}</span>
            </div>
            {section.fields.map(field => (
              <div key={field.key} style={styles.fieldRow}>
                <label style={styles.label}>
                  {field.label}
                  {field.required && <span style={styles.asterisk}> *</span>}
                  {field.hint && <span style={styles.hint}> ({field.hint})</span>}
                </label>
                {field.type === "select" ? (
                  <select
                    style={{ ...styles.input, ...(errors[field.key] ? styles.inputError : {}) }}
                    value={form[field.key]}
                    onChange={e => handleChange(field.key, e.target.value)}
                  >
                    <option value="">Please select</option>
                    {ATTENDANCE_OPTIONS.map(o => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                ) : field.type === "textarea" ? (
                  <textarea
                    style={{ ...styles.input, ...styles.textarea, ...(errors[field.key] ? styles.inputError : {}) }}
                    value={form[field.key]}
                    onChange={e => handleChange(field.key, e.target.value)}
                    rows={4}
                    placeholder="Type here…"
                  />
                ) : (
                  <input
                    type={field.type}
                    style={{ ...styles.input, ...(errors[field.key] ? styles.inputError : {}) }}
                    value={form[field.key]}
                    onChange={e => handleChange(field.key, e.target.value)}
                    placeholder={field.type === "number" ? "0" : "Type here…"}
                    min={field.type === "number" ? "0" : undefined}
                  />
                )}
                {errors[field.key] && <span style={styles.errorMsg}>⚠ {errors[field.key]}</span>}
              </div>
            ))}
          </div>
        ))}

        {/* Upload section */}
        <div style={styles.uploadSection}>
          <h2 style={styles.uploadTitle}>Upload CSV / Excel</h2>
          <p style={styles.uploadHint}>Select a filled template to import rows.</p>
          <input type="file" accept=".csv,.xlsx,.xls,.pdf,.doc,.docx" onChange={handleUpload} style={styles.fileInput} />
          {status === "loading" && progress > 0 && (
            <div style={styles.uploadProgress}>
              <div style={{ ...styles.uploadBar, width: `${progress}%` }} />
              <span>{progress}%</span>
            </div>
          )}
        </div>

        {status === "success" && <div style={styles.bannerSuccess}>✅ Report submitted successfully!</div>}
        {status === "error" && <div style={styles.bannerError}>❌ Submission failed.</div>}

        <div style={styles.actions}>
          <button onClick={handleSubmit} disabled={status === "loading"} style={{ ...styles.btnPrimary, opacity: status === "loading" ? 0.7 : 1 }}>
            {status === "loading" ? "Submitting…" : "Submit"}
          </button>
        </div>
        <p style={styles.footer}>Never submit passwords through KingsForms.<br/>This content is neither created nor endorsed by KingsForms.</p>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", background: "linear-gradient(160deg, #0d1b2a 0%, #1a2e45 60%, #0d1b2a 100%)", fontFamily: "'Georgia', 'Times New Roman', serif", paddingBottom: 60 },
  header: { background: "#0d1b2a", borderBottom: "2px solid #c8a951", padding: "0 24px" },
  logo: { display: "flex", alignItems: "center", gap: 8 },
  logoIcon: { fontSize: 22 },
  logoText: { color: "#c8a951", fontWeight: "bold", fontSize: 18, letterSpacing: 1 },
  headerActions: { display: "flex", gap: 10 },
  btnSecondary: { background: "transparent", color: "#c8a951", border: "1px solid #c8a951", padding: "8px 16px", fontSize: 12, fontWeight: "bold", borderRadius: 3, cursor: "pointer", letterSpacing: 0.5 },
  progressWrap: { maxWidth: 720, margin: "16px auto 0", padding: "0 24px", display: "flex", alignItems: "center", gap: 12 },
  progressBar: { flex: 1, height: 6, background: "rgba(255,255,255,0.15)", borderRadius: 3, overflow: "hidden" },
  progressFill: { height: "100%", background: "linear-gradient(90deg, #c8a951, #e8d080)", borderRadius: 3, transition: "width 0.4s ease" },
  progressLabel: { color: "#c8a951", fontSize: 12, fontWeight: "bold", minWidth: 80 },
  card: { maxWidth: 720, margin: "20px auto 0", background: "#ffffff", borderRadius: 4, overflow: "hidden", boxShadow: "0 8px 40px rgba(0,0,0,0.5)" },
  cardHeader: { background: "linear-gradient(135deg, #0d1b2a 0%, #1a3a5c 100%)", padding: "32px 32px 24px", borderBottom: "3px solid #c8a951" },
  title: { margin: 0, color: "#c8a951", fontSize: 22, fontWeight: "bold", letterSpacing: 1, textTransform: "uppercase" },
  subtitle: { marginTop: 8, color: "#a8c4dc", fontSize: 13, lineHeight: 1.6 },
  asterisk: { color: "#e05a5a", fontWeight: "bold" },
  section: { borderBottom: "1px solid #e8edf2" },
  sectionHeader: { background: "#1a2e45", padding: "10px 32px", display: "flex", alignItems: "center", gap: 10 },
  sectionIcon: { fontSize: 16 },
  sectionTitle: { color: "#ffffff", fontWeight: "bold", fontSize: 13, letterSpacing: 0.5, textTransform: "uppercase" },
  fieldRow: { padding: "16px 32px 4px", display: "flex", flexDirection: "column", gap: 6 },
  label: { fontSize: 14, color: "#1a1a1a", fontWeight: "600", lineHeight: 1.5 },
  hint: { fontWeight: "normal", color: "#888", fontSize: 12, fontStyle: "italic" },
  input: { width: "100%", padding: "10px 14px", border: "1.5px solid #d0d7de", borderRadius: 3, fontSize: 14, color: "#0d1b2a", background: "#fff", outline: "none", boxSizing: "border-box", transition: "border-color 0.2s" },
  inputError: { borderColor: "#e05a5a", background: "#fff8f8" },
  textarea: { resize: "vertical", minHeight: 90 },
  errorMsg: { color: "#e05a5a", fontSize: 12, marginBottom: 8 },
  bannerSuccess: { margin: "16px 32px", padding: "14px 20px", background: "#edfbf0", border: "1px solid #4caf50", borderRadius: 3, color: "#2e7d32", fontSize: 14, fontWeight: "bold" },
  bannerError: { margin: "16px 32px", padding: "14px 20px", background: "#fff3f3", border: "1px solid #e05a5a", borderRadius: 3, color: "#c62828", fontSize: 14, fontWeight: "bold" },
  actions: { padding: "24px 32px 8px", display: "flex", gap: 12 },
  btnPrimary: { background: "linear-gradient(135deg, #0d1b2a, #1a3a5c)", color: "#c8a951", border: "2px solid #c8a951", padding: "12px 40px", fontSize: 15, fontWeight: "bold", borderRadius: 3, cursor: "pointer", letterSpacing: 1, textTransform: "uppercase", transition: "all 0.2s" },
  uploadSection: { margin: "24px 32px", padding: "16px", background: "#f9f9f9", borderRadius: 4, border: "1px solid #e0e0e0" },
  uploadTitle: { margin: 0, fontSize: 16, fontWeight: "600", color: "#0d1b2a" },
  uploadHint: { fontSize: 13, color: "#555", marginBottom: 8 },
  fileInput: { marginTop: 4 },
  uploadProgress: { marginTop: 8, display: "flex", alignItems: "center", gap: 8 },
  uploadBar: { height: 6, flex: 1, background: "linear-gradient(90deg, #c8a951, #e8d080)", borderRadius: 3 },
  footer: { textAlign: "center", color: "#aaa", fontSize: 11, padding: "16px 32px 24px", lineHeight: 1.8 }
};
