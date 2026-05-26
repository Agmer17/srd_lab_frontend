/* global React, cx */

// ---------------------------------------------------------------
// SPRDlab — App Sidebar, mirrors appSidebar.svelte
// ---------------------------------------------------------------

const BROWSE_ITEMS = [
  { id: 'home',     label: 'Home',     icon: 'ri-home-2-line' },
  { id: 'products', label: 'Products', icon: 'ri-layout-grid-line' },
];

const USER_ITEMS = [
  { id: 'orders',   label: 'Orders',   icon: 'ri-file-list-line' },
  { id: 'payments', label: 'Payments', icon: 'ri-bank-card-line' },
  { id: 'projects', label: 'Projects', icon: 'ri-folder-line' },
  { id: 'chat',     label: 'Chat',     icon: 'ri-message-2-line' },
  { id: 'review',   label: 'Write a Review', icon: 'ri-star-line', special: 'review' },
];

const ADMIN_ITEMS = [
  { id: 'users',     label: 'Users',     icon: 'ri-user-line' },
  { id: 'analytics', label: 'Analytics', icon: 'ri-bar-chart-line' },
];

function AppSidebar({ currentPage, onNavigate, user }) {
  const isAdmin = user && user.role === 'ADMIN';

  function NavItem({ item }) {
    const isActive = currentPage === item.id;
    return (
      <button
        className={cx(
          'sprd-sidebar-item',
          user && item.id !== 'home' && item.id !== 'products' && 'sprd-sidebar-item--dim',
          item.special === 'review' && !isActive && 'sprd-sidebar-item--review',
          isActive && 'sprd-sidebar-item--active'
        )}
        onClick={() => onNavigate(item.id)}
      >
        <i className={item.icon}></i>
        <span>{item.label}</span>
        {item.special === 'review' && !isActive && (
          <span style={{
            marginLeft: 'auto',
            background: 'var(--primary)',
            color: 'var(--primary-foreground)',
            fontSize: 8, fontWeight: 800,
            padding: '1px 5px', borderRadius: 99,
            letterSpacing: '0.02em'
          }}>1</span>
        )}
      </button>
    );
  }

  return (
    <nav className="sprd-sidebar">
      {/* Header */}
      <div className="sprd-sidebar-header">
        <div className="sprd-sidebar-brand">SPRDlab Creative</div>
        {user ? (
          <button className="sprd-user-card" onClick={() => onNavigate('profile')}>
            <div className="sprd-user-avatar">{user.initials}</div>
            <div className="sprd-user-info">
              <div className="sprd-user-name">{user.name}</div>
              <div className="sprd-user-email">{user.email}</div>
            </div>
            <span className="sprd-role-pill">{user.role}</span>
          </button>
        ) : (
          <div style={{ padding: '4px 8px 2px' }}>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', marginBottom: 2 }}>Not signed in</div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="sprd-sidebar-content">
        <div className="sprd-sidebar-group-label">{user ? 'Main' : 'Browse'}</div>
        <div className="sprd-sidebar-menu">
          {BROWSE_ITEMS.map(item => <NavItem key={item.id} item={item} />)}
        </div>

        {user && (
          <>
            <div className="sprd-sidebar-divider"></div>
            <div className="sprd-sidebar-group-label">My Activity</div>
            <div className="sprd-sidebar-menu">
              {USER_ITEMS.map(item => <NavItem key={item.id} item={item} />)}
            </div>
          </>
        )}

        {isAdmin && (
          <>
            <div className="sprd-sidebar-divider"></div>
            <div className="sprd-sidebar-group-label">Admin</div>
            <div className="sprd-sidebar-menu">
              {ADMIN_ITEMS.map(item => (
                <button
                  key={item.id}
                  className={cx('sprd-sidebar-item', currentPage === item.id && 'sprd-sidebar-item--active')}
                  style={{ color: 'rgba(134, 183, 31, 0.9)' }}
                  onClick={() => onNavigate(item.id)}
                >
                  <i className={item.icon}></i>
                  {item.label}
                </button>
              ))}
            </div>
          </>
        )}

        {!user && (
          <div className="sprd-guest-cta">
            <p>Sign in to access your orders, projects, and messages.</p>
            <button className="sprd-guest-cta-btn" onClick={() => onNavigate('auth')}>
              Get started
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      {user && (
        <div className="sprd-sidebar-footer">
          <button className="sprd-signout">
            <i className="ri-logout-box-r-line"></i>
            Sign out
          </button>
        </div>
      )}
    </nav>
  );
}

window.AppSidebar = AppSidebar;
