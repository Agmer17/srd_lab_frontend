/* global React, MOCK_PENDING_ORDER, cx, Btn, Badge, formatPrice */
const { useState: usePayState, useEffect: usePayEffect } = React;

// ---------------------------------------------------------------
// SPRDlab — Payment page: method selection → QRIS / bank / ewallet → success
// ---------------------------------------------------------------

const BANKS = [
  { name: 'BCA',    no: '1234 5678 9012',  holder: 'SPRDlab Creative Indonesia' },
  { name: 'BRI',    no: '0098 0123 4567',  holder: 'SPRDlab Creative Indonesia' },
  { name: 'Mandiri',no: '1170 0012 3456',  holder: 'SPRDlab Creative Indonesia' },
];

const EWALLETS = [
  { id: 'gopay',      name: 'GoPay',       color: '#00AED6', letter: 'G' },
  { id: 'ovo',        name: 'OVO',         color: '#4C3494', letter: 'O' },
  { id: 'dana',       name: 'DANA',        color: '#118EEA', letter: 'D' },
  { id: 'shopeepay',  name: 'ShopeePay',   color: '#EE4D2D', letter: 'S' },
];

/* ── Fake QR code SVG ── */
function FakeQRCode({ size = 208 }) {
  const cells = 21;
  const c = size / cells;
  const rects = [];

  // Finder patterns (top-left, top-right, bottom-left)
  function finder(or, oc) {
    for (let r = 0; r < 7; r++) for (let cc = 0; cc < 7; cc++) {
      const edge = r === 0 || r === 6 || cc === 0 || cc === 6;
      const inner = r >= 2 && r <= 4 && cc >= 2 && cc <= 4;
      if (edge || inner) rects.push(`${(oc + cc) * c},${(or + r) * c}`);
    }
  }
  finder(0, 0); finder(0, 14); finder(14, 0);

  // Timing strips
  for (let i = 8; i < 13; i++) {
    if (i % 2 === 0) { rects.push(`${i * c},${6 * c}`); rects.push(`${6 * c},${i * c}`); }
  }

  // Data fill
  for (let r = 0; r < 21; r++) for (let cc = 0; cc < 21; cc++) {
    const inFinder = (r < 8 && cc < 8) || (r < 8 && cc > 12) || (r > 12 && cc < 8);
    if (inFinder || r === 6 || cc === 6) continue;
    if ((r * 21 + cc * 3 + r + cc) % 3 === 0) rects.push(`${cc * c},${r * c}`);
  }

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: 'block' }}>
      <rect width={size} height={size} fill="#fff" />
      {rects.map((pos, i) => {
        const [x, y] = pos.split(',').map(Number);
        return <rect key={i} x={x + 0.5} y={y + 0.5} width={c - 1} height={c - 1} fill="#111" rx="0.5" />;
      })}
    </svg>
  );
}

/* ── Countdown timer ── */
function Countdown({ seconds: initial }) {
  const [secs, setSecs] = usePayState(initial);
  usePayEffect(() => {
    const t = setInterval(() => setSecs(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, []);
  const m = String(Math.floor(secs / 60)).padStart(2, '0');
  const s = String(secs % 60).padStart(2, '0');
  const urgent = secs < 60;
  return (
    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: 18, color: urgent ? 'var(--destructive)' : 'var(--secondary)', letterSpacing: '0.06em' }}>
      {m}:{s}
    </span>
  );
}

/* ── Copy helper ── */
function CopyBtn({ text }) {
  const [copied, setCopied] = usePayState(false);
  function doCopy() {
    navigator.clipboard?.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <button className={cx('pay-copy-btn', copied && 'pay-copy-btn--done')} onClick={doCopy}>
      <i className={copied ? 'ri-check-line' : 'ri-clipboard-line'}></i>
    </button>
  );
}

/* ── Main component ── */
function PaymentPage({ context, onNavigate }) {
  const order = context || MOCK_PENDING_ORDER;
  const [method, setMethod] = usePayState('qris');
  const [paid, setPaid] = usePayState(false);
  const fee = Math.round(order.ordered_price * 0.01);
  const total = order.ordered_price + fee;

  if (paid) {
    return (
      <div>
        <header className="sprd-header">
          <span className="sprd-crumb">Payment</span>
        </header>
        <div className="pay-page">
          <div className="pay-success">
            <div className="pay-success-icon"><i className="ri-shield-check-line"></i></div>
            <h2 className="pay-success-h">Payment confirmed!</h2>
            <p className="pay-success-sub">
              Your payment of <strong>{formatPrice(total)}</strong> has been received. Our team will start your project shortly.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Btn variant="outline" onClick={() => onNavigate('payments')}>
                <i className="ri-history-line"></i> Payment history
              </Btn>
              <Btn onClick={() => onNavigate('projects')}>
                View my projects <i className="ri-arrow-right-line"></i>
              </Btn>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <header className="sprd-header">
        <button className="sprd-icon-btn" style={{ marginRight: 4 }} onClick={() => onNavigate('products')}>
          <i className="ri-arrow-left-line"></i>
        </button>
        <span className="sprd-crumb">Complete payment</span>
      </header>

      <div className="pay-page">
        <div className="pay-grid">

          {/* ── Left: method + panel ── */}
          <div className="pay-left">
            <div className="pay-section-label">Choose payment method</div>

            <div className="pay-methods">
              {[
                { id: 'qris',          icon: 'qr-code-line',       label: 'QRIS',          sub: 'Scan with any banking / e-wallet app', rec: true },
                { id: 'bank_transfer', icon: 'bank-line',           label: 'Bank Transfer',  sub: 'Manual transfer to our account' },
                { id: 'ewallet',       icon: 'wallet-3-line',       label: 'E-Wallet',       sub: 'GoPay, OVO, DANA, ShopeePay' },
              ].map(m => (
                <button
                  key={m.id}
                  className={cx('pay-method', method === m.id && 'pay-method--active')}
                  onClick={() => setMethod(m.id)}
                >
                  <i className={`ri-${m.icon}`}></i>
                  <div className="pay-method-text">
                    <div className="pay-method-label">
                      {m.label}
                      {m.rec && <span className="pay-method-rec">Recommended</span>}
                    </div>
                    <div className="pay-method-sub">{m.sub}</div>
                  </div>
                  <div className={cx('pay-method-radio', method === m.id && 'pay-method-radio--on')}>
                    {method === m.id && <i className="ri-check-line"></i>}
                  </div>
                </button>
              ))}
            </div>

            {/* ── QRIS panel ── */}
            {method === 'qris' && (
              <div className="pay-panel pay-panel--qris">
                <div className="pay-qris-head">
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>Scan to pay</div>
                    <div style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>Works with GoPay, OVO, BCA, Mandiri, and all QRIS-enabled apps</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 11, color: 'var(--muted-foreground)', marginBottom: 2 }}>Expires in</div>
                    <Countdown seconds={900} />
                  </div>
                </div>
                <div className="pay-qr-wrap">
                  <FakeQRCode size={208} />
                  <div className="pay-qr-logo">
                    <img src="assets/logo-mark.svg" alt="" width="28" height="28" />
                  </div>
                </div>
                <div style={{ fontSize: 12, color: 'var(--muted-foreground)', textAlign: 'center', lineHeight: 1.55 }}>
                  Open your banking or e-wallet app, tap <strong>Pay / QRIS</strong>, then scan this code.
                </div>
                <Btn style={{ width: '100%' }} onClick={() => setPaid(true)}>
                  <i className="ri-check-double-line"></i> I've completed the payment
                </Btn>
              </div>
            )}

            {/* ── Bank transfer panel ── */}
            {method === 'bank_transfer' && (
              <div className="pay-panel">
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 14 }}>Transfer to one of these accounts</div>
                <div className="pay-bank-list">
                  {BANKS.map(b => (
                    <div key={b.name} className="pay-bank-row">
                      <div className="pay-bank-name">{b.name}</div>
                      <div className="pay-bank-info">
                        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 16, fontWeight: 700, letterSpacing: '0.04em' }}>{b.no}</div>
                        <div style={{ fontSize: 11, color: 'var(--muted-foreground)', marginTop: 2 }}>a/n {b.holder}</div>
                      </div>
                      <CopyBtn text={b.no.replace(/\s/g, '')} />
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: 12, color: 'var(--muted-foreground)', marginTop: 14, padding: '10px 12px', background: 'oklch(0.96 0.002 248)', borderRadius: 8, lineHeight: 1.6 }}>
                  <i className="ri-information-line" style={{ marginRight: 4 }}></i>
                  After transferring, upload your payment proof via the chat to confirm your order.
                </div>
                <Btn style={{ width: '100%', marginTop: 14 }} onClick={() => setPaid(true)}>
                  <i className="ri-check-line"></i> I've made the transfer
                </Btn>
              </div>
            )}

            {/* ── E-wallet panel ── */}
            {method === 'ewallet' && (
              <div className="pay-panel">
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 14 }}>Select your e-wallet</div>
                <div className="pay-wallet-grid">
                  {EWALLETS.map(w => (
                    <button key={w.id} className="pay-wallet-tile" onClick={() => setPaid(true)}>
                      <div className="pay-wallet-mark" style={{ background: w.color }}>{w.letter}</div>
                      <div style={{ fontSize: 12, fontWeight: 600, marginTop: 6 }}>{w.name}</div>
                    </button>
                  ))}
                </div>
                <div style={{ fontSize: 12, color: 'var(--muted-foreground)', marginTop: 12, lineHeight: 1.55 }}>
                  You will be redirected to your selected e-wallet app to complete the payment.
                </div>
              </div>
            )}
          </div>

          {/* ── Right: order summary ── */}
          <div className="pay-summary">
            <div className="pay-summary-h">Order summary</div>

            <div className="pay-summary-product-row">
              <div className="pay-summary-thumb" style={{ background: order.product_tint }}>
                <i className={`ri-${order.product_icon}`}></i>
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{order.product_name}</div>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'var(--muted-foreground)', marginTop: 3 }}>{order.id}</div>
              </div>
            </div>

            <div className="pay-summary-lines">
              <div className="pay-line">
                <span>Service price</span>
                <span>{formatPrice(order.ordered_price)}</span>
              </div>
              <div className="pay-line">
                <span>Processing fee (1%)</span>
                <span>{formatPrice(fee)}</span>
              </div>
            </div>

            <div className="pay-total-row">
              <span>Total</span>
              <span className="pay-total-num">{formatPrice(total)}</span>
            </div>

            <div className="pay-summary-note">
              <i className="ri-shield-check-line" style={{ color: 'var(--chart-4)', flexShrink: 0 }}></i>
              Payments are secured and processed through our verified payment gateway.
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

window.PaymentPage = PaymentPage;
