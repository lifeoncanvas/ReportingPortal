import React, { useState } from 'react';
import { ShoppingCart, Package, Bell, CheckCircle, ChevronRight, CreditCard, Upload, AlertCircle, X, Plus } from 'lucide-react';
import { useSettings } from '../../../context/SettingsContext';
import { useNotifications } from '../../../context/NotificationContext';
import { useToast } from '../../../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import './styles.css';

const MAGAZINE_TYPES = [
  { id: 'adult',    name: 'Rhapsody of Realities', subtitle: 'Adult Edition',      color: '#4f46e5', bg: 'rgba(79,70,229,0.1)',  price: 2.50, icon: '📖' },
  { id: 'teen',     name: 'Rhapsody of Realities', subtitle: 'Teens Edition',      color: '#0284c7', bg: 'rgba(2,132,199,0.1)',  price: 2.00, icon: '📗' },
  { id: 'children', name: 'Rhapsody of Realities', subtitle: "Children's Edition", color: '#16a34a', bg: 'rgba(22,163,74,0.1)',  price: 1.50, icon: '📘' },
];

const AVAILABLE_LANGUAGES = [
  'English', 'French', 'Spanish', 'Portuguese', 'Hindi',
  'Mandarin Chinese', 'Modern Standard Arabic',
  'Indonesian', 'Bengali', 'Russian', 'Yoruba', 'Igbo', 'Hausa',
];

const STEPS = ['Select Magazines', 'Review Order', 'Payment', 'Order Placed'];

const PAYMENT_METHODS = [
  { id: 'bank',   label: 'Bank Transfer',       icon: '🏦' },
  { id: 'card',   label: 'Debit / Credit Card', icon: '💳' },
  { id: 'mobile', label: 'Mobile Money',        icon: '📱' },
];

const MOCK_ORDERS = [
  {
    id: 'ORD-001', date: '2026-03-01', status: 'delivered',
    items: [{ type: 'Adult', qty: 50, lang: ['English'] }],
    total: 125, paymentRef: 'TXN-2026030101',
  },
  {
    id: 'ORD-002', date: '2026-03-15', status: 'processing',
    items: [
      { type: 'Teen',     qty: 30, lang: ['French', 'English'] },
      { type: 'Children', qty: 20, lang: ['English'] },
    ],
    total: 90, paymentRef: 'TXN-2026031502',
  },
];

const STATUS_COLORS = {
  pending:    { bg: 'rgba(234,179,8,0.12)',  color: '#ca8a04' },
  processing: { bg: 'rgba(79,70,229,0.12)',  color: '#818cf8' },
  invoiced:   { bg: 'rgba(2,132,199,0.12)',  color: '#0284c7' },
  approved:   { bg: 'rgba(22,163,74,0.12)',  color: '#16a34a' },
  shipped:    { bg: 'rgba(124,58,237,0.12)', color: '#7c3aed' },
  delivered:  { bg: 'rgba(22,163,74,0.12)',  color: '#16a34a' },
};

const STATUS_TIMELINE = [
  { key: 'pending',    icon: '📋', label: 'Order Placed',     desc: 'Order received and under review'   },
  { key: 'invoiced',   icon: '💳', label: 'Invoice Sent',     desc: 'Invoice sent by Global Manager'    },
  { key: 'approved',   icon: '✅', label: 'Payment Verified', desc: 'Payment confirmed by finance team' },
  { key: 'processing', icon: '🖨️', label: 'Printing',         desc: 'Magazines being printed'           },
  { key: 'shipped',    icon: '📦', label: 'Shipped',          desc: 'Order dispatched for delivery'     },
  { key: 'delivered',  icon: '🚚', label: 'Delivered',        desc: 'Order delivered to your zone'      },
];

// ── Order Preview Modal ────────────────────────────────────────
function OrderModal({ order, onClose, currSymbol }) {
  if (!order) return null;
  const sc          = STATUS_COLORS[order.status] || STATUS_COLORS.pending;
  const currentStep = STATUS_TIMELINE.findIndex(s => s.key === order.status);
  return (
    <div className="mg-modal-overlay" onClick={onClose}>
      <div className="mg-modal" onClick={e => e.stopPropagation()}>
        <div className="mg-modal-header">
          <div><h3>{order.id}</h3><p>Placed on {order.date}</p></div>
          <button className="mg-modal-close" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="mg-modal-status-row">
          <span>Current Status</span>
          <span className="mg-status-badge" style={{ background: sc.bg, color: sc.color }}>
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </span>
        </div>
        <div className="mg-modal-section">
          <div className="mg-modal-section-title">Order Items</div>
          <table className="mg-review-table">
            <thead><tr><th>Type</th><th>Languages</th><th>Qty</th></tr></thead>
            <tbody>
              {order.items.map((item, i) => (
                <tr key={i}>
                  <td>{item.type} Edition</td>
                  <td><div className="mg-lang-tags">{item.lang.map(l => <span className="mg-lang-tag" key={l}>{l}</span>)}</div></td>
                  <td><strong>{item.qty}</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mg-modal-meta">
          <div className="mg-modal-meta-row"><span>Order Total</span><strong>{currSymbol}{order.total}</strong></div>
          {order.paymentRef && <div className="mg-modal-meta-row"><span>Payment Reference</span><strong>{order.paymentRef}</strong></div>}
        </div>
        <div className="mg-modal-section">
          <div className="mg-modal-section-title">Order Progress</div>
          <div className="mg-timeline">
            {STATUS_TIMELINE.map((s, i) => {
              const done = i <= currentStep; const active = i === currentStep;
              return (
                <div className={`mg-timeline-item ${done?'done':''} ${active?'active':''}`} key={s.key}>
                  <div className="mg-timeline-left">
                    <div className="mg-timeline-dot">{done ? <CheckCircle size={13} /> : <span>{i+1}</span>}</div>
                    {i < STATUS_TIMELINE.length - 1 && <div className="mg-timeline-line" />}
                  </div>
                  <div className="mg-timeline-body">
                    <span className="mg-timeline-icon">{s.icon}</span>
                    <div><div className="mg-timeline-label">{s.label}</div><div className="mg-timeline-desc">{s.desc}</div></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Language Selector: pick languages first, qty controls appear per language ─
function LangSelector({ magId, color, langQtys, onToggleLang, onChangeQty }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const selectedLangs = Object.keys(langQtys);
  const unselected    = AVAILABLE_LANGUAGES.filter(l => !langQtys.hasOwnProperty(l));

  return (
    <div className="mg-lang-selector">

      {/* Add language button + dropdown */}
      {unselected.length > 0 && (
        <div className="mg-lang-add-wrap">
          <button
            className={`mg-lang-add-trigger ${dropdownOpen ? 'open' : ''}`}
            style={dropdownOpen ? { borderColor: color, color } : {}}
            onClick={() => setDropdownOpen(p => !p)}
          >
            <Plus size={12} /> Add language
          </button>
          {dropdownOpen && (
            <div className="mg-lang-dropdown">
              {unselected.map(lang => (
                <button
                  key={lang}
                  className="mg-lang-dropdown-item"
                  onClick={() => { onToggleLang(magId, lang); setDropdownOpen(false); }}
                >
                  {lang}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Per-language quantity rows */}
      {selectedLangs.length > 0 ? (
        <div className="mg-lang-qty-list">
          {selectedLangs.map(lang => (
            <div className="mg-lang-qty-row" key={lang}>
              <div className="mg-lang-qty-name-wrap">
                <span className="mg-lang-qty-dot" style={{ background: color }} />
                <span className="mg-lang-qty-name">{lang}</span>
                {selectedLangs.length > 1 && (
                  <button className="mg-lang-qty-remove" onClick={() => onToggleLang(magId, lang)} title="Remove">
                    <X size={10} />
                  </button>
                )}
              </div>
              <div className="mg-lang-qty-ctrl">
                <button onClick={() => onChangeQty(magId, lang, -10)}>−10</button>
                <button onClick={() => onChangeQty(magId, lang, -1)}>−</button>
                <span>{langQtys[lang]}</span>
                <button onClick={() => onChangeQty(magId, lang, 1)}>+</button>
                <button onClick={() => onChangeQty(magId, lang, 10)}>+10</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="mg-lang-empty-hint">Click "Add language" to begin</p>
      )}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────
export default function Magazine() {
  const { t, currSymbol } = useSettings();
  const { addNotification } = useNotifications();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [view, setView]           = useState('home');
  const [step, setStep]           = useState(0);
  const [orders, setOrders]       = useState(MOCK_ORDERS);
  const [viewOrder, setViewOrder] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentRef,    setPaymentRef]    = useState('');
  const [proofFile,     setProofFile]     = useState(null);
  const [paymentError,  setPaymentError]  = useState('');
  const [paymentDone,   setPaymentDone]   = useState(false);

  // State: { adult: { langQtys: { English: 0 } }, ... }
  const [selections, setSelections] = useState(
    MAGAZINE_TYPES.reduce((acc, m) => ({
      ...acc,
      [m.id]: { langQtys: { English: 0 } },
    }), {})
  );

  // Toggle a language on/off; adding sets qty to 0, removing enforces min-1
  const toggleLang = (id, lang) =>
    setSelections(p => {
      const current = { ...p[id].langQtys };
      if (current.hasOwnProperty(lang)) {
        if (Object.keys(current).length > 1) delete current[lang];
      } else {
        current[lang] = 0;
      }
      return { ...p, [id]: { langQtys: current } };
    });

  const changeQty = (id, lang, delta) =>
    setSelections(p => {
      const current = { ...p[id].langQtys };
      current[lang] = Math.max(0, (current[lang] || 0) + delta);
      return { ...p, [id]: { langQtys: current } };
    });

  // One line per magazine; qty = sum of all per-language quantities
  const orderLines = MAGAZINE_TYPES
    .map(m => {
      const { langQtys } = selections[m.id];
      const qty      = Object.values(langQtys).reduce((s, q) => s + q, 0);
      const languages = Object.keys(langQtys).filter(l => langQtys[l] > 0);
      return { ...m, qty, languages, langQtys, subtotal: qty * m.price };
    })
    .filter(l => l.qty > 0);

  const subtotal       = orderLines.reduce((s, l) => s + l.subtotal, 0);
  const deliveryCharge = subtotal > 200 ? 0 : 25;
  const tax            = subtotal * 0.075;
  const total          = subtotal + deliveryCharge + tax;

  const handleConfirmPayment = () => {
    setPaymentError('');
    if (!paymentMethod)     return setPaymentError('Please select a payment method.');
    if (!paymentRef.trim()) return setPaymentError('Please enter your payment reference / transaction ID.');
    if (!proofFile)         return setPaymentError('Please upload proof of payment.');

    const newOrder = {
      id:         `ORD-${String(orders.length + 1).padStart(3, '0')}`,
      date:       new Date().toISOString().split('T')[0],
      status:     'pending',
      items:      orderLines.map(l => ({ type: l.subtitle.split(' ')[0], qty: l.qty, lang: l.languages })),
      total:      Math.round(total * 100) / 100,
      paymentRef: paymentRef.trim(),
    };
    setOrders(prev => [newOrder, ...prev]);

    showToast({
      icon: '📖', title: 'Order Placed Successfully!',
      message: `Order ${newOrder.id} · ${orderLines.reduce((s,l)=>s+l.qty,0)} magazines · ${currSymbol}${newOrder.total}`,
      onClick: () => navigate('/zonal/notifications'),
    });
    addNotification({
      icon: 'magazine', role: 'all', title: 'Magazine Order Placed',
      message: `Order ${newOrder.id} for ${orderLines.reduce((s,l)=>s+l.qty,0)} magazines (${currSymbol}${newOrder.total}) has been placed successfully and is awaiting review.`,
    });
    addNotification({
      icon: 'magazine', role: 'global_admin', title: 'New Magazine Order — Action Required',
      message: `Zonal Manager placed Order ${newOrder.id} for ${orderLines.reduce((s,l)=>s+l.qty,0)} magazines totalling ${currSymbol}${newOrder.total}. Please review and send invoice.`,
    });

    setPaymentDone(true);
    setStep(3);
  };

  const resetOrder = () => {
    setSelections(MAGAZINE_TYPES.reduce((acc, m) => ({ ...acc, [m.id]: { langQtys: { English: 0 } } }), {}));
    setStep(0); setPaymentMethod(''); setPaymentRef('');
    setProofFile(null); setPaymentError(''); setPaymentDone(false); setView('home');
  };

  return (
    <div className="mg-page">

      <div className="mg-page-header">
        <div>
          <h2>{t?.magazine || 'Magazine'}</h2>
          <p>Order Rhapsody of Realities magazines for your zone</p>
        </div>
        {view === 'home' && (
          <button className="mg-order-btn" onClick={() => setView('order')}>
            <ShoppingCart size={16} /> {t?.placeOrder || 'Place Order'}
          </button>
        )}
        {view === 'order' && step < 3 && (
          <button className="mg-back-btn" onClick={() => { setView('home'); setStep(0); }}>← Back</button>
        )}
      </div>

      {/* HOME VIEW */}
      {view === 'home' && (
        <>
          <div className="mg-stats">
            {[
              { label: 'Total Orders',  value: orders.length,                                        color: 'var(--text-primary)' },
              { label: 'Pending',       value: orders.filter(o => o.status === 'pending').length,    color: '#ca8a04' },
              { label: 'Processing',    value: orders.filter(o => o.status === 'processing').length, color: '#4f46e5' },
              { label: 'Delivered',     value: orders.filter(o => o.status === 'delivered').length,  color: '#16a34a' },
            ].map(s => (
              <div className="mg-stat-card" key={s.label}>
                <div className="mg-stat-label">{s.label}</div>
                <div className="mg-stat-value" style={{ color: s.color }}>{s.value}</div>
              </div>
            ))}
          </div>
          <div className="mg-panel">
            <h3>My Orders</h3>
            {orders.length === 0 ? (
              <div className="mg-empty">
                <Package size={32} color="var(--text-muted)" />
                <p>No orders yet. Place your first order!</p>
                <button className="mg-order-btn" onClick={() => setView('order')}>Place Order</button>
              </div>
            ) : (
              <table className="mg-table">
                <thead><tr><th>Order ID</th><th>Date</th><th>Items</th><th>Total</th><th>Status</th><th>Action</th></tr></thead>
                <tbody>
                  {orders.map(o => {
                    const sc = STATUS_COLORS[o.status] || STATUS_COLORS.pending;
                    return (
                      <tr key={o.id}>
                        <td className="mg-id" data-label="Order ID">{o.id}</td>
                        <td data-label="Date">{o.date}</td>
                        <td data-label="Items">{o.items.map((item,i) => <div key={i} style={{fontSize:'0.8rem',color:'var(--text-secondary)'}}>{item.qty}× {item.type} ({item.lang.join(', ')})</div>)}</td>
                        <td className="mg-amount" data-label="Total">{currSymbol}{o.total}</td>
                        <td data-label="Status"><span className="mg-status-badge" style={{background:sc.bg,color:sc.color}}>{o.status.charAt(0).toUpperCase()+o.status.slice(1)}</span></td>
                        <td data-label="Action"><button className="mg-view-btn" onClick={() => setViewOrder(o)}>View</button></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {/* ORDER FLOW */}
      {view === 'order' && (
        <div className="mg-order-flow">
          {step < 3 && (
            <div className="mg-stepper">
              {STEPS.slice(0, 3).map((s, i) => (
                <React.Fragment key={s}>
                  <div className={`mg-step ${step===i?'active':''} ${step>i?'done':''}`}>
                    <div className="mg-step-circle">{step > i ? <CheckCircle size={16} /> : i + 1}</div>
                    <span>{s}</span>
                  </div>
                  {i < 2 && <div className={`mg-step-line ${step>i?'done':''}`} />}
                </React.Fragment>
              ))}
            </div>
          )}

          {/* STEP 0 */}
          {step === 0 && (
            <>
              <div className="mg-mag-grid">
                {MAGAZINE_TYPES.map(m => {
                  const { langQtys }  = selections[m.id];
                  const totalQty      = Object.values(langQtys).reduce((s, q) => s + q, 0);
                  const subtotalLine  = totalQty * m.price;
                  const selectedCount = Object.keys(langQtys).length;
                  return (
                    <div className="mg-mag-card" key={m.id}>
                      <div className="mg-mag-header" style={{ background: m.bg }}>
                        <span className="mg-mag-emoji">{m.icon}</span>
                        <div>
                          <div className="mg-mag-name">{m.name}</div>
                          <div className="mg-mag-sub" style={{ color: m.color }}>{m.subtitle}</div>
                        </div>
                        <div className="mg-mag-price">{currSymbol}{m.price.toFixed(2)}<span>/copy</span></div>
                      </div>
                      <div className="mg-mag-body">
                        <div className="mg-lang-section">
                          <label>
                            Languages
                            {selectedCount > 0 && (
                              <span className="mg-lang-count-badge" style={{ background: m.bg, color: m.color }}>
                                {selectedCount} selected
                              </span>
                            )}
                          </label>
                          <LangSelector
                            magId={m.id}
                            color={m.color}
                            langQtys={langQtys}
                            onToggleLang={toggleLang}
                            onChangeQty={changeQty}
                          />
                        </div>
                        {totalQty > 0 && (
                          <div className="mg-line-total">
                            Subtotal: <strong>{currSymbol}{subtotalLine.toFixed(2)}</strong>
                            <span className="mg-line-note">({totalQty} copies × {currSymbol}{m.price})</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mg-step-footer">
                <div className="mg-running-total">
                  {orderLines.length > 0
                    ? `${orderLines.reduce((s,l)=>s+l.qty,0)} magazines · ${currSymbol}${subtotal.toFixed(2)} est.`
                    : 'Select magazines above'}
                </div>
                <button className="mg-order-btn" disabled={orderLines.length === 0} onClick={() => setStep(1)}>
                  Review Order <ChevronRight size={15} />
                </button>
              </div>
            </>
          )}

          {/* STEP 1 */}
          {step === 1 && (
            <div className="mg-review">
              <div className="mg-panel">
                <h3>Order Summary</h3>
                <table className="mg-review-table">
                  <thead><tr><th>Magazine</th><th>Languages & Qty</th><th>Total Copies</th><th>Price/copy</th><th>Subtotal</th></tr></thead>
                  <tbody>
                    {orderLines.map(l => (
                      <tr key={l.id}>
                        <td><span className="mg-mag-emoji-sm">{l.icon}</span>{l.subtitle}</td>
                        <td>
                          <div className="mg-lang-qty-review">
                            {Object.entries(l.langQtys).filter(([,q])=>q>0).map(([lang,qty]) => (
                              <span className="mg-lang-qty-pill" key={lang}>{lang} <strong>×{qty}</strong></span>
                            ))}
                          </div>
                        </td>
                        <td>{l.qty}</td>
                        <td>{currSymbol}{l.price.toFixed(2)}</td>
                        <td><strong>{currSymbol}{l.subtotal.toFixed(2)}</strong></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="mg-invoice">
                  <div className="mg-invoice-row"><span>Subtotal</span><span>{currSymbol}{subtotal.toFixed(2)}</span></div>
                  <div className="mg-invoice-row"><span>Delivery</span><span>{deliveryCharge===0?'Free':`${currSymbol}${deliveryCharge.toFixed(2)}`}</span></div>
                  <div className="mg-invoice-row"><span>Tax (7.5%)</span><span>{currSymbol}{tax.toFixed(2)}</span></div>
                  <div className="mg-invoice-divider" />
                  <div className="mg-invoice-row mg-invoice-total"><span>Total</span><span>{currSymbol}{total.toFixed(2)}</span></div>
                </div>
                <div className="mg-notice"><Bell size={14} />Please proceed to payment. Your order will only be placed after payment is confirmed.</div>
              </div>
              <div className="mg-step-footer">
                <button className="mg-back-btn" onClick={() => setStep(0)}>← Edit Order</button>
                <button className="mg-order-btn" onClick={() => setStep(2)}>Proceed to Payment <ChevronRight size={15} /></button>
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="mg-review">
              <div className="mg-panel">
                <h3 style={{display:'flex',alignItems:'center',gap:8}}><CreditCard size={18} /> Payment</h3>
                <div className="mg-payment-amount"><span>Amount Due</span><strong>{currSymbol}{total.toFixed(2)}</strong></div>
                <div className="mg-payment-section">
                  <label className="mg-payment-label">Select Payment Method</label>
                  <div className="mg-payment-methods">
                    {PAYMENT_METHODS.map(pm => (
                      <button key={pm.id} className={`mg-payment-method-btn ${paymentMethod===pm.id?'selected':''}`} onClick={() => setPaymentMethod(pm.id)}>
                        <span>{pm.icon}</span> {pm.label}
                      </button>
                    ))}
                  </div>
                </div>
                {paymentMethod === 'bank' && (
                  <div className="mg-bank-details">
                    <p className="mg-bank-title">Transfer to:</p>
                    <div className="mg-bank-row"><span>Bank Name</span><strong>Loveworld Bank</strong></div>
                    <div className="mg-bank-row"><span>Account Name</span><strong>Loveworld Incorporated</strong></div>
                    <div className="mg-bank-row"><span>Account Number</span><strong>0123456789</strong></div>
                    <div className="mg-bank-row"><span>Amount</span><strong>{currSymbol}{total.toFixed(2)}</strong></div>
                  </div>
                )}
                <div className="mg-payment-section">
                  <label className="mg-payment-label">Transaction / Reference ID <span className="mg-required">*</span></label>
                  <input className="mg-payment-input" placeholder="e.g. TXN-20240119-001" value={paymentRef} onChange={e => setPaymentRef(e.target.value)} />
                </div>
                <div className="mg-payment-section">
                  <label className="mg-payment-label">Upload Proof of Payment <span className="mg-required">*</span></label>
                  <label className="mg-upload-zone">
                    <input type="file" accept="image/*,.pdf" style={{display:'none'}} onChange={e => setProofFile(e.target.files[0]||null)} />
                    {proofFile
                      ? <div className="mg-upload-done"><CheckCircle size={18} color="#16a34a" /><span>{proofFile.name}</span></div>
                      : <div className="mg-upload-prompt"><Upload size={20} /><span>Click to upload receipt / screenshot</span><small>PNG, JPG, PDF accepted</small></div>}
                  </label>
                </div>
                {paymentError && <div className="mg-payment-error"><AlertCircle size={15} /> {paymentError}</div>}
                <div className="mg-notice"><Bell size={14} />Your order will only be placed once payment details are submitted and verified.</div>
              </div>
              <div className="mg-step-footer">
                <button className="mg-back-btn" onClick={() => setStep(1)}>← Back to Review</button>
                <button className="mg-order-btn" onClick={handleConfirmPayment}>Confirm Payment & Place Order <ChevronRight size={15} /></button>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && paymentDone && (
            <div className="mg-success">
              <div className="mg-success-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <h2>Order Placed Successfully!</h2>
              <p>Your order <strong>{orders[0]?.id}</strong> has been submitted.</p>
              <p style={{fontSize:'0.85rem',color:'#6b7280',marginTop:4}}>Payment reference: <strong>{paymentRef}</strong></p>
              <div className="mg-success-steps">
                {[
                  {icon:'💳',label:'Payment Submitted',desc:'Your payment proof has been uploaded',done:true},
                  {icon:'📋',label:'Order Received',   desc:'Your order is being reviewed',       done:true},
                  {icon:'✅',label:'Payment Verified', desc:'Finance team will verify your payment',done:false},
                  {icon:'🖨️',label:'Printing',          desc:'Printing department notified',       done:false},
                  {icon:'🚚',label:'Shipping',          desc:'Expected delivery: 7–14 business days',done:false},
                ].map((s,i) => (
                  <div className={`mg-track-step ${s.done?'done':''}`} key={i}>
                    <div className="mg-track-icon">{s.icon}</div>
                    <div><div className="mg-track-label">{s.label}</div><div className="mg-track-desc">{s.desc}</div></div>
                    {s.done && <CheckCircle size={16} color="#16a34a" style={{marginLeft:'auto'}} />}
                  </div>
                ))}
              </div>
              <div className="mg-success-notice"><Bell size={14} />You'll receive notifications as your order progresses.</div>
              <button className="mg-order-btn" onClick={resetOrder}>Back to Orders</button>
            </div>
          )}
        </div>
      )}

      <OrderModal order={viewOrder} onClose={() => setViewOrder(null)} currSymbol={currSymbol} />
    </div>
  );
}