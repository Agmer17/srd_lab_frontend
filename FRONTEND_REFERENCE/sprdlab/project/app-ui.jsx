/* global React */

// ---------------------------------------------------------------
// SPRDlab OMS — atomic UI primitives (mirrors shadcn-svelte vega)
// ---------------------------------------------------------------

const cx = (...parts) => parts.filter(Boolean).join(' ');

function Btn({ variant = 'default', size = '', className = '', children, ...rest }) {
  return (
    <button
      className={cx('sprd-btn', `sprd-btn--${variant}`, size && `sprd-btn--${size}`, className)}
      {...rest}
    >
      {children}
    </button>
  );
}

function Badge({ variant = 'default', className = '', icon, children, style }) {
  return (
    <span className={cx('sprd-badge', `sprd-badge--${variant}`, className)} style={style}>
      {icon && <i className={`ri-${icon}`}></i>}
      {children}
    </span>
  );
}

function Card({ children, topBorder, className = '', ...rest }) {
  return (
    <div
      className={cx('sprd-card', className)}
      style={topBorder ? { borderTop: `3px solid ${topBorder}` } : undefined}
      {...rest}
    >
      {children}
    </div>
  );
}

function SearchInput({ value, onChange, placeholder = 'Search…', className = '' }) {
  return (
    <div className={cx('sprd-input-wrap', className)}>
      <i className="ri-search-line sprd-input-icon"></i>
      <input
        className="sprd-input sprd-input--icon"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
    </div>
  );
}

function FilterTabs({ value, onChange, options }) {
  return (
    <div className="sprd-tabs">
      {options.map(o => (
        <button
          key={o.value}
          className={cx('sprd-tab', value === o.value && 'sprd-tab--active')}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function StarDisplay({ count = 5, size = 12 }) {
  return (
    <span style={{ display: 'inline-flex', gap: 2 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <i
          key={i}
          className={i < Math.round(count) ? 'ri-star-fill' : 'ri-star-line'}
          style={{ fontSize: size, color: i < Math.round(count) ? 'var(--primary)' : 'var(--muted-foreground)' }}
        ></i>
      ))}
    </span>
  );
}

function EmptyState({ icon = 'inbox-2-line', title, subtitle }) {
  return (
    <div className="sprd-empty">
      <i className={`ri-${icon} sprd-empty-icon`}></i>
      <div className="sprd-empty-title">{title}</div>
      {subtitle && <div className="sprd-empty-sub">{subtitle}</div>}
    </div>
  );
}

function formatPrice(n) {
  return 'Rp\u00a0' + n.toLocaleString('id-ID');
}

function formatDate(s) {
  return new Date(s).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

Object.assign(window, { cx, Btn, Badge, Card, SearchInput, FilterTabs, StarDisplay, EmptyState, formatPrice, formatDate });
