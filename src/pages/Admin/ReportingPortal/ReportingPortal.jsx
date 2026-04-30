import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../auth/AuthContext';
import { Eye, Check, Trash2, MessageSquare, X, Download } from 'lucide-react';
import '../../GlobalMgr/ReportingPortal/styles.css';

const API = process.env.REACT_APP_API_URL || 'http://65.0.71.13:8080';

const TABS = [
  { id: 'zonal',        label: '🏛️ Zonal Reports',       endpoint: '/api/reports' },
  { id: 'partnership',  label: '🤝 Partnership',          endpoint: '/api/portal-reports/partnership' },
  { id: 'testimonials', label: '✍️ Testimonials',         endpoint: '/api/portal-reports/testimonials' },
  { id: 'magazine',     label: '📖 Magazine',             endpoint: '/api/portal-reports/magazine' },
  { id: 'outreach',     label: '📍 Outreach',             endpoint: '/api/portal-reports/outreach' },
];

const STATUS_COLORS = {
  PENDING:              { bg: '#fff7ed', color: '#ea580c', label: 'Pending' },
  APPROVED:             { bg: '#dcfce7', color: '#16a34a', label: 'Approved' },
  CLARIFICATION_NEEDED: { bg: '#fef9c3', color: '#a16207', label: 'Needs Clarification' },
  pending:              { bg: '#fff7ed', color: '#ea580c', label: 'Pending' },
  approved:             { bg: '#dcfce7', color: '#16a34a', label: 'Approved' },
  REJECTED:             { bg: '#fee2e2', color: '#dc2626', label: 'Rejected' },
};

function StatusBadge({ status }) {
  const s = STATUS_COLORS[status] || { bg: '#f3f4f6', color: '#374151', label: status };
  return (
    <span style={{ background: s.bg, color: s.color, padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
      {s.label}
    </span>
  );
}

function ViewModal({ report, onClose }) {
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ background:'#fff', borderRadius:16, padding:32, width:'90%', maxWidth:600, maxHeight:'80vh', overflowY:'auto', position:'relative' }}>
        <button onClick={onClose} style={{ position:'absolute', top:16, right:16, background:'none', border:'none', cursor:'pointer' }}>
          <X size={20} />
        </button>
        <h3 style={{ marginBottom:20, fontSize:18, fontWeight:700 }}>Report Details</h3>
        {Object.entries(report).map(([k, v]) => (
          v !== null && v !== undefined && (
            <div key={k} style={{ display:'flex', gap:12, padding:'8px 0', borderBottom:'1px solid #f3f4f6' }}>
              <span style={{ fontWeight:600, color:'#374151', minWidth:180, fontSize:13, textTransform:'capitalize' }}>
                {k.replace(/([A-Z])/g, ' $1').trim()}:
              </span>
              <span style={{ color:'#6b7280', fontSize:13 }}>{String(v)}</span>
            </div>
          )
        ))}
      </div>
    </div>
  );
}

function ClarificationModal({ report, endpoint, onClose, onDone }) {
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const send = async () => {
    if (!note.trim()) return;
    setLoading(true);
    await fetch(`${API}${endpoint}/${report.id}/clarification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ note }),
    });
    setLoading(false);
    onDone();
  };

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ background:'#fff', borderRadius:16, padding:32, width:'90%', maxWidth:480 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
          <h3 style={{ fontWeight:700, fontSize:16 }}>Ask for Clarification</h3>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer' }}><X size={18}/></button>
        </div>
        <p style={{ fontSize:13, color:'#6b7280', marginBottom:12 }}>
          Your note will be saved against this report and its status will be set to <strong>Needs Clarification</strong>.
        </p>
        <textarea
          rows={4}
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="Type your clarification request here..."
          style={{ width:'100%', padding:12, borderRadius:8, border:'1px solid #e5e7eb', fontSize:13, resize:'vertical', boxSizing:'border-box' }}
        />
        <div style={{ display:'flex', gap:8, marginTop:16, justifyContent:'flex-end' }}>
          <button onClick={onClose} style={{ padding:'8px 18px', borderRadius:8, border:'1px solid #e5e7eb', background:'#fff', cursor:'pointer' }}>Cancel</button>
          <button onClick={send} disabled={loading} style={{ padding:'8px 18px', borderRadius:8, border:'none', background:'#f59e0b', color:'#fff', fontWeight:600, cursor:'pointer' }}>
            {loading ? 'Sending…' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminReportingPortal() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('zonal');
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewReport, setViewReport] = useState(null);
  const [clarifyReport, setClarifyReport] = useState(null);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState('');

  const tab = TABS.find(t => t.id === activeTab);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const url = activeTab === 'zonal'
        ? `${API}${tab.endpoint}?email=${user?.email}`
        : `${API}${tab.endpoint}?email=${user?.email}`;
      const res = await fetch(url);
      const data = await res.json();
      setReports(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setReports([]);
    }
    setLoading(false);
  };

  useEffect(() => { fetchReports(); }, [activeTab]);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const handleApprove = async (id) => {
    await fetch(`${API}${tab.endpoint}/${id}/approve`, { method: 'POST' });
    showToast('Report approved ✅');
    fetchReports();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this report? This cannot be undone.')) return;
    await fetch(`${API}${tab.endpoint}/${id}`, { method: 'DELETE' });
    showToast('Report deleted 🗑️');
    fetchReports();
  };

  const handleExport = () => {
    if (activeTab === 'zonal') {
      // Use the backend Excel export endpoint for zonal reports
      window.open(`${API}/api/reports/export?email=${user?.email}`, '_blank');
      return;
    }
    // CSV export for all other tabs
    if (filtered.length === 0) { showToast('No data to export'); return; }
    const keys = Object.keys(filtered[0]);
    const csvRows = [
      keys.join(','),
      ...filtered.map(r =>
        keys.map(k => {
          const val = r[k] === null || r[k] === undefined ? '' : String(r[k]);
          return `"${val.replace(/"/g, '""')}"`;
        }).join(',')
      ),
    ];
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `${activeTab}-reports-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Export downloaded 📥');
  };

  const filtered = reports.filter(r =>
    Object.values(r).some(v => String(v || '').toLowerCase().includes(search.toLowerCase()))
  );

  // Build readable summary per tab
  const getSummary = (r) => {
    switch (activeTab) {
      case 'zonal':       return `${r.zoneName || '—'} · ${r.zonalManager || r.submittedBy || '—'}`;
      case 'partnership': return `Total: ${r.totalRemittance || r.total_remittance || '—'} · Arms: ${r.arms || '—'}`;
      case 'testimonials':return `Testimonies: ${r.testimoniesCount || '—'} · Media: ${(r.beforeImages||0)+(r.afterImages||0)}`;
      case 'magazine':    return `${r.language || '—'} · Ordered: ${r.ordered || r.orderedCopies || '—'} · Received: ${r.received || r.receivedCopies || '—'}`;
      case 'outreach':    return `${r.category || '—'} · Locations: ${r.locations || '—'}`;
      default: return '';
    }
  };

  return (
    <div className="rp-page">
      {/* Toast */}
      {toast && (
        <div style={{ position:'fixed', top:20, right:20, background:'#1e293b', color:'#fff', padding:'12px 20px', borderRadius:10, zIndex:9999, fontSize:14 }}>
          {toast}
        </div>
      )}

      {viewReport && <ViewModal report={viewReport} onClose={() => setViewReport(null)} />}
      {clarifyReport && (
        <ClarificationModal
          report={clarifyReport}
          endpoint={tab.endpoint}
          onClose={() => setClarifyReport(null)}
          onDone={() => { setClarifyReport(null); showToast('Clarification request sent 💬'); fetchReports(); }}
        />
      )}

      {/* Header */}
      <div style={{ marginBottom:24, display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
        <div>
          <h2 style={{ fontWeight:800, fontSize:22, margin:0 }}>Reporting Portal — Admin View</h2>
          <p style={{ color:'#6b7280', fontSize:14, margin:'4px 0 0' }}>Review, approve, and manage all submitted reports</p>
        </div>
        <button
          onClick={handleExport}
          style={{ display:'flex', alignItems:'center', gap:6, padding:'9px 18px', borderRadius:8, border:'none',
            background:'#1e293b', color:'#fff', fontWeight:600, fontSize:13, cursor:'pointer' }}
        >
          <Download size={14} /> Export {activeTab === 'zonal' ? 'Excel' : 'CSV'}
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:20 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
            padding:'8px 16px', borderRadius:20, border:'none', cursor:'pointer', fontSize:13, fontWeight:600,
            background: activeTab === t.id ? '#1e293b' : '#f1f5f9',
            color: activeTab === t.id ? '#fff' : '#374151',
          }}>{t.label}</button>
        ))}
      </div>

      {/* Search + Stats */}
      <div style={{ display:'flex', gap:12, alignItems:'center', marginBottom:16, flexWrap:'wrap' }}>
        <input
          placeholder="Search reports..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ padding:'8px 14px', borderRadius:8, border:'1px solid #e5e7eb', fontSize:13, minWidth:220 }}
        />
        <span style={{ fontSize:13, color:'#6b7280' }}>{filtered.length} report(s)</span>
        <span style={{ marginLeft:'auto', fontSize:13, color:'#16a34a', fontWeight:600 }}>
          ✅ {reports.filter(r => r.status === 'APPROVED').length} Approved
        </span>
        <span style={{ fontSize:13, color:'#ea580c', fontWeight:600 }}>
          ⏳ {reports.filter(r => r.status === 'PENDING' || r.status === 'pending').length} Pending
        </span>
        <span style={{ fontSize:13, color:'#a16207', fontWeight:600 }}>
          💬 {reports.filter(r => r.status === 'CLARIFICATION_NEEDED').length} Need Clarification
        </span>
      </div>

      {/* Table */}
      <div style={{ background:'#fff', borderRadius:12, border:'1px solid #e5e7eb', overflow:'hidden' }}>
        {loading ? (
          <div style={{ padding:40, textAlign:'center', color:'#9ca3af', fontSize:14 }}>Loading reports…</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding:40, textAlign:'center', color:'#9ca3af', fontSize:14 }}>No reports found.</div>
        ) : (
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
              <thead>
                <tr style={{ background:'#f8fafc', borderBottom:'1px solid #e5e7eb' }}>
                  <th style={{ padding:'12px 16px', textAlign:'left', fontWeight:700, color:'#374151' }}>ID</th>
                  <th style={{ padding:'12px 16px', textAlign:'left', fontWeight:700, color:'#374151' }}>Submitted By</th>
                  <th style={{ padding:'12px 16px', textAlign:'left', fontWeight:700, color:'#374151' }}>Summary</th>
                  <th style={{ padding:'12px 16px', textAlign:'left', fontWeight:700, color:'#374151' }}>Date</th>
                  <th style={{ padding:'12px 16px', textAlign:'left', fontWeight:700, color:'#374151' }}>Status</th>
                  <th style={{ padding:'12px 16px', textAlign:'center', fontWeight:700, color:'#374151' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, i) => (
                  <tr key={r.id || i} style={{ borderBottom:'1px solid #f3f4f6' }}>
                    <td style={{ padding:'12px 16px', color:'#818cf8', fontWeight:700 }}>#{r.id || (i+1)}</td>
                    <td style={{ padding:'12px 16px' }}>
                      <div style={{ fontWeight:600, color:'#1e293b' }}>{r.submitterEmail || r.submittedBy || '—'}</div>
                      {r.zoneName && <div style={{ fontSize:11, color:'#9ca3af' }}>{r.zoneName}</div>}
                    </td>
                    <td style={{ padding:'12px 16px', color:'#6b7280', maxWidth:220 }}>{getSummary(r)}</td>
                    <td style={{ padding:'12px 16px', color:'#6b7280' }}>
                      {r.submittedDate || r.submittedAt?.split('T')[0] || '—'}
                    </td>
                    <td style={{ padding:'12px 16px' }}><StatusBadge status={r.status} /></td>
                    <td style={{ padding:'12px 16px' }}>
                      <div style={{ display:'flex', gap:6, justifyContent:'center' }}>
                        {/* View */}
                        <button onClick={() => setViewReport(r)} title="View details" style={{ padding:'5px 8px', borderRadius:6, border:'1px solid #e5e7eb', background:'#f8fafc', cursor:'pointer' }}>
                          <Eye size={14} color="#374151" />
                        </button>
                        {/* Approve */}
                        {r.status !== 'APPROVED' && (
                          <button onClick={() => handleApprove(r.id)} title="Approve" style={{ padding:'5px 8px', borderRadius:6, border:'1px solid #bbf7d0', background:'#dcfce7', cursor:'pointer' }}>
                            <Check size={14} color="#16a34a" />
                          </button>
                        )}
                        {/* Clarification */}
                        <button onClick={() => setClarifyReport(r)} title="Ask for clarification" style={{ padding:'5px 8px', borderRadius:6, border:'1px solid #fde68a', background:'#fef9c3', cursor:'pointer' }}>
                          <MessageSquare size={14} color="#a16207" />
                        </button>
                        {/* Delete */}
                        <button onClick={() => handleDelete(r.id)} title="Delete" style={{ padding:'5px 8px', borderRadius:6, border:'1px solid #fecaca', background:'#fee2e2', cursor:'pointer' }}>
                          <Trash2 size={14} color="#dc2626" />
                        </button>
                      </div>
                      {r.adminNote && (
                        <div style={{ fontSize:11, color:'#a16207', marginTop:4, maxWidth:180 }}>
                          💬 {r.adminNote}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}