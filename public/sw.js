// NetMap VN — Service Worker
// Strategy:
// - Static assets (/_next/static/*): cache-first
// - HTML pages: network-first, fallback to cache then offline page
// - API requests (/api/*): network-only (always fresh, never cache)
// - Map tiles: stale-while-revalidate

const VERSION = 'v1';
const CACHE_STATIC = `netmap-static-${VERSION}`;
const CACHE_PAGES  = `netmap-pages-${VERSION}`;
const CACHE_TILES  = `netmap-tiles-${VERSION}`;

const PRECACHE = ['/', '/offline'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_PAGES).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => ![CACHE_STATIC, CACHE_PAGES, CACHE_TILES].includes(k)).map((k) => caches.delete(k)),
      ),
    ).then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // Never cache API
  if (url.pathname.startsWith('/api/')) return;
  // Don't cache chrome extensions, etc.
  if (!url.protocol.startsWith('http')) return;

  // Map tiles (MapLibre demotiles or maptiler)
  if (url.hostname.includes('demotiles.maplibre.org') || url.hostname.includes('maptiler')) {
    event.respondWith(staleWhileRevalidate(req, CACHE_TILES));
    return;
  }

  // Next static assets
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(cacheFirst(req, CACHE_STATIC));
    return;
  }

  // HTML pages: network-first
  if (req.destination === 'document') {
    event.respondWith(networkFirst(req, CACHE_PAGES));
    return;
  }
});

async function cacheFirst(req, cacheName) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(req);
  if (hit) return hit;
  try {
    const res = await fetch(req);
    if (res.ok) cache.put(req, res.clone());
    return res;
  } catch {
    return Response.error();
  }
}

async function networkFirst(req, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const res = await fetch(req);
    if (res.ok) cache.put(req, res.clone());
    return res;
  } catch {
    const hit = await cache.match(req);
    if (hit) return hit;
    return cache.match('/offline') || Response.error();
  }
}

async function staleWhileRevalidate(req, cacheName) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(req);
  const fetched = fetch(req).then((res) => {
    if (res.ok) cache.put(req, res.clone());
    return res;
  }).catch(() => null);
  return hit || fetched || Response.error();
}

// ============= PUSH NOTIFICATIONS =============

self.addEventListener('push', (event) => {
  let data = { title: 'NetMap VN', body: 'Có sự cố mạng gần bạn', url: '/outages' };
  if (event.data) {
    try { data = { ...data, ...event.data.json() }; }
    catch { data.body = event.data.text(); }
  }
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icon',
      badge: '/icon',
      tag: data.tag || 'netmap-vn',
      data: { url: data.url || '/' },
      vibrate: [200, 100, 200],
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((all) => {
      // Focus existing window if open, else open new
      for (const c of all) {
        if (c.url.includes(url) && 'focus' in c) return c.focus();
      }
      return clients.openWindow(url);
    }),
  );
});
