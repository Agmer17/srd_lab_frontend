/* global React, PRODUCTS, TESTIMONIALS, cx, Btn, Badge, formatPrice */

// ---------------------------------------------------------------
// SPRDlab — Homepage
// ---------------------------------------------------------------

const PORTFOLIO = [
  { id:'po1', client:'PT Maju Digital',      project:'Brand Refresh 2024',         category:'branding', icon:'sparkling-2-line', tint:'var(--accent)',    result:'3× brand recognition',   year:'2024' },
  { id:'po2', client:'Warung Digital',        project:'TikTok Ad Campaign',          category:'video',    icon:'film-line',        tint:'var(--secondary)', result:'2.1 juta views in 7 days',year:'2024' },
  { id:'po3', client:'Kafe Bulan Baru',       project:'Visual Identity System',      category:'branding', icon:'brush-2-line',     tint:'var(--accent)',    result:'Full brand rollout',      year:'2023' },
  { id:'po4', client:'Startup Nusantara',     project:'Investor Pitch Deck',         category:'design',   icon:'slideshow-2-line', tint:'var(--primary)',   result:'Funded Rp 5B Series A',   year:'2024' },
  { id:'po5', client:'Toko Batik Indah',      project:'Product Photography Edit',    category:'design',   icon:'camera-line',      tint:'var(--primary)',   result:'+65% marketplace CTR',    year:'2024' },
  { id:'po6', client:'Event Organizer Satu',  project:'Annual Gala Documentation',   category:'video',    icon:'camera-3-line',    tint:'var(--secondary)', result:'4K highlight reel',       year:'2024' },
];

const CATEGORY_TILES = [
  {
    id: 'design',
    label: 'Graphic Design',
    sub: 'Logos, social media, packaging, presentations.',
    icon: 'pen-nib-line',
    bg: 'var(--primary)',
    fg: 'var(--primary-foreground)',
    count: 4,
  },
  {
    id: 'video',
    label: 'Video Production',
    sub: 'Company profiles, ads, event documentation.',
    icon: 'video-line',
    bg: 'var(--secondary)',
    fg: '#fff',
    count: 3,
  },
  {
    id: 'branding',
    label: 'Brand Identity',
    sub: 'Full systems, guidelines, brand rollouts.',
    icon: 'sparkling-2-line',
    bg: 'var(--accent)',
    fg: '#fff',
    count: 2,
  },
];

function HomePage({ onNavigate, tweaks = {} }) {
  const featured = PRODUCTS.filter(p => p.is_featured).slice(0, 3);
  const showStats = tweaks.showStats !== false;
  const heroLines = (tweaks.heroHeadline || 'Design that ships.\nVideo that sells.').split('\n');

  return (
    <div>
      {/* Sticky header */}
      <header className="sprd-header">
        <span className="sprd-crumb">Home</span>
        <div className="sprd-header-actions">
          <button className="sprd-icon-btn"><i className="ri-moon-line"></i></button>
          <button className="sprd-icon-btn" style={{ position: 'relative' }}>
            <i className="ri-notification-3-line"></i>
            <span className="sprd-dot"></span>
          </button>
        </div>
      </header>

      <div className="home-page">

        {/* ── Hero ── */}
        <section className="home-hero">
          <div>
            <div className="home-hero-eyebrow">
              <span className="home-hero-eyebrow-dash"></span>
              Creative Agency — Jakarta, Indonesia
            </div>
            <h1 className="home-hero-h1">
              {heroLines.map((line, i) => {
                // highlight first word that matches "Video" or "Design" pattern for visual accent
                const words = line.split(' ');
                return (
                  <span key={i}>
                    {words.map((word, j) => {
                      const isAccent = j === 0 && i > 0;
                      return isAccent
                        ? <span key={j}><span className="home-hero-h1-accent">{word}</span>{' '}</span>
                        : <span key={j}>{word}{' '}</span>;
                    })}
                    {i < heroLines.length - 1 && <br />}
                  </span>
                );
              })}
            </h1>
            <p className="home-hero-sub">
              Browse our catalog, place an order, pay with QRIS, and track your project to delivery — all in one place.
            </p>
            <div className="home-hero-cta">
              <Btn size="lg" onClick={() => onNavigate('products')}>
                Browse services <i className="ri-arrow-right-line"></i>
              </Btn>
              <Btn variant="outline" size="lg">
                Sign in
              </Btn>
            </div>
          </div>

          {showStats && <div className="home-hero-panel">
            <div className="home-panel-logo">
              <img src="assets/logo-mark.svg" alt="SPRDlab" />
            </div>
            <div className="home-stat-grid">
              <div>
                <div className="home-stat-value home-stat-value--accent">120+</div>
                <div className="home-stat-label">Projects delivered</div>
              </div>
              <div>
                <div className="home-stat-value">98%</div>
                <div className="home-stat-label">Client satisfaction</div>
              </div>
              <div>
                <div className="home-stat-value home-stat-value--accent">4.9</div>
                <div className="home-stat-label">Average rating</div>
              </div>
            </div>
            <div className="home-panel-note">
              <i className="ri-shield-check-line" style={{ color: 'var(--primary)', flexShrink: 0 }}></i>
              QRIS · Bank transfer · E-wallet accepted
            </div>
          </div>}
        </section>

        {/* ── Categories ── */}
        <section className="home-section">
          <div className="home-section-head">
            <h2 className="home-section-title">What we create</h2>
            <Btn variant="ghost" size="sm" onClick={() => onNavigate('products')}>
              See all <i className="ri-arrow-right-line"></i>
            </Btn>
          </div>
          <div className="home-cats">
            {CATEGORY_TILES.map(cat => (
              <button
                key={cat.id}
                className="home-cat"
                style={{ background: cat.bg, color: cat.fg }}
                onClick={() => onNavigate('products')}
              >
                <i className={`ri-${cat.icon}`}></i>
                <div>
                  <div className="home-cat-label">{cat.label}</div>
                  <div className="home-cat-sub">{cat.sub}</div>
                </div>
                <div className="home-cat-count">{cat.count} services available</div>
              </button>
            ))}
          </div>
        </section>

        {/* ── Portfolio ── */}
        <section className="home-section">
          <div className="home-section-head">
            <h2 className="home-section-title">Recent work</h2>
            <Badge variant="muted" icon="briefcase-line">{PORTFOLIO.length} projects</Badge>
          </div>
          <div className="home-portfolio-grid">
            {PORTFOLIO.map(p => (
              <div key={p.id} className="home-portfolio-card">
                <div className="home-portfolio-thumb" style={{ background: p.tint }}>
                  <i className={`ri-${p.icon}`}></i>
                </div>
                <div className="home-portfolio-body">
                  <div className="home-portfolio-client">{p.client}</div>
                  <div className="home-portfolio-project">{p.project}</div>
                  <div className="home-portfolio-foot">
                    <Badge variant={p.category === 'design' ? 'default' : p.category === 'video' ? 'secondary' : 'accent'}>
                      {p.category}
                    </Badge>
                    <div className="home-portfolio-result">
                      <i className="ri-arrow-up-line"></i>{p.result}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Featured services ── */}
        <section className="home-section">
          <div className="home-section-head">
            <h2 className="home-section-title">Featured services</h2>
            <Btn variant="ghost" size="sm" onClick={() => onNavigate('products')}>
              View all <i className="ri-arrow-right-line"></i>
            </Btn>
          </div>
          <div className="home-products-grid">
            {featured.map(p => (
              <div key={p.id} className="home-prod-card" onClick={() => onNavigate('products')}>
                <div className="home-prod-thumb" style={{ background: p.tint }}>
                  <i className={`ri-${p.icon}`}></i>
                </div>
                <div className="home-prod-body">
                  <div className="home-prod-cat">{p.category}</div>
                  <div className="home-prod-name">{p.name}</div>
                  <div className="home-prod-foot">
                    <div className="home-prod-price">{formatPrice(p.price)}</div>
                    <div className="home-prod-rating">
                      <i className="ri-star-fill"></i>
                      {p.rating_avg}
                      <span style={{ color: 'var(--muted-foreground)' }}>({p.rating_count})</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Testimonials ── */}
        <section className="home-section">
          <div className="home-section-head">
            <h2 className="home-section-title">What clients say</h2>
            <Badge variant="success" icon="star-fill">
              {TESTIMONIALS.length * 10}+ verified reviews
            </Badge>
          </div>
          <div className="home-testimonials-grid">
            {TESTIMONIALS.map(t => (
              <div key={t.id} className="home-testimonial">
                <div className="home-testi-stars">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <i key={i} className="ri-star-fill"></i>
                  ))}
                </div>
                <p className="home-testi-text">{t.comment}</p>
                <div className="home-testi-author">
                  <div className="home-testi-avatar">{t.user_initial}</div>
                  <div>
                    <div className="home-testi-name">{t.user_name}</div>
                    <div className="home-testi-company">{t.company}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA Banner ── */}
        <div className="home-cta-banner">
          <div className="home-cta-text">
            <h2>Ready to start your project?</h2>
            <p>Pick a service, fill in your brief, and we kick off the same day.</p>
          </div>
          <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
            <Btn size="lg" onClick={() => onNavigate('products')}>
              Browse services <i className="ri-arrow-right-line"></i>
            </Btn>
            <Btn
              variant="outline"
              size="lg"
              style={{ background: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.2)', color: '#fff' }}
            >
              Contact us
            </Btn>
          </div>
        </div>

      </div>
    </div>
  );
}

window.HomePage = HomePage;
