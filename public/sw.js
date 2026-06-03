// Zero-Waste Food Connect — Service Worker
// Handles: (1) offline cache for the app shell (PROD only),
//          (2) push notifications (always),
//          (3) notification clicks.

const CACHE_NAME = 'zwfc-v3';
const APP_SHELL = ['/', '/index.html', '/manifest.json', '/favicon.svg', '/icon-192.svg', '/icon-512.svg'];

// Detect Vite dev server. In dev we must NOT intercept fetches — Vite's HMR
// stream, on-demand module compilation and short-lived chunk URLs all break
// when cached by a service worker. We still want the SW registered so push
// notifications can be tested locally, but the fetch handler stays inert.
const IS_DEV =
  self.location.hostname === 'localhost' ||
  self.location.hostname === '127.0.0.1' ||
  self.location.port === '5173';

// ─── Install ─────────────────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  if (!IS_DEV) {
    event.waitUntil(
      caches.open(CACHE_NAME).then((c) => c.addAll(APP_SHELL)).catch(() => {})
    );
  }
  self.skipWaiting();
});

// ─── Activate ────────────────────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// ─── Fetch (PROD only) ───────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  // In dev, do nothing — let the browser talk to Vite directly.
  if (IS_DEV) return;

  const req = event.request;
  if (req.method !== 'GET') return;

  // Skip extensions, websockets, cross-origin APIs
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/api/')) return; // never cache API calls
  if (url.pathname.startsWith('/@')) return;    // vite internal paths
  if (url.search.includes('import') || url.search.includes('hmr')) return;

  // Network-first for HTML navigations, fall back to cached shell
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          // Cache a copy for offline fallback
          const copy = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(req, copy)).catch(() => {});
          return res;
        })
        .catch(() =>
          caches.match(req).then((r) => r || caches.match('/index.html'))
        )
    );
    return;
  }

  // Stale-while-revalidate for everything else
  event.respondWith(
    caches.match(req).then(
      (cached) =>
        cached ||
        fetch(req)
          .then((res) => {
            const copy = res.clone();
            caches.open(CACHE_NAME).then((c) => c.put(req, copy)).catch(() => {});
            return res;
          })
          .catch(() => cached) // give up gracefully if both cache and network fail
    )
  );
});

// ─── Push (works in dev + prod) ──────────────────────────────────────────────
self.addEventListener('push', (event) => {
  let data = { title: '🍽️ Zero-Waste Food Connect', body: 'New food nearby!' };
  try {
    data = event.data?.json() || data;
  } catch (e) {
    /* keep default */
  }
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icon-192.svg',
      badge: '/badge-72.svg',
      data: { url: data.url || '/ngo/browse', food_id: data.food_id },
      vibrate: [80, 40, 80],
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/';
  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((wins) => {
        for (const w of wins) {
          if (w.url.includes(targetUrl) && 'focus' in w) return w.focus();
        }
        return self.clients.openWindow(targetUrl);
      })
  );
});
