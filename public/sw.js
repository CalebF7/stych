/// <reference lib="webworker" />

const CACHE_NAME = 'stych-pwa-v4';
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/pwa-icon.jpg',
  '/assets/stych-pwa-logo.jpg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(CORE_ASSETS).catch((err) => {
        console.warn('PWA core asset precache error:', err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = event.request.url;

  // 1. Only handle GET requests and http/https schemes
  if (event.request.method !== 'GET' || !url.startsWith('http')) {
    return;
  }

  // 2. Bypass Supabase APIs, auth endpoints, and Vite dev server internals
  if (
    url.includes('supabase.co') ||
      url.includes('/@vite') ||
      url.includes('/@fs') ||
      url.includes('node_modules') ||
      url.includes('hot-update')
  ) {
  return;
}

// 3. Navigation requests (App Shell / Page Loads):
// Return cached index.html immediately so the PWA opens instantly (sub-20ms),
// while checking the network in the background.
if (event.request.mode === 'navigate') {
  event.respondWith(
    caches.match('/index.html').then((cached) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put('/index.html', copy);
            });
          }
          return networkResponse;
        })
        .catch(() => cached);

      return cached || fetchPromise;
    })
  );
  return;
}

// 4. Static assets (scripts, styles, images): Cache-first with network fallback
event.respondWith(
  caches.match(event.request).then((cachedResponse) => {
    if (cachedResponse) {
      // Return from cache immediately; revalidate in background if same-origin
      if (url.startsWith(self.location.origin)) {
        fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const copy = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, copy);
              });
            }
          })
          .catch(() => { });
      }
      return cachedResponse;
    }

    // Not in cache: fetch from network and store copy in cache
    return fetch(event.request)
      .then((networkResponse) => {
        if (
          networkResponse &&
          networkResponse.status === 200 &&
            (networkResponse.type === 'basic' || networkResponse.type === 'cors')
        ) {
          const copy = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, copy);
          });
        }
        return networkResponse;
      });
  })
);
});
