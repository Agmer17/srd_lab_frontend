/* global React, MOCK_PAYMENT_HISTORY, cx, Btn, Badge, FilterTabs, formatPrice, formatDate */
const { useState: useHistState, useMemo: useHistMemo } = React;

// ---------------------------------------------------------------
// SPRDlab — Payment history page
// ---------------------------------------------------------------

const STATUS_VARIANT = {
  paid:      'success',
  unpaid:    'muted',
  pending:   'secondary',
  failed:    'destructive',
  expired:   'destructive',
  cancelled: 'destructive',
};

const METHOD_LABEL = {
  qris:          'QRIS',
  bank_transfer: 'Bank',
  ewallet:       'E-Wallet',
};

function PaymentHistoryPage({ onNavigate }) {
  const [filter, setFilter] = useHistState('all');
  const [search, setSearch] = useHistState('');

  const filtered = useHistMemo(() => {
    return MOCK_PAYMENT_HISTORY.filter(p => {
      const matchStatus = filter === 'all' || p.status === filter;
      const matchSearch = !search ||
        p.product_name.toLowerCase().includes(search.toLowerCase()) ||
        p.payment_id.toLowerCase().includes(search.toLowerCase());
      return matchStatus && matchSearch;
    });
  }, [filter, search]);

  const totalSpent = MOCK_PAYMENT_HISTORY
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + (p.total_payment || p.amount), 0);
  const paidCount    = MOCK_PAYMENT_HISTORY.filter(p => p.status === 'paid').length;
  const pendingCount = MOCK_PAYMENT_HISTORY.filter(p => p.status === 'unpaid' || p.status === 'pending').length;

  return (
    <div>
      <header className="sprd-header">
        <span className="sprd-crumb">Payment History</span>
        <div className="sprd-header-actions">
          <button className="sprd-icon-btn"><i className="ri-download-line"></i></button>
        </div>
      </header>

      <div className="payhist-page">

        {/* Page head */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.025em', margin: '0 0 6px' }}>Payment History</h1>
          <p style={{ fontSize: 14, color: 'var(--muted-foreground)', margin: 0 }}>
            Track all transactions for your orders.
          </p>
        </div>

        {/* Stats */}
        <div className="payhist-stats">
          <div className="payhist-stat-card sprd-card">
            <div className="payhist-stat-label">Total spent</div>
            <div className="payhist-stat-value" style={{ color: 'var(--foreground)' }}>{formatPrice(totalSpent)}</div>
          </div>
          <div className="payhist-stat-card sprd-card">
            <div className="payhist-stat-label">Paid</div>
            <div className="payhist-stat-value" style={{ color: 'var(--chart-4)' }}>{paidCount}</div>
          </div>
          <div className="payhist-stat-card sprd-card">
            <div className="payhist-stat-label">Awaiting payment</div>
            <div className="payhist-stat-value" style={{ color: 'var(--secondary)' }}>{pendingCount}</div>
          </div>
          <div className="payhist-stat-card sprd-card">
            <div className="payhist-stat-label">Total transactions</div>
            <div className="payhist-stat-value">{MOCK_PAYMENT_HISTORY.length}</div>
          </div>
        </div>

        {/* Controls */}
        <div className="payhist-controls">
          <div className="sprd-input-wrap" style={{ flex: 1, maxWidth: 340 }}>
            <i className="ri-search-line sprd-input-icon"></i>
            <input
              className="sprd-input sprd-input--icon"
              placeholder="Search by service or payment ID…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <FilterTabs
            value={filter}
            onChange={setFilter}
            options={[
              { value: 'all',     label: 'All' },
              { value: 'paid',    label: 'Paid' },
              { value: 'unpaid',  label: 'Unpaid' },
              { value: 'expired', label: 'Expired' },
            ]}
          />
        </div>

        {/* Table */}
        {filtered.length === 0 ? (
          <div className="sprd-empty">
            <i className="ri-receipt-line sprd-empty-icon"></i>
            <div className="sprd-empty-title">No payments found</div>
            <div className="sprd-empty-sub">Try a different filter or search term.</div>
          </div>
        ) : (
          <div className="payhist-table-wrap">
            <table className="payhist-table">
              <thead>
                <tr>
                  <th>Service</th>
                  <th>Payment ID</th>
                  <th>Method</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <PaymentRow key={p.payment_id} payment={p} onNavigate={onNavigate} />
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
}

function PaymentRow({ payment: p, onNavigate }) {
  const canPay = p.status === 'unpaid' || p.status === 'pending';
  return (
    <tr className={cx('payhist-row', canPay && 'payhist-row--payable')}>
      <td>
        <div style={{ fontSize: 13.5, fontWeight: 500, letterSpacing: '-0.01em' }}>{p.product_name}</div>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10.5, color: 'var(--muted-foreground)', marginTop: 2 }}>{p.order_id}</div>
      </td>
      <td>
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'var(--muted-foreground)' }}>{p.payment_id}</span>
      </td>
      <td>
        {p.method ? (
          <Badge variant="muted">{METHOD_LABEL[p.method] || p.method}</Badge>
        ) : (
          <span style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>—</span>
        )}
      </td>
      <td style={{ textAlign: 'right' }}>
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13.5, fontWeight: 600 }}>
          {formatPrice(p.total_payment || p.amount)}
        </span>
        {p.fee > 0 && (
          <div style={{ fontSize: 10, color: 'var(--muted-foreground)', marginTop: 1 }}>
            incl. fee {formatPrice(p.fee)}
          </div>
        )}
      </td>
      <td>
        <Badge variant={STATUS_VARIANT[p.status] || 'muted'}>
          {p.status}
        </Badge>
      </td>
      <td style={{ fontSize: 13, color: 'var(--muted-foreground)' }}>
        {p.paid_at ? formatDate(p.paid_at) : (
          <span style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>
            {formatDate(p.created_at)}
          </span>
        )}
      </td>
      <td>
        {canPay && (
          <Btn size="sm" onClick={() => onNavigate('payment')}>
            Pay now
          </Btn>
        )}
      </td>
    </tr>
  );
}

window.PaymentHistoryPage = PaymentHistoryPage;
