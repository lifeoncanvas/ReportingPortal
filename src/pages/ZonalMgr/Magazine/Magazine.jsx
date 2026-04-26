import React, { useState } from 'react';
import { ShoppingCart, Package, Bell, CheckCircle, ChevronRight, CreditCard, Upload, AlertCircle, X } from 'lucide-react';
import { useSettings } from '../../../context/SettingsContext';
import { useAuth } from '../../../auth/AuthContext';
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

const STEPS = ['Select Magazines', 'Review Order', 'Shipping Info', 'Payment', 'Order Placed'];

const PAYMENT_METHODS = [
  { id: 'paypal', label: 'PayPal',              icon: '🌐' },
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
  { key: 'pending',    icon: '📋', label: 'Order Placed',     desc: 'Order received and under review'       },
  { key: 'invoiced',   icon: '💳', label: 'Invoice Sent',     desc: 'Invoice sent by Global Manager'        },
  { key: 'approved',   icon: '✅', label: 'Payment Verified', desc: 'Payment confirmed by finance team'     },
  { key: 'processing', icon: '🖨️', label: 'Printing',         desc: 'Magazines being printed'               },
  { key: 'shipped',    icon: '📦', label: 'Shipped',          desc: 'Order dispatched for delivery'         },
  { key: 'delivered',  icon: '🚚', label: 'Delivered',        desc: 'Order delivered to your zone'          },
];

// ── Order Preview Modal ────────────────────────────────────────
function OrderModal({ order, onClose, currSymbol, onAction, userRole }) {
  const [showDelayForm, setShowDelayForm] = useState(false);
  const [delayReason, setDelayReason] = useState('');
  const [feedback, setFeedback] = useState({ text: '', photos: null });

  if (!order) return null;
  const status = order.status.toLowerCase();
  const sc          = STATUS_COLORS[status] || STATUS_COLORS.pending;
  const currentStep = STATUS_TIMELINE.findIndex(s => s.key === status);

  return (
    <div className="mg-modal-overlay" onClick={onClose}>
      <div className="mg-modal" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="mg-modal-header">
          <div>
            <h3>ORDER #{order.id}</h3>
            <p>Placed by {order.orderedBy} on {new Date(order.orderedAt).toLocaleDateString()}</p>
          </div>
          <button className="mg-modal-close" onClick={onClose}><X size={18} /></button>
        </div>

        {/* Status */}
        <div className="mg-modal-status-row">
          <span>Current Status</span>
          <span className="mg-status-badge" style={{ background: sc.bg, color: sc.color }}>
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </span>
        </div>

        {/* Admin Actions */}
        {(userRole === 'admin' || userRole === 'global') && (
          <div className="mg-modal-section">
            <div className="mg-modal-section-title">Admin Actions</div>
            <div className="mg-admin-actions" style={{ display: 'flex', gap: 10, marginTop: 10, flexWrap: 'wrap' }}>
              {order.status === 'ORDERED' && (
                <button className="mg-order-btn" onClick={() => onAction(order.id, 'invoice')}>Generate Invoice</button>
              )}
              {order.status === 'PAID' && (
                <button className="mg-order-btn" onClick={() => onAction(order.id, 'print')}>Mark as Printed</button>
              )}
              {order.status === 'PRINTED' && (
                <button className="mg-order-btn" onClick={() => onAction(order.id, 'ship')}>Mark as Shipped</button>
              )}
              {order.status === 'SHIPPED' && (
                <button className="mg-order-btn" onClick={() => onAction(order.id, 'status?status=DELIVERED')}>Mark as Delivered</button>
              )}
              {order.status !== 'CANCELLED' && order.status !== 'DELIVERED' && (
                <button className="mg-view-btn" style={{borderColor: '#ef4444', color: '#ef4444'}} onClick={() => onAction(order.id, 'cancel')}>Cancel Order</button>
              )}
            </div>
          </div>
        )}

        {/* Zonal Delay Report */}
        {userRole === 'zonal' && (order.status === 'PAID' || order.status === 'PRINTED') && (
          <div className="mg-modal-section">
            {!showDelayForm ? (
              <button className="mg-view-btn" onClick={() => setShowDelayForm(true)}>Report Production Delay</button>
            ) : (
              <div className="mg-delay-form" style={{ marginTop: 10 }}>
                <textarea 
                  placeholder="Enter reason for delay..." 
                  className="mg-payment-input" 
                  value={delayReason} 
                  onChange={e => setDelayReason(e.target.value)}
                  style={{ height: 80, marginBottom: 8 }}
                />
                <div style={{ display: 'flex', gap: 10 }}>
                  <button className="mg-order-btn" onClick={() => onAction(order.id, `delay?reason=${encodeURIComponent(delayReason)}`)}>Submit Report</button>
                  <button className="mg-back-btn" onClick={() => setShowDelayForm(false)}>Cancel</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Feedback Section for Delivered Orders */}
        {order.status === 'DELIVERED' && (
          <div className="mg-modal-section">
            <div className="mg-modal-section-title">Pictures & Testimonies</div>
            {order.feedbackReceived ? (
              <div className="mg-notice" style={{ background: 'rgba(22,163,74,0.1)', color: '#16a34a' }}>
                <CheckCircle size={14} /> Feedback submitted successfully! Thank you.
              </div>
            ) : (
              <div className="mg-feedback-form" style={{ marginTop: 10 }}>
                <textarea 
                  placeholder="Share your testimonies..." 
                  className="mg-payment-input" 
                  value={feedback.text}
                  onChange={e => setFeedback({...feedback, text: e.target.value})}
                  style={{ height: 80, marginBottom: 8 }}
                />
                <label className="mg-upload-zone" style={{ padding: '10px' }}>
                  <input type="file" multiple style={{ display: 'none' }} />
                  <div className="mg-upload-prompt"><Upload size={16} /> <span>Upload Pictures</span></div>
                </label>
                <button 
                  className="mg-order-btn" 
                  style={{ width: '100%', marginTop: 10 }}
                  onClick={() => onAction(order.id, 'status?status=DELIVERED&feedback=true')} // Mocking feedback submission
                >
                  Submit Feedback
                </button>
              </div>
            )}
          </div>
        )}

        {/* Details */}
        <div className="mg-modal-section">
          <div className="mg-modal-section-title">Shipping Details</div>
          <div style={{ fontSize: '0.85rem', color: '#666', lineHeight: 1.5 }}>
            <p><strong>Address:</strong> {order.deliveryAddress}</p>
            <p><strong>Country:</strong> {order.country}, {order.stateProvince}</p>
            <p><strong>Postal Code:</strong> {order.postalCode}</p>
            <p><strong>Contact:</strong> {order.contactEmail} ({order.contactPhone})</p>
          </div>
        </div>

        {/* Items */}
        <div className="mg-modal-section">
          <div className="mg-modal-section-title">Order Items</div>
          <div style={{ fontSize: '0.9rem' }}>
            {order.magazineType} × {order.quantity} copies
          </div>
        </div>

        {/* Total */}
        <div className="mg-modal-meta">
          <div className="mg-modal-meta-row">
            <span>Order Total</span>
            <strong>{currSymbol}{order.totalAmount}</strong>
          </div>
        </div>

        {/* Timeline */}
        <div className="mg-modal-section">
          <div className="mg-modal-section-title">Order Progress</div>
          <div className="mg-timeline">
            {STATUS_TIMELINE.map((s, i) => {
              const done   = i <= currentStep;
              const active = i === currentStep;
              return (
                <div className={`mg-timeline-item ${done ? 'done' : ''} ${active ? 'active' : ''}`} key={s.key}>
                  <div className="mg-timeline-left">
                    <div className="mg-timeline-dot">
                      {done ? <CheckCircle size={13} /> : <span>{i + 1}</span>}
                    </div>
                    {i < STATUS_TIMELINE.length - 1 && <div className="mg-timeline-line" />}
                  </div>
                  <div className="mg-timeline-body">
                    <span className="mg-timeline-icon">{s.icon}</span>
                    <div>
                      <div className="mg-timeline-label">{s.label}</div>
                      <div className="mg-timeline-desc">{s.desc}</div>
                    </div>
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

// ── Main Component ─────────────────────────────────────────────
export default function Magazine() {
  const { t, currSymbol } = useSettings();
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [view, setView]           = useState('home');
  const [step, setStep]           = useState(0);
  const [orders, setOrders]       = useState([]);
  const [viewOrder, setViewOrder] = useState(null);

  React.useEffect(() => {
    fetchOrders();
  }, [user]);

  const fetchOrders = () => {
    if (!user) return;
    const url = `${process.env.REACT_APP_API_URL}/api/magazine/orders?role=${user.role}&zone=${user.zone || ''}`;
    fetch(url)
      .then(res => res.json())
      .then(data => setOrders(data))
      .catch(err => console.error(err));
  };

  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentRef,    setPaymentRef]    = useState('');
  const [proofFile,     setProofFile]     = useState(null);
  const [paymentError,  setPaymentError]  = useState('');
  const [paymentDone,   setPaymentDone]   = useState(false);
  const [shipping,      setShipping]      = useState({
    address: '', city: '', state: '', country: '', zip: '', contactEmail: '', contactPhone: ''
  });
  const [shippingError, setShippingError] = useState('');

  const [selections, setSelections] = useState(
    MAGAZINE_TYPES.reduce((acc, m) => ({ ...acc, [m.id]: { qty: 0, languages: ['English'] } }), {})
  );

  const updateQty = (id, delta) =>
    setSelections(p => ({ ...p, [id]: { ...p[id], qty: Math.max(0, p[id].qty + delta) } }));

  const toggleLang = (id, lang) =>
    setSelections(p => {
      const langs = p[id].languages;
      const next  = langs.includes(lang) ? langs.filter(l => l !== lang) : [...langs, lang];
      return { ...p, [id]: { ...p[id], languages: next.length ? next : [lang] } };
    });

  const orderLines = MAGAZINE_TYPES
    .filter(m => selections[m.id].qty > 0)
    .map(m => ({
      ...m,
      qty:       selections[m.id].qty,
      languages: selections[m.id].languages,
      subtotal:  selections[m.id].qty * m.price * selections[m.id].languages.length,
    }));

  const subtotal       = orderLines.reduce((s, l) => s + l.subtotal, 0);
  const deliveryCharge = subtotal > 200 ? 0 : 25;
  const tax            = subtotal * 0.075;
  const total          = subtotal + deliveryCharge + tax;

  const handleConfirmPayment = () => {
    setPaymentError('');
    if (!paymentMethod)     return setPaymentError('Please select a payment method.');
    if (!paymentRef.trim()) return setPaymentError('Please enter your payment reference / transaction ID.');
    if (!proofFile)         return setPaymentError('Please upload proof of payment.');

    const payload = {
      zone: user?.zone || 'Global',
      magazineType: orderLines.map(l => l.subtitle).join(', '),
      quantity: orderLines.reduce((s, l) => s + l.qty, 0),
      totalAmount: total,
      orderedBy: user?.email || '',
      deliveryAddress: `${shipping.address}, ${shipping.city}`,
      country: shipping.country,
      stateProvince: shipping.state,
      postalCode: shipping.zip,
      contactEmail: shipping.contactEmail,
      contactPhone: shipping.contactPhone
    };

    fetch(`${process.env.REACT_APP_API_URL}/api/magazine/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    .then(res => res.json())
    .then(data => {
      const newOrder = {
        id:         `ORD-${data.id || String(orders.length + 1).padStart(3, '0')}`,
        date:       new Date().toISOString().split('T')[0],
        status:     'pending',
        items:      orderLines.map(l => ({ type: l.subtitle.split(' ')[0], qty: l.qty, lang: l.languages })),
        total:      Math.round(total * 100) / 100,
        paymentRef: paymentRef.trim(),
      };
      setOrders(prev => [newOrder, ...prev]);

      // Toast popup
      showToast({
        icon:    '📖',
        title:   'Order Placed Successfully!',
        message: `Order ${newOrder.id} · ${orderLines.reduce((s, l) => s + l.qty, 0)} magazines`,
      });

      addNotification({
        icon:    'magazine',
        role:    'global_admin',
        title:   'New Magazine Order — Action Required',
        message: `Zonal Manager placed Order ${newOrder.id} for ${orderLines.reduce((s, l) => s + l.qty, 0)} magazines totalling ${currSymbol}${newOrder.total}. Please review and send invoice.`,
      });

      setPaymentDone(true);
      setStep(4);
    })
    .catch(err => setPaymentError('Failed to save order on server.'));
  };

  const handleNextToPayment = () => {
    setShippingError('');
    if (!shipping.address || !shipping.country || !shipping.zip || !shipping.contactEmail) {
      return setShippingError('Please fill in all required shipping fields.');
    }
    setStep(3);
  };

  const handleOrderAction = (orderId, action) => {
    fetch(`${process.env.REACT_APP_API_URL}/api/magazine/orders/${orderId}/${action}`, { method: 'POST' })
      .then(res => {
        if (!res.ok) throw new Error();
        showToast({ title: 'Success', message: `Order status updated to ${action}.` });
        fetchOrders();
        setViewOrder(null);
      })
      .catch(() => showToast({ title: 'Error', message: 'Failed to update order status.' }));
  };

  const resetOrder = () => {
    setSelections(MAGAZINE_TYPES.reduce((acc, m) => ({ ...acc, [m.id]: { qty: 0, languages: ['English'] } }), {}));
    setStep(0);
    setPaymentMethod('');
    setPaymentRef('');
    setProofFile(null);
    setPaymentError('');
    setPaymentDone(false);
    setView('home');
    fetchOrders();
  };

  return (
    <div className="mg-page">

      {/* Page Header */}
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
        {view === 'order' && step < 4 && (
          <button className="mg-back-btn" onClick={() => { setView('home'); setStep(0); }}>← Back</button>
        )}
      </div>

      {/* ── HOME VIEW ── */}
      {view === 'home' && (
        <>
          <div className="mg-stats">
            {[
              { label: 'Total Orders',  value: orders.length,                                        color: 'var(--text-primary)' },
              { label: 'Pending',       value: orders.filter(o => o.status === 'pending').length,    color: '#ca8a04'             },
              { label: 'Processing',    value: orders.filter(o => o.status === 'processing').length, color: '#4f46e5'             },
              { label: 'Delivered',     value: orders.filter(o => o.status === 'delivered').length,  color: '#16a34a'             },
            ].map(s => (
              <div className="mg-stat-card" key={s.label}>
                <div className="mg-stat-label">{s.label}</div>
                <div className="mg-stat-value" style={{ color: s.color }}>{s.value}</div>
              </div>
            ))}
          </div>

          <div className="mg-panel">
            <h3>{user?.role === 'admin' ? 'All Magazine Orders' : 'My Orders'}</h3>
            {orders.length === 0 ? (
              <div className="mg-empty">
                <Package size={32} color="var(--text-muted)" />
                <p>No orders found.</p>
                {user?.role === 'zonal' && <button className="mg-order-btn" onClick={() => setView('order')}>Place Order</button>}
              </div>
            ) : (
              <div className="mg-table-wrapper" style={{ overflowX: 'auto', width: '100%', WebkitOverflowScrolling: 'touch' }}>
                <table className="mg-table">
                  <thead>
                    <tr>
                      <th>Order ID</th><th>Date</th><th>By</th><th>Qty</th>
                      <th>Total</th><th>Status</th><th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(o => {
                      const sc = STATUS_COLORS[o.status.toLowerCase()] || STATUS_COLORS.pending;
                      return (
                        <tr key={o.id}>
                          <td className="mg-id">#{o.id}</td>
                          <td>{new Date(o.orderedAt).toLocaleDateString()}</td>
                          <td>{o.orderedBy}</td>
                          <td>{o.quantity}</td>
                          <td className="mg-amount">{currSymbol}{o.totalAmount}</td>
                          <td>
                            <span className="mg-status-badge" style={{ background: sc.bg, color: sc.color }}>
                              {o.status.charAt(0).toUpperCase() + o.status.slice(1)}
                            </span>
                          </td>
                          <td>
                            <button className="mg-view-btn" onClick={() => setViewOrder(o)}>View</button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* ── ORDER FLOW ── */}
      {view === 'order' && (
        <div className="mg-order-flow">
          {step < 4 && (
            <div className="mg-stepper">
              {STEPS.slice(0, 4).map((s, i) => (
                <React.Fragment key={s}>
                  <div className={`mg-step ${step === i ? 'active' : ''} ${step > i ? 'done' : ''}`}>
                    <div className="mg-step-circle">
                      {step > i ? <CheckCircle size={16} /> : i + 1}
                    </div>
                    <span>{s}</span>
                  </div>
                  {i < 3 && <div className={`mg-step-line ${step > i ? 'done' : ''}`} />}
                </React.Fragment>
              ))}
            </div>
          )}

          {/* STEP 0 */}
          {step === 0 && (
            <>
              <div className="mg-mag-grid">
                {MAGAZINE_TYPES.map(m => (
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
                      <div className="mg-qty-section">
                        <label>Quantity</label>
                        <div className="mg-qty-ctrl">
                          <button onClick={() => updateQty(m.id, -10)}>−10</button>
                          <button onClick={() => updateQty(m.id, -1)}>−</button>
                          <span>{selections[m.id].qty}</span>
                          <button onClick={() => updateQty(m.id, 1)}>+</button>
                          <button onClick={() => updateQty(m.id, 10)}>+10</button>
                        </div>
                      </div>
                      <div className="mg-lang-section">
                        <label>Languages <span className="mg-lang-hint">(multi-select)</span></label>
                        <div className="mg-lang-grid">
                          {AVAILABLE_LANGUAGES.map(lang => (
                            <button
                              key={lang}
                              className={`mg-lang-btn ${selections[m.id].languages.includes(lang) ? 'selected' : ''}`}
                              onClick={() => toggleLang(m.id, lang)}
                            >{lang}</button>
                          ))}
                        </div>
                      </div>
                      {selections[m.id].qty > 0 && (
                        <div className="mg-line-total">
                          Subtotal: <strong>{currSymbol}{(selections[m.id].qty * m.price * selections[m.id].languages.length).toFixed(2)}</strong>
                          <span className="mg-line-note">
                            ({selections[m.id].qty} × {currSymbol}{m.price} × {selections[m.id].languages.length} language{selections[m.id].languages.length > 1 ? 's' : ''})
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mg-step-footer">
                <div className="mg-running-total">
                  {orderLines.length > 0
                    ? `${orderLines.reduce((s, l) => s + l.qty, 0)} magazines · ${currSymbol}${subtotal.toFixed(2)} est.`
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
                <div className="mg-table-wrapper" style={{ overflowX: 'auto', width: '100%', WebkitOverflowScrolling: 'touch' }}>
                  <table className="mg-review-table">
                    <thead>
                      <tr><th>Magazine</th><th>Languages</th><th>Qty</th><th>Price/copy</th><th>Subtotal</th></tr>
                    </thead>
                    <tbody>
                      {orderLines.map(l => (
                        <tr key={l.id}>
                          <td><span className="mg-mag-emoji-sm">{l.icon}</span>{l.subtitle}</td>
                          <td><div className="mg-lang-tags">{l.languages.map(lang => <span className="mg-lang-tag" key={lang}>{lang}</span>)}</div></td>
                          <td>{l.qty}</td>
                          <td>{currSymbol}{l.price.toFixed(2)}</td>
                          <td><strong>{currSymbol}{l.subtotal.toFixed(2)}</strong></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mg-invoice">
                  <div className="mg-invoice-row"><span>Subtotal</span><span>{currSymbol}{subtotal.toFixed(2)}</span></div>
                  <div className="mg-invoice-row"><span>Delivery</span><span>{deliveryCharge === 0 ? 'Free' : `${currSymbol}${deliveryCharge.toFixed(2)}`}</span></div>
                  <div className="mg-invoice-row"><span>Tax (7.5%)</span><span>{currSymbol}{tax.toFixed(2)}</span></div>
                  <div className="mg-invoice-divider" />
                  <div className="mg-invoice-row mg-invoice-total"><span>Total</span><span>{currSymbol}{total.toFixed(2)}</span></div>
                </div>
                <div className="mg-notice">
                  <Bell size={14} />
                  Please proceed to payment. Your order will only be placed after payment is confirmed.
                </div>
              </div>
              <div className="mg-step-footer">
                <button className="mg-back-btn" onClick={() => setStep(0)}>← Edit Order</button>
                <button className="mg-order-btn" onClick={() => setStep(2)}>Enter Shipping Info <ChevronRight size={15} /></button>
              </div>
            </div>
          )}

          {/* STEP 2: Shipping Info */}
          {step === 2 && (
            <div className="mg-review">
              <div className="mg-panel">
                <h3><Package size={18} /> Shipping & Contact Details</h3>
                <div className="mg-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
                  <div className="mg-form-group" style={{ gridColumn: 'span 2' }}>
                    <label className="mg-payment-label">Street Address <span className="mg-required">*</span></label>
                    <input className="mg-payment-input" value={shipping.address} onChange={e => setShipping({...shipping, address: e.target.value})} />
                  </div>
                  <div className="mg-form-group">
                    <label className="mg-payment-label">City <span className="mg-required">*</span></label>
                    <input className="mg-payment-input" value={shipping.city} onChange={e => setShipping({...shipping, city: e.target.value})} />
                  </div>
                  <div className="mg-form-group">
                    <label className="mg-payment-label">State / Province</label>
                    <input className="mg-payment-input" value={shipping.state} onChange={e => setShipping({...shipping, state: e.target.value})} />
                  </div>
                  <div className="mg-form-group">
                    <label className="mg-payment-label">Country <span className="mg-required">*</span></label>
                    <input className="mg-payment-input" value={shipping.country} onChange={e => setShipping({...shipping, country: e.target.value})} />
                  </div>
                  <div className="mg-form-group">
                    <label className="mg-payment-label">Postal / ZIP Code <span className="mg-required">*</span></label>
                    <input className="mg-payment-input" value={shipping.zip} onChange={e => setShipping({...shipping, zip: e.target.value})} />
                  </div>
                  <div className="mg-form-group">
                    <label className="mg-payment-label">Contact Email <span className="mg-required">*</span></label>
                    <input className="mg-payment-input" type="email" value={shipping.contactEmail} onChange={e => setShipping({...shipping, contactEmail: e.target.value})} />
                  </div>
                  <div className="mg-form-group">
                    <label className="mg-payment-label">Contact Phone <span className="mg-required">*</span></label>
                    <input className="mg-payment-input" type="tel" value={shipping.contactPhone} onChange={e => setShipping({...shipping, contactPhone: e.target.value})} />
                  </div>
                </div>
                {shippingError && <div className="mg-payment-error" style={{marginTop: 16}}><AlertCircle size={15} /> {shippingError}</div>}
              </div>
              <div className="mg-step-footer">
                <button className="mg-back-btn" onClick={() => setStep(1)}>← Back to Review</button>
                <button className="mg-order-btn" onClick={handleNextToPayment}>Proceed to Payment <ChevronRight size={15} /></button>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div className="mg-review">
              <div className="mg-panel">
                <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}><CreditCard size={18} /> Payment</h3>
                <div className="mg-payment-amount">
                  <span>Amount Due</span>
                  <strong>{currSymbol}{total.toFixed(2)}</strong>
                </div>
                <div className="mg-payment-section">
                  <label className="mg-payment-label">Select Payment Method</label>
                  <div className="mg-payment-methods">
                    {PAYMENT_METHODS.map(pm => (
                      <button key={pm.id} className={`mg-payment-method-btn ${paymentMethod === pm.id ? 'selected' : ''}`} onClick={() => setPaymentMethod(pm.id)}>
                        <span>{pm.icon}</span> {pm.label}
                      </button>
                    ))}
                  </div>
                </div>
                {paymentMethod === 'paypal' && (
                  <div className="mg-bank-details" style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12}}>
                    <p className="mg-bank-title" style={{marginBottom: 0}}>Pay securely using PayPal</p>
                    <a 
                      href={`https://paypal.me/CEHSPartners/${total.toFixed(2)}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{
                        padding: '12px 24px', background: '#003087', color: 'white', borderRadius: 8, 
                        textDecoration: 'none', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 8
                      }}
                    >
                      Pay {currSymbol}{total.toFixed(2)} on PayPal
                    </a>
                    <p style={{fontSize: '0.85rem', color: '#666', textAlign: 'center', marginTop: 4}}>
                      Click above to open PayPal. Once paid, copy your Transaction ID and upload a screenshot below.
                    </p>
                  </div>
                )}
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
                    <input type="file" accept="image/*,.pdf" style={{ display: 'none' }} onChange={e => setProofFile(e.target.files[0] || null)} />
                    {proofFile ? (
                      <div className="mg-upload-done"><CheckCircle size={18} color="#16a34a" /><span>{proofFile.name}</span></div>
                    ) : (
                      <div className="mg-upload-prompt"><Upload size={20} /><span>Click to upload receipt / screenshot</span><small>PNG, JPG, PDF accepted</small></div>
                    )}
                  </label>
                </div>
                {paymentError && <div className="mg-payment-error"><AlertCircle size={15} /> {paymentError}</div>}
                <div className="mg-notice"><Bell size={14} />Your order will only be placed once payment details are submitted and verified.</div>
              </div>
              <div className="mg-step-footer">
                <button className="mg-back-btn" onClick={() => setStep(2)}>← Back to Shipping</button>
                <button className="mg-order-btn" onClick={handleConfirmPayment}>Confirm Payment & Place Order <ChevronRight size={15} /></button>
              </div>
            </div>
          )}

          {/* STEP 4 */}
          {step === 4 && paymentDone && (
            <div className="mg-success">
              <div className="mg-success-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <h2>Order Placed Successfully!</h2>
              <p>Your order <strong>{orders[0]?.id}</strong> has been submitted.</p>
              <p style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: 4 }}>Payment reference: <strong>{paymentRef}</strong></p>
              <div className="mg-success-steps">
                {[
                  { icon: '💳', label: 'Payment Submitted', desc: 'Your payment proof has been uploaded',  done: true  },
                  { icon: '📋', label: 'Order Received',    desc: 'Your order is being reviewed',          done: true  },
                  { icon: '✅', label: 'Payment Verified',  desc: 'Finance team will verify your payment', done: false },
                  { icon: '🖨️', label: 'Printing',          desc: 'Printing department notified',          done: false },
                  { icon: '🚚', label: 'Shipping',          desc: 'Expected delivery: 7–14 business days', done: false },
                ].map((s, i) => (
                  <div className={`mg-track-step ${s.done ? 'done' : ''}`} key={i}>
                    <div className="mg-track-icon">{s.icon}</div>
                    <div>
                      <div className="mg-track-label">{s.label}</div>
                      <div className="mg-track-desc">{s.desc}</div>
                    </div>
                    {s.done && <CheckCircle size={16} color="#16a34a" style={{ marginLeft: 'auto' }} />}
                  </div>
                ))}
              </div>
              <div className="mg-success-notice">
                <Bell size={14} />
                You'll receive notifications as your order progresses. Finance and Publishing teams have been notified.
              </div>
              <button className="mg-order-btn" onClick={resetOrder}>Back to Orders</button>
            </div>
          )}
        </div>
      )}

      {/* Order Preview Modal */}
      <OrderModal 
        order={viewOrder} 
        onClose={() => setViewOrder(null)} 
        currSymbol={currSymbol} 
        onAction={handleOrderAction}
        userRole={user?.role}
      />
    </div>
  );
}
