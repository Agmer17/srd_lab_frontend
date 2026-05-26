/* global React, PRODUCTS, REVIEWS, cx, Btn, Badge, SearchInput, FilterTabs, EmptyState, formatPrice, formatDate */
const { useState: useProdState, useMemo: useProdMemo } = React;

// ---------------------------------------------------------------
// SPRDlab — Products / Catalog page with slide-in detail panel
// ---------------------------------------------------------------

const CAT_VARIANT = { design: 'default', video: 'secondary', branding: 'accent' };

function ProductsPage({ onNavigate }) {
  const [cat, setCat] = useProdState('all');
  const [search, setSearch] = useProdState('');
  const [selectedId, setSelectedId] = useProdState(null);

  const filtered = useProdMemo(() => {
    return PRODUCTS.filter(p => {
      const matchCat = cat === 'all' || p.category === cat;
      const matchQ = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchQ;
    });
  }, [cat, search]);

  const selected = selectedId ? PRODUCTS.find(p => p.id === selectedId) : null;
  const reviews = selectedId ? REVIEWS.filter(r => r.product_id === selectedId) : [];

  return (
    <div>
      <header className="sprd-header">
        <span className="sprd-crumb">Products</span>
        <div className="sprd-header-actions">
          <button className="sprd-icon-btn"><i className="ri-moon-line"></i></button>
          <button className="sprd-icon-btn"><i className="ri-filter-3-line"></i></button>
        </div>
      </header>

      <div className="products-page">
        <div className="products-head">
          <h1 className="products-h1">Service Catalog</h1>
          <p className="products-sub">
            Pick a service, fill in the brief, pay with QRIS — we kick off the project the same day.
          </p>
        </div>

        <div className="products-controls">
          <div className="products-controls-left">
            <SearchInput
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search services…"
              className=""
            />
            <FilterTabs
              value={cat}
              onChange={setCat}
              options={[
                { value: 'all',      label: 'All' },
                { value: 'design',   label: 'Design' },
                { value: 'video',    label: 'Video' },
                { value: 'branding', label: 'Branding' },
              ]}
            />
          </div>
          <span className="products-count">
            {filtered.length} service{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon="search-line"
            title="No services match"
            subtitle="Try a different category or keyword."
          />
        ) : (
          <div className="products-grid">
            {filtered.map(p => (
              <ProductCard
                key={p.id}
                product={p}
                selected={selectedId === p.id}
                onClick={() => setSelectedId(selectedId === p.id ? null : p.id)}
              />
            ))}
          </div>
        )}
      </div>

      {selected && (
        <>
          <div className="prod-detail-backdrop" onClick={() => setSelectedId(null)} />
          <ProductDetailPanel
            product={selected}
            reviews={reviews}
            onClose={() => setSelectedId(null)}
            onOrder={() => onNavigate('orders')}
          />
        </>
      )}
    </div>
  );
}

/* ── Product card ── */
function ProductCard({ product: p, selected, onClick }) {
  return (
    <div
      className={cx('prod-card', selected && 'prod-card--selected')}
      onClick={onClick}
    >
      <div className="prod-card-thumb" style={{ background: p.tint }}>
        <i className={`ri-${p.icon}`}></i>
      </div>
      <div className="prod-card-body">
        <Badge variant={CAT_VARIANT[p.category]} style={{ alignSelf: 'flex-start' }}>
          {p.category}
        </Badge>
        <div className="prod-card-name">{p.name}</div>
        <div className="prod-card-tagline">{p.description}</div>
        <div className="prod-card-foot">
          <div>
            <span className="prod-card-price-pre">starts at</span>
            <span className="prod-card-price">{formatPrice(p.price)}</span>
          </div>
          <div className="prod-card-rating">
            <i className="ri-star-fill"></i>
            {p.rating_avg}
            <span>({p.rating_count})</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Detail panel ── */
function ProductDetailPanel({ product: p, reviews, onClose, onOrder }) {
  const avgRating = p.rating_avg;
  return (
    <div className="prod-detail-panel">
      {/* Thumb */}
      <div className="prod-detail-thumb" style={{ background: p.tint }}>
        <i className={`ri-${p.icon}`}></i>
        <button className="prod-detail-close" onClick={onClose}>
          <i className="ri-close-line"></i>
        </button>
      </div>

      {/* Scrollable body */}
      <div className="prod-detail-scroll">
        <div className="prod-detail-body">

          {/* Title + meta */}
          <div>
            <h2 className="prod-detail-name">{p.name}</h2>
            <div className="prod-detail-meta">
              <Badge variant={CAT_VARIANT[p.category]}>{p.category}</Badge>
              <div className="prod-detail-meta-rating">
                <i className="ri-star-fill"></i>
                {avgRating} · {p.rating_count} reviews
              </div>
            </div>
          </div>

          {/* Price */}
          <div>
            <div className="prod-detail-price-label">Starting price</div>
            <div className="prod-detail-price">{formatPrice(p.price)}</div>
          </div>

          {/* Description */}
          <p className="prod-detail-desc">{p.description}</p>

          {/* Delivery + revisions */}
          <div className="prod-detail-info">
            <div className="prod-detail-info-item">
              <div className="prod-detail-info-label">Delivery</div>
              <div className="prod-detail-info-value">{p.delivery}</div>
            </div>
            <div className="prod-detail-info-item">
              <div className="prod-detail-info-label">Revisions</div>
              <div className="prod-detail-info-value">{p.revisions}× included</div>
            </div>
          </div>

          {/* Includes */}
          <div>
            <div className="prod-detail-bullets-title">What's included</div>
            <ul className="prod-detail-bullets">
              {p.bullets.map((b, i) => (
                <li key={i}>
                  <i className="ri-check-line"></i>
                  {b}
                </li>
              ))}
            </ul>
          </div>

          {/* Reviews */}
          <div>
            <div className="prod-detail-reviews-head">
              <h3 className="prod-detail-reviews-title">Client reviews</h3>
              <div className="prod-detail-avg">
                <span className="prod-detail-avg-num">{avgRating}</span>
                <div>
                  <div className="prod-detail-avg-stars">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <i key={i} className={i < Math.round(avgRating) ? 'ri-star-fill' : 'ri-star-line'}></i>
                    ))}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--muted-foreground)', textAlign: 'right', marginTop: 2 }}>
                    {p.rating_count} total
                  </div>
                </div>
              </div>
            </div>

            {reviews.length > 0 ? (
              <div className="prod-detail-review-list">
                {reviews.map(r => <ReviewItem key={r.id} review={r} />)}
              </div>
            ) : (
              <div style={{ fontSize: 13, color: 'var(--muted-foreground)', fontStyle: 'italic', padding: '8px 0' }}>
                No reviews yet for this service.
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Sticky CTA */}
      <div className="prod-detail-cta">
        <Btn variant="outline" style={{ flex: 1 }} onClick={onClose}>
          <i className="ri-arrow-left-line"></i> Back
        </Btn>
        <Btn style={{ flex: 2 }} onClick={onOrder}>
          Order now <i className="ri-arrow-right-line"></i>
        </Btn>
      </div>
    </div>
  );
}

/* ── Single review item ── */
function ReviewItem({ review: r }) {
  return (
    <div className="prod-detail-review-item">
      <div className="prod-detail-review-stars">
        {Array.from({ length: 5 }).map((_, i) => (
          <i key={i} className={i < r.rating ? 'ri-star-fill' : 'ri-star-line'}></i>
        ))}
      </div>
      <p className="prod-detail-review-text">{r.comment}</p>
      <div className="prod-detail-review-author">
        <div className="prod-detail-review-avatar">{r.user_initial}</div>
        <div className="prod-detail-review-name">{r.user_name}</div>
        <div className="prod-detail-review-date">{formatDate(r.created_at)}</div>
        {r.verified && (
          <div className="prod-detail-review-verified" style={{ marginLeft: 'auto' }}>
            <i className="ri-shield-check-fill"></i> Verified
          </div>
        )}
      </div>
    </div>
  );
}

window.ProductsPage = ProductsPage;
