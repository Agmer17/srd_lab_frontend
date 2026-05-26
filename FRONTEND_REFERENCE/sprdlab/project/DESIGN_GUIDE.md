# SPRDlab Creative — OMS Design & Implementation Guide

> **Purpose:** This document is a complete, self-contained guide for any LLM to fully recreate or extend the SPRDlab Creative Order Management System (OMS). Read it end-to-end before writing any code.

---

## 1. Project overview

**SPRDlab Creative** is an Indonesian creative agency (graphic design + video production). The OMS is a web app where clients:

1. Browse the service catalog at `/products`
2. Place an order and complete payment (QRIS / bank transfer / e-wallet) at `/payment`
3. Track their project's progress at `/projects`
4. View payment history at `/payments`
5. Leave a review when the project is completed at `/review`

### Brand name
**SPRDlab Creative** — exact capitalisation always. Never "srdlab" or "SPRDLAB".

### Repos
| Repo | Purpose |
|---|---|
| `Agmer17/srd_lab_frontend` | SvelteKit 2 + shadcn-svelte frontend (production) |
| `Agmer17/srd_lab_creative` | Go REST API backend |

---

## 2. Tech stack

### Production
| Layer | Technology |
|---|---|
| Framework | SvelteKit 2 |
| UI components | shadcn-svelte (vega style preset) |
| CSS | Tailwind CSS v4 |
| Icons | Remixicon (`remixicon-svelte`) |
| Fonts | Inter Variable · Space Grotesk 700 · JetBrains Mono |
| Auth | Google OAuth via SvelteKit server hooks |
| Backend | Go REST API at `PUBLIC_API_URL` |
| Payments | QRIS · bank transfer · e-wallet (Midtrans / custom) |

### HTML prototype (this project)
React 18.3.1 + Babel standalone. No build step.
```html
<script src="https://unpkg.com/react@18.3.1/umd/react.development.js"
  integrity="sha384-hD6/rw4ppMLGNu3tX5cjIb+uRZ7UkRJ6BPkLpg4hAu/6onKUg4lLsHAs9EBPT82L" crossorigin="anonymous"></script>
<script src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.development.js"
  integrity="sha384-u6aeetuaXnQ38mYT8rp6sbXaQe3NL9t+IBXmnYxwkUI2Hw4bsp2Wvmx4yRQF1uAm" crossorigin="anonymous"></script>
<script src="https://unpkg.com/@babel/standalone@7.29.0/babel.min.js"
  integrity="sha384-m08KidiNqLdpJqLq95G/LEi8Qvjl/xUYll3QILypMoQ65QorJ9Lvtp2RXYGBFj1y" crossorigin="anonymous"></script>
```

---

## 3. Design tokens

All tokens live in `colors_and_type.css`. Reference them only via `var(--*)`.

### Core palette
```css
/* Light mode */
--primary:              oklch(0.86 0.17 91);    /* Bold yellow — CTAs, highlights */
--primary-foreground:   oklch(0.38 0.14 265);   /* Navy text ON yellow */
--secondary:            oklch(0.38 0.14 265);   /* Deep navy — sidebar, buttons */
--secondary-foreground: oklch(1 0 0);
--accent:               oklch(0.64 0.21 25);    /* Red — alerts, branding accents */
--accent-foreground:    oklch(1 0 0);
--destructive:          oklch(0.44 0.16 27);    /* Dark red — errors, cancelled */
--chart-4:              oklch(0.70 0.15 162);   /* Green — paid / completed */
--background:           oklch(0.98 0.002 248);  /* Warm off-white "paper" */
--card:                 oklch(1 0 0);           /* Pure white */
--muted:                oklch(0.78 0.056 256);
--muted-foreground:     oklch(0.23 0.046 21);
--border:               oklch(0.605 0.002 17);
/* Sidebar tokens (always dark regardless of mode) */
--sidebar:              oklch(0.38 0.14 265);
--sidebar-foreground:   oklch(1 0 0);
--sidebar-primary:      oklch(0.86 0.17 91);    /* Yellow active pill */
--sidebar-primary-foreground: oklch(0.38 0.14 265);
--sidebar-accent:       oklch(0.55 0.22 263);
--sidebar-border:       oklch(0.37 0.039 257);
```

### Shadows (light mode — 2px diagonal offset, gives "stamped on paper" feel)
```css
--shadow-xs: 2px 2px 4px 0px hsl(0 0% 0% / 0.07);
--shadow-sm: 2px 2px 4px 0px hsl(0 0% 0% / 0.15), 2px 1px 2px -1px hsl(0 0% 0% / 0.15);
```

### Typography
| Role | Font | Size | Weight |
|---|---|---|---|
| Hero headline | Space Grotesk | 46–48px | 700 |
| Page H1 | Inter | 24px | 700 |
| Section title | Inter | 18px | 600 |
| Card title | Inter | 14–15px | 600 |
| Body | Inter | 14px | 400 |
| Helper / sub | Inter | 12–13px | 400 |
| Eyebrow | Inter | 10–11px | 700 uppercase tracking-wide |
| Price / ID | JetBrains Mono | varies | 600–700 |

### Radii
| Token | Value | Usage |
|---|---|---|
| `--radius-md` | ~6.5px | Buttons, inputs |
| `--radius-xl` | ~11px | Cards |
| `--radius-4xl` | ~20px | Badges (pill) |
| `border-radius: 50%` | — | Avatars |

---

## 4. Component vocabulary

### Button `.sprd-btn`
```html
<button class="sprd-btn sprd-btn--default">Order now</button>
<button class="sprd-btn sprd-btn--secondary">View</button>
<button class="sprd-btn sprd-btn--outline">Cancel</button>
<button class="sprd-btn sprd-btn--ghost">See all →</button>
<!-- Sizes: --sm (30px h), default (36px), --lg (44px) -->
```
- Press: `transform: translateY(1px)` — the signature micro-interaction
- Primary hover: opacity drop, not a darker shade

### Badge `.sprd-badge`
```html
<span class="sprd-badge sprd-badge--default">Design</span>      <!-- yellow -->
<span class="sprd-badge sprd-badge--secondary">Video</span>     <!-- navy -->
<span class="sprd-badge sprd-badge--accent">Pending</span>      <!-- red -->
<span class="sprd-badge sprd-badge--success">Completed</span>   <!-- green -->
<span class="sprd-badge sprd-badge--destructive">Cancelled</span>
<span class="sprd-badge sprd-badge--muted">Unpaid</span>
```

### Card `.sprd-card`
```css
background: var(--card);
border-radius: 14px;
padding: 20px;
box-shadow: inset 0 0 0 1px oklch(0 0 0 / .08), var(--shadow-xs);
```
Add status top border: `border-top: 3px solid var(--chart-4)` for completed, `var(--secondary)` for in-progress, `var(--destructive)` for cancelled.

### Sidebar item states
| State | Style |
|---|---|
| Default | `rgba(255,255,255, 0.75)` text, transparent bg |
| Hover | `var(--sidebar-accent)` bg |
| Active | `var(--sidebar-primary)` bg + `var(--sidebar-primary-foreground)` text, bold |
| Review/special | `var(--primary)` yellow text + badge count |

---

## 5. Status → colour mapping

| Status | Token | Used on |
|---|---|---|
| `in_progress` / `pending_payment` | `--secondary` navy | Badge, progress bar fill, card top border |
| `completed` / `paid` | `--chart-4` green | Badge, top border, full progress bar |
| `cancelled` / `failed` | `--destructive` red | Badge, top border |
| `pending` | `--accent` red | Top border |
| `unpaid` | `--muted` grey | Badge |
| `expired` | `--destructive` | Badge |

---

## 6. TypeScript data models

```typescript
interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;          // IDR integer, no decimals
  status: string;         // 'active' | 'inactive'
  is_featured: boolean;
  created_at: string;     // ISO 8601
  updated_at: string;
}

interface Order {
  id: string;
  user_id: string;
  product_id: string;
  ordered_price: number;
  status: string;         // 'pending' | 'in_progress' | 'completed' | 'cancelled'
  created_at: string;
  updated_at: string;
  user: User;
  product?: Product | null;
  payment: Payment[];
}

interface Payment {
  payment_id: string;
  order_id: string;
  method: string | null;  // 'qris' | 'bank_transfer' | 'ewallet'
  status: string;         // 'paid' | 'unpaid' | 'pending' | 'failed' | 'expired' | 'cancelled'
  amount: number;
  fee: number;
  total_payment: number | null;
  payment_number: string | null;
  expired_at: string | null;
  paid_at: string | null;
  created_at: string;
}

interface Project {
  id: string;
  order_id: string;
  name: string;
  description: string | null;
  status: string;         // 'pending' | 'in_progress' | 'completed' | 'cancelled'
  allowed_revision_count: number;
  project_members: ProjectMember[];
  progress: ProjectProgress[];
  project_revision?: ProjectRevision[];
  order?: Order | null;
  actual_start_date: string | null;
  end_date: string | null;
  created_at: string;
  updated_at: string;
}

interface User {
  id: string;
  global_role: 'ADMIN' | 'USER';
  full_name: string;
  email: string;
  phone_number: string | null;
  profile_picture: string;
  gender: 'male' | 'female' | string;
  oauth_provider: 'GOOGLE' | string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

// Review — not yet in production; needs to be added to Go backend
interface Review {
  id: string;
  product_id: string;
  order_id: string;
  user_id: string;
  user_name: string;
  rating: number;         // 1–5
  comment: string;
  is_anonymous: boolean;
  tags: string[];         // e.g. ['Professional', 'Fast delivery']
  created_at: string;
  verified: boolean;      // order was paid + completed
}
```

---

## 7. API endpoints

### Public (no auth)
| Method | Route | Description |
|---|---|---|
| GET | `/products` | Service catalog page |
| POST | `/api/auth/login/google` | Google OAuth |
| GET | `/api/reviews/product/[id]` | Reviews for a product *(to be built)* |

### Protected (session cookie required)
| Method | Route | Description |
|---|---|---|
| GET | `/api/orders/my-orders` | User's orders |
| GET | `/api/orders/details/[id]` | Single order |
| PUT | `/api/orders/update/[id]/status` | Update order status |
| GET | `/api/projects/all` | Projects (server filters by user) |
| GET | `/api/user/my-profile` | Current user |
| PUT | `/api/user/update/[id]` | Update profile |
| GET | `/api/chat/latest` | Latest chat channels |
| POST | `/api/chat/personal/send/[targetId]` | Send DM |
| POST | `/api/reviews` | Submit review *(to be built)* |

### Admin only
| Method | Route | Description |
|---|---|---|
| GET | `/api/orders/all` | All orders |
| GET | `/api/user/all` | All users |
| PUT | `/api/user/update-role/[id]` | Change role |
| DELETE | `/api/user/delete/[id]` | Delete user |

---

## 8. Routing

| Route | Guard | Screen |
|---|---|---|
| `/` | Public | Homepage |
| `/products` | Public | Service catalog |
| `/auth` | Public | Google sign-in |
| `/payment` | Auth | Payment flow |
| `/payments` | Auth | Payment history |
| `/orders` | Auth | Order list |
| `/projects` | Auth | Project board |
| `/projects/details/[id]` | Auth | Project detail |
| `/review/[orderId]` | Auth | Post-completion review |
| `/chat` | Auth | Chat dashboard |
| `/my-profile` | Auth | Profile settings |
| `/user-management` | Admin | User/role management |

---

## 9. Page-by-page design spec

### 9.1 Homepage (`/`)

**Layout:** App shell (sidebar + main content). Max-width 1024px, padding `32px 28px 80px`.

**Sections in order:**
1. **Hero** — 2-col grid (1.6fr / 1fr)
   - Left: eyebrow `Creative Agency — Jakarta, Indonesia` with yellow dash, H1 `Design that ships. / Video that sells.` (Space Grotesk 46px), subtext, two CTAs: `Browse services` (primary) + `Sign in` (outline)
   - Right: navy panel with logo mark, 3 stats (`120+ Projects delivered` / `98% Client satisfaction` / `4.9 Average rating`), payment methods note at bottom

2. **"What we create"** — 3 category tiles
   - Design (yellow bg), Video (navy bg), Branding (red bg)
   - Each tile: icon, label, sub-description, service count in mono font
   - Hover: `translateY(-3px)` + shadow

3. **"Recent work"** — Portfolio grid (3 cols, 6 cards)
   - Card: colored thumb (icon), client name eyebrow, project title, category badge + result stat
   - Result stat in green: e.g. "2.1 juta views in 7 days", "Funded Rp 5B Series A"

4. **"Featured services"** — 3 featured product cards (filtered by `is_featured: true`)
   - Card: colored thumb, category eyebrow, name, price + rating row

5. **"What clients say"** — 4 testimonial cards (2×2 grid)
   - Stars, quote text, author avatar (initials) + name + company
   - Divider between text and author footer

6. **CTA Banner** — full-width navy block
   - "Ready to start your project?" (Space Grotesk) + subtext
   - `Browse services` (primary) + `Contact us` (outline) buttons

**Guest vs logged-in differences:**
- Sidebar shows "Get started" CTA block when guest
- Sidebar shows user card + "My Activity" nav group when logged in
- Homepage content is identical for both states

---

### 9.2 Products page (`/products`)

**Layout:** Max-width 1024px. Sticky header.

**Controls row:**
- Search input (flex: 1, max ~340px)
- Filter tabs: All / Design / Video / Branding
- Count label: `N services` in JetBrains Mono

**Product grid:** `repeat(auto-fill, minmax(250px, 1fr))`, gap 16px

**Product card:**
- Thumb (108px height, colored bg + icon)
- Category badge (self-start)
- Name (14px 600)
- Description (2-line clamp)
- Footer: price (`starts at Rp X`) + rating (star + number + count)
- Selected state: `inset 0 0 0 2px var(--secondary)` border

**Detail panel (right-side drawer):**
- Triggered by clicking any product card
- `position: fixed; right: 0; width: 480px` — slides in from right (`translateX` animation)
- Backdrop with `backdrop-filter: blur(2px)`
- Contents (scrollable): colored thumb (200px) with close button, product name + meta, starting price (30px mono), description, delivery + revisions info grid, "What's included" bullet list, reviews section
- Sticky footer CTA: Back (outline) + Order now (primary)
- Review items: stars, comment text, avatar initials, name, date, verified badge

---

### 9.3 Payment page (`/payment`)

**Layout:** 2-col grid (1.4fr / 1fr), max-width 1024px.

**Left column — method selection + active panel:**

Method cards (3):
1. **QRIS** (recommended pill) — icon `ri-qr-code-line`
2. **Bank Transfer** — icon `ri-bank-line`
3. **E-Wallet** — icon `ri-wallet-3-line`

Active method card: `border-color: var(--secondary)` + `box-shadow: 0 0 0 3px oklch(0.38 0.14 265 / .15)`

**QRIS panel (when QRIS selected):**
- Header row: "Scan to pay" label + live countdown timer (15:00, JetBrains Mono, red when <60s)
- QR code: white rounded box, black pixel squares, SPRDlab logo centred
- Instruction text
- "I've completed the payment" primary button

**Bank Transfer panel:**
- 3 bank rows: BCA / BRI / Mandiri, account number in mono, holder name, copy-to-clipboard button
- Copy button shows check icon + green border when copied
- Info box: "Upload payment proof via chat to confirm"

**E-Wallet panel:**
- 2×4 grid tiles: GoPay (blue) / OVO (purple) / DANA (blue) / ShopeePay (orange)
- Each tile: colored square mark + wallet name
- Click → success state

**Right column — order summary (sticky, top: 68px):**
- Summary header
- Product row: thumb + name + order ID
- Price breakdown: service price + processing fee (1%)
- Dashed divider
- Total in large mono (22px)
- Security note with green shield icon

**Success state (full-page, replaces layout):**
- Green circle icon (animated `popIn`)
- "Payment confirmed!" (Space Grotesk)
- Confirmation text with total amount
- Two CTAs: Payment history + View my projects

---

### 9.4 Payment History page (`/payments`)

**Layout:** Max-width 1152px (wider for table). Sticky header.

**Stats row (4 cards):**
1. Total spent (mono, dark) — sum of all `paid` payments
2. Paid count (green)
3. Awaiting payment count (navy)
4. Total transactions

**Controls:**
- Search input (max 340px) — filters by product name or payment ID
- Filter tabs: All / Paid / Unpaid / Expired

**Table columns:**
| Column | Notes |
|---|---|
| Service | Product name (500 weight) + Order ID below in mono |
| Payment ID | Mono, muted |
| Method | Badge: QRIS / Bank / E-Wallet / — |
| Amount | Right-aligned mono, fee sub-label below |
| Status | `sprd-badge` with status variant |
| Date | `paid_at` if paid, else `created_at` in muted |
| Action | "Pay now" button only on unpaid/pending rows |

Unpaid rows: hover `background: oklch(0.96 0.01 90)` (warm tint)

---

### 9.5 Review page (`/review/[orderId]`)

**Trigger:** Only when `order.status === 'completed'` AND no review exists. Surface via "Write a Review" sidebar item (with badge `1`).

**Sections:**
1. **Completion badge:** `Project Completed` pill (green border + bg)
2. **Completion icon:** Green circle `ri-checkbox-circle-line`
3. **Headline:** "Your project is complete!" (Space Grotesk 30px)
4. **Order summary card:** Green top border, product thumb + name + order ID + project name + completion date + amount + Completed badge
5. **Review form card:**
   - **Star rating:** 5 interactive stars, 34px, hover scale 1.18×, label per rating (Poor / Below average / Average / Good / Excellent)
   - **Quick tags:** Pill toggles — Professional / Fast delivery / Creative / Responsive / Great quality / Exceeded expectations / Good communication / Will order again
   - **Comment textarea:** 500 char limit with live counter
   - **Anonymous checkbox:** custom styled
   - **Submit button:** disabled until rating > 0

**Thank-you state:** Animated popIn check icon + "Thanks for the feedback!" + two CTAs

---

## 10. Sidebar navigation

```
SPRDlab Creative         ← brand name (exact)

[Guest]
Browse
  Home
  Products
  [Guest CTA box: "Sign in to access…" + Get started button]

[Logged in]
Main
  Home
  Products
My Activity
  Orders
  Payments
  Projects
  Chat
  Write a Review  ← yellow text + badge "1" when review pending

[Admin only]
Admin
  Users
  Analytics
```

Footer (logged in only): Sign out button

---

## 11. Copywriting rules

| Surface | Style | Example |
|---|---|---|
| Page H1 | Title Case | `Service Catalog`, `Payment History` |
| Sidebar eyebrows | ALL CAPS wide tracking | `MY ACTIVITY`, `BROWSE` |
| Body text | Sentence case | `View and manage your recent transactions.` |
| Primary buttons | Title Case | `Browse Services`, `Order Now` |
| Status badges | Single capitalised word | `Completed`, `Pending`, `Expired` |
| Empty states | Short + sub | `No payments found` / `Try a different filter.` |
| Prices | Indonesian locale | `Rp 2.000.000` |
| Dates | Indonesian locale | `15 Feb 2024` |

- **Voice:** Second person. "Your project", "your orders". Never "we" in chrome.
- **Language:** Mixed — UI labels in English, contextual prose can use Indonesian.
- **No emoji** in product chrome. Acceptable in user-generated content.
- **No exclamation marks** except in celebratory messages (payment confirmed, review thanks).

---

## 12. Icon usage

All icons from **Remixicon**. Load via CDN:
```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/remixicon@4.5.0/fonts/remixicon.css">
<i class="ri-home-2-line"></i>
```

Use **Line** variants everywhere except:
- Kebab menus: `ri-more-2-fill`
- Filled stars in ratings: `ri-star-fill`
- Verified badges: `ri-shield-check-fill`

| Icon | Usage |
|---|---|
| `ri-home-2-line` | Home nav |
| `ri-layout-grid-line` | Products nav |
| `ri-file-list-line` | Orders nav |
| `ri-bank-card-line` | Payments nav |
| `ri-folder-line` | Projects nav |
| `ri-message-2-line` | Chat nav |
| `ri-star-line` | Review nav |
| `ri-qr-code-line` | QRIS method |
| `ri-bank-line` | Bank transfer method |
| `ri-wallet-3-line` | E-wallet method |
| `ri-shield-check-line` | Payment security note |
| `ri-check-double-line` | Completion badge |
| `ri-sparkling-2-line` | Branding category |
| `ri-video-line` | Video category |
| `ri-pen-nib-line` | Design category |

---

## 13. Formatting helpers

```typescript
// Price — always IDR, Indonesian locale, non-breaking space
function formatPrice(n: number): string {
  return 'Rp\u00a0' + n.toLocaleString('id-ID');
}

// Date — Indonesian short format
function formatDate(s: string): string {
  return new Date(s).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric'
  });
}

// Initials from full name (2 words max)
function getInitials(name: string): string {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

// Payment fee: 1% of amount
const fee = Math.round(amount * 0.01);
const total = amount + fee;
```

---

## 14. File structure (prototype)

```
SPRDlab OMS.html           ← Entry point. Loads all scripts, defines mock data, App component
sprdlab.css                ← All styles (imports colors_and_type.css)
colors_and_type.css        ← Design system tokens (light + dark CSS vars)

app-ui.jsx                 ← Primitives: Btn, Badge, Card, SearchInput, FilterTabs, etc.
app-sidebar.jsx            ← AppSidebar component
home-page.jsx              ← HomePage (hero + portfolio + products + testimonials + CTA)
products-page.jsx          ← ProductsPage + ProductCard + ProductDetailPanel + ReviewItem
payment-page.jsx           ← PaymentPage (QRIS / bank transfer / e-wallet + success state)
payment-history-page.jsx   ← PaymentHistoryPage (stats + table)
review-page.jsx            ← ReviewPage (star rating + tags + submit + thank-you)
tweaks-panel.jsx           ← TweaksPanel starter component (design tweaks)

assets/
  logo-mark.svg            ← Brand mark placeholder (navy + yellow triangle + red spark)
  logo-wordmark.svg        ← Wordmark on light
  logo-wordmark-inverse.svg← Wordmark on dark

DESIGN_GUIDE.md            ← This file
```

---

## 15. Mock data structure

```javascript
// Product (8 items: 4 design, 3 video, 2 branding)
// is_featured: true on first 3
const PRODUCTS = [
  { id, name, slug, description, price, category, is_featured, status,
    bullets: string[],   // 4 bullet points
    icon,                // remixicon name without 'ri-'
    tint,                // CSS value for thumb background
    fg,                  // foreground color on tint
    delivery,            // e.g. '3–5 business days'
    revisions,           // number
    rating_avg,          // 4.7–5.0
    rating_count,        // 11–56
  }
];

// Reviews (1–3 per product)
const REVIEWS = [
  { id, product_id, user_name, user_initial, rating, comment, created_at, verified }
];

// Homepage testimonials (4, static)
const TESTIMONIALS = [
  { id, user_name, user_initial, company, rating, comment }
];

// Payment page context
const MOCK_PENDING_ORDER = {
  id, product_name, product_id, product_icon, product_tint, ordered_price, status
};

// Review page context
const MOCK_COMPLETED_ORDER = {
  id, product_id, product_name, product_icon, product_tint,
  ordered_price, status, completed_at, project_name
};

// Payment history (5 items covering all statuses)
const MOCK_PAYMENT_HISTORY = [
  { payment_id, order_id, product_name, method, status,
    amount, fee, total_payment, paid_at, created_at }
];
```

---

## 16. How to extend

### Adding a new screen
1. Create `my-screen.jsx` — export `window.MyScreen = MyScreen`
2. Add `<script type="text/babel" src="my-screen.jsx"></script>` to HTML before the app script
3. Add nav item to `NAV_ITEMS` in `app-sidebar.jsx`
4. Add route branch in `App()` in `SPRDlab OMS.html`
5. Add page name to `BUILT_PAGES` array

### Adding a new Tweak
1. Add key + default to `TWEAK_DEFAULTS` JSON block in `SPRDlab OMS.html`
2. Add a `<TweakToggle>` / `<TweakSelect>` / `<TweakText>` inside `<TweaksPanel>`
3. Read the value via `tweaks.myKey` and pass as prop to the relevant screen

### Connecting to the real API
Replace mock arrays with `fetch()` in `useEffect`. The SvelteKit proxy endpoints forward to `PUBLIC_API_URL` with session cookies automatically attached.

### Review API (build this in Go)
```
POST /api/reviews
  body: { order_id, rating, comment, tags: string[], is_anonymous }
  → creates Review, marks order as reviewed

GET /api/reviews/product/:id
  → returns []Review, public endpoint

GET /api/reviews/my
  → returns []Review for current user, auth required
```

### Dark mode
All tokens have dark overrides in `colors_and_type.css` under `.dark {}`. Toggle by adding/removing `dark` class on `<html>`. Sidebar is already dark by design (uses `--sidebar-*` tokens independent of mode).
