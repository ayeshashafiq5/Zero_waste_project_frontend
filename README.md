# zero-waste-frontend

React 18 + Vite + Tailwind CSS SPA for [Zero-Waste Food Connect](../README.md).

---

## 🚀 Run Locally

```bash
cp .env.example .env   # fill in the four required variables
npm install
npm run dev            # → http://localhost:5173
```

### Available Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Preview production build on port 5173 |
| `npm run lint` | Run ESLint across `src/` |

---

## 🌍 Environment Variables

Create `.env` from `.env.example` and fill in:

```env
VITE_API_URL=http://localhost:5000          # Backend base URL (no /api/v1 suffix)
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key        # Safe to expose in browser
VITE_GOOGLE_MAPS_API_KEY=                   # Optional — SVG map used if blank
VITE_VAPID_PUBLIC_KEY=                      # Required only for push notifications
```

> `VITE_GOOGLE_MAPS_API_KEY` — if set, `MapPanel` renders a real Google Map with markers and a service-radius circle. If absent, an interactive SVG projection is used instead (works fully offline).

---

## 📁 Full Project Structure

```
zero-waste-frontend/
├── public/
│   ├── sw.js                    # Service worker — offline cache + Web Push handler
│   ├── manifest.json            # PWA manifest
│   ├── favicon.svg
│   ├── icon-192.svg             # Notification / PWA icon
│   ├── icon-512.svg
│   └── badge-72.svg             # Notification badge icon
│
└── src/
    ├── main.jsx                 # App entry — renders provider tree + registers sw.js
    ├── App.jsx                  # React Router route definitions
    ├── index.css                # Tailwind directives + global component classes
    │
    ├── lib/
    │   └── supabase.js          # Browser Supabase client (anon key — never exposes service role)
    │
    ├── context/
    │   └── AuthContext.jsx      # AuthProvider + useAuth — session, profile, role, signIn/signUp/signOut
    │
    ├── hooks/
    │   ├── useAuth.js           # Re-exports useAuth from AuthContext (convenience alias)
    │   ├── useFoodListings.js   # Initial REST fetch + Supabase Realtime subscription
    │   ├── useLocation.js       # Browser geolocation with Lahore fallback (31.5204, 74.3587)
    │   └── usePushNotifications.js  # Service worker registration + subscribe / unsubscribe
    │
    ├── services/
    │   ├── api.js               # Axios instance (baseURL + /api/v1) + JWT interceptor + 401 handler
    │   ├── authService.js       # GET/PATCH /auth/profile
    │   ├── foodService.js       # All /food endpoints (list, mine, stats, nearby, CRUD, accept, collect, release, cancel)
    │   ├── ngoService.js        # GET /ngo/requests  GET /ngo/stats
    │   ├── notificationService.js  # VAPID key + subscribe + unsubscribe
    │   ├── ratingService.js     # POST /ratings  GET /ratings/mine  GET /ratings/user/:id
    │   └── uploadService.js     # POST /upload/food-image (multipart)  DELETE /upload/food-image
    │
    ├── components/
    │   │
    │   ├── common/
    │   │   ├── AppShell.jsx         # Wrapper for authenticated pages: Navbar + max-width content + Footer
    │   │   ├── CameraCapture.jsx    # In-browser camera modal for food photo capture
    │   │   ├── ConfirmModal.jsx     # Generic confirmation dialog (destructive / non-destructive variants)
    │   │   ├── EmptyState.jsx       # Centered icon + title + description + optional action slot
    │   │   ├── ErrorBoundary.jsx    # React error boundary wrapping the entire app
    │   │   ├── Footer.jsx           # Site-wide footer with copyright and links
    │   │   ├── ImageUpload.jsx      # Drag-and-drop / file-picker / camera upload with progress bar
    │   │   ├── LoadingSpinner.jsx   # Animated spinner (sm/md/lg sizes, optional fullScreen mode)
    │   │   ├── Logo.jsx             # Brand mark (sm/md/lg sizes, optional stacked layout)
    │   │   ├── Navbar.jsx           # Sticky top nav — desktop links + mobile hamburger drawer
    │   │   ├── NotificationDropdown.jsx  # Bell icon + Supabase Realtime notification feed
    │   │   ├── Pagination.jsx       # Page-navigation bar with ellipsis (PAGE_SIZE = 10)
    │   │   ├── ProtectedRoute.jsx   # Auth + role guard using React Router <Outlet>
    │   │   ├── RatingModal.jsx      # Bottom-sheet rating modal with stars, tags, comment
    │   │   ├── StatusBadge.jsx      # Colour-coded pill for listing statuses
    │   │   └── TestCredentials.jsx  # Dev-only login helper (fill-in button on Login page)
    │   │
    │   ├── ngo/
    │   │   ├── FoodCard.jsx         # Card shown in NGO Browse / Dashboard feed — Accept button
    │   │   ├── MapPanel.jsx         # Google Maps (with key) or SVG projection — markers + radius ring
    │   │   └── PushSubscribePanel.jsx  # Dismissible banner prompting NGOs to enable push
    │   │
    │   └── restaurant/
    │       └── ListingCard.jsx      # Compact listing row for the Dashboard recent-listings list
    │
    ├── pages/
    │   ├── Home.jsx             # Public landing page — hero, stats, how-it-works, testimonials, CTAs
    │   ├── NotFound.jsx         # 404 page
    │   ├── Offline.jsx          # Shown by service worker when device is offline
    │   │
    │   ├── auth/
    │   │   ├── Login.jsx        # Split-screen sign-in form
    │   │   └── Register.jsx     # Split-screen sign-up form with role picker + geolocation
    │   │
    │   ├── restaurant/
    │   │   ├── Dashboard.jsx    # KPI cards + recent listings + cancel shortcut
    │   │   ├── PostFood.jsx     # Create listing form (react-hook-form + zod) + live preview sidebar
    │   │   ├── MyListings.jsx   # Tabbed table (desktop) / card list (mobile) with search + pagination
    │   │   ├── ListingDetail.jsx  # Live lifecycle timeline + NGO contact + real-time Supabase updates
    │   │   ├── Profile.jsx      # Edit restaurant name, phone, address, coordinates
    │   │   └── Ratings.jsx      # Aggregate score + breakdown bars + review list with filters
    │   │
    │   ├── ngo/
    │   │   ├── Dashboard.jsx    # KPI cards + MapPanel + live scrollable feed + nearby food grid
    │   │   ├── Browse.jsx       # Full food browser with food-type / radius / min-qty / sort filters
    │   │   ├── Accepted.jsx     # In-progress and completed pickups — Confirm Pickup + Release + Rate
    │   │   └── Profile.jsx      # Edit NGO name, phone, address, coordinates, service radius
    │   │
    │   └── admin/
    │       ├── Dashboard.jsx    # Moderation queue — approve / reject pending NGO accounts
    │       └── Analytics.jsx    # Platform KPIs + daily meals chart + food-type donut chart
    │
    └── utils/
        ├── constants.js         # LAHORE coords, DEFAULT_RADIUS_KM, FOOD_TYPES, STATUS_STYLES
        ├── distance.js          # haversineDistance(lat1,lng1,lat2,lng2) + formatDistance + inPakistan
        └── formatTime.js        # expiryLabel, relativeTime, formatDateTime, toDateTimeLocalValue
```

---

## 🗺️ Route Map

| Path | Component | Guard |
|---|---|---|
| `/` | `Home` | Public |
| `/login` | `Login` | PublicOnly (redirects logged-in users) |
| `/register` | `Register` | PublicOnly |
| `/offline` | `Offline` | Public |
| `/restaurant` | `RestaurantDashboard` | ProtectedRoute — restaurant |
| `/restaurant/post` | `PostFood` | ProtectedRoute — restaurant |
| `/restaurant/listings` | `MyListings` | ProtectedRoute — restaurant |
| `/restaurant/listings/:id` | `ListingDetail` | ProtectedRoute — restaurant |
| `/restaurant/ratings` | `Ratings` | ProtectedRoute — restaurant |
| `/restaurant/profile` | `RestaurantProfile` | ProtectedRoute — restaurant |
| `/ngo` | `NGODashboard` | ProtectedRoute — ngo |
| `/ngo/browse` | `Browse` | ProtectedRoute — ngo |
| `/ngo/accepted` | `Accepted` | ProtectedRoute — ngo |
| `/ngo/profile` | `NGOProfile` | ProtectedRoute — ngo |
| `/admin` | `AdminDashboard` | ProtectedRoute — admin |
| `/admin/analytics` | `AdminAnalytics` | ProtectedRoute — admin |
| `*` | `NotFound` | Public |

**`ProtectedRoute` logic:** loading → full-screen spinner · unauthenticated → `/login` (preserves `from` state) · wrong role → role's own home (`/restaurant`, `/ngo`, or `/admin`).

---

## 🎨 Design System

All design tokens live in `tailwind.config.js` and `src/index.css`.

### Component classes (defined in `index.css` `@layer components`)

| Class | Usage |
|---|---|
| `.card` | `bg-white rounded-xl shadow-card border border-gray-100` |
| `.btn-primary` | Green filled button |
| `.btn-secondary` | White outlined button |
| `.btn-ghost` | Transparent hover button |
| `.btn-danger` | Red filled button |
| `.input` | Full-width text input with focus ring + iOS-zoom prevention (`font-size ≥ 16px`) |
| `.label` | `text-xs font-semibold text-gray-700 mb-1 block` |

### Status badge colours

| Status | Background | Text |
|---|---|---|
| `available` | `bg-green-100` | `text-green-700` |
| `accepted` | `bg-yellow-100` | `text-yellow-700` |
| `collected` | `bg-gray-100` | `text-gray-600` |
| `expired` | `bg-red-100` | `text-red-500` |

### Brand palette (`brand-*`)

```js
brand: {
  50:  '#ecfdf5',   // lightest tint
  100: '#d1fae5',
  200: '#a7f3d0',
  500: '#22c55e',
  600: '#16a34a',   // primary action colour
  700: '#15803d',
  800: '#166534',
}
```

---

## 🔄 Real-time Architecture

```
useFoodListings({ scope: 'available' | 'mine' })
  │
  ├── Initial fetch via foodService.listAvailable() or getMine()
  └── Supabase channel subscription
        ├── INSERT  → prepend to listings (available-scope filter applied)
        ├── UPDATE  → patch in place; if status changed on 'mine', refetch for joined fields
        └── DELETE  → remove from list
        cleanup: removeChannel() in useEffect return
```

- NGO Dashboard and Browse share the `food_listings_available` channel
- Restaurant Dashboard and MyListings each subscribe on `food_listings_mine`
- ListingDetail subscribes to `food_listing_<id>` for per-row live updates

---

## 🪝 Hook Reference

| Hook | Returns | Description |
|---|---|---|
| `useAuth()` | `{ user, session, profile, role, loading, signIn, signUp, signOut, refreshProfile }` | Auth state from `AuthContext` |
| `useFoodListings(opts)` | `{ listings, loading, error, refresh }` | REST + Realtime food feed |
| `useLocation(opts)` | `{ location, ready, status, accuracy, request }` | Browser geolocation |
| `usePushNotifications()` | `{ supported, permission, subscribed, busy, subscribe, unsubscribe }` | Web Push flow |

---

## 📦 Key Dependencies

| Package | Version | Purpose |
|---|---|---|
| `react` + `react-dom` | 18.3 | UI framework |
| `react-router-dom` | 6.26 | Client-side routing |
| `@supabase/supabase-js` | 2.45 | Auth + DB + Realtime client |
| `axios` | 1.7 | HTTP requests with interceptors |
| `react-hook-form` | 7.77 | Performant form state management |
| `zod` + `@hookform/resolvers` | 4.4 / 5.4 | Schema validation |
| `react-hot-toast` | 2.4 | Toast notifications |
| `lucide-react` | 0.439 | Icon library |
| `leaflet` + `react-leaflet` | 1.9 / 4.2 | Alternative map library (available) |
| `date-fns` | 3.6 | Date formatting utilities |
| `tailwindcss` | 3.4 | Utility-first CSS |
| `vite` | 5.4 | Build tool and dev server |

---

## ✅ Code Conventions

- **Components**: functional + hooks only. Named exports. PropTypes on every public prop.
- **State**: `useState` locally first; lift to Context only when ≥ 2 distant components share the same state.
- **Loading/error**: every async call renders a spinner and a user-friendly error message — never blank.
- **Cleanup**: every `useEffect` that opens a subscription or interval returns a cleanup function.
- **No defaultProps**: deprecated in React 18.3+. Use default parameter values in function signatures.
- **Env vars**: `VITE_` prefix, accessed via `import.meta.env.VITE_*`.
- **Forms**: react-hook-form + zod for all multi-field forms (`PostFood`, `Login`, `Register`).
- **API calls**: all calls go through `services/api.js` Axios instance which auto-attaches the JWT.
- **Tailwind**: mobile-first. Avoid arbitrary values except for fixed-width columns in complex grids.
