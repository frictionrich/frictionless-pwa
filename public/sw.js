// Service Worker for PWA
const CACHE_NAME = 'frictionless-v1';
const urlsToCache = [
  '/',
  '/logo.png',
  '/favicon.png',
];

// Install event
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

// Fetch event - exclude API calls from caching
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Don't cache API calls to Supabase or any external APIs
  if (url.hostname.includes('supabase.co') ||
      url.pathname.includes('/api/') ||
      event.request.method !== 'GET') {
    return; // Let the browser handle it normally
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request).then((response) => {
          // Only cache successful GET requests for same-origin
          if (event.request.method === 'GET' &&
              response.status === 200 &&
              url.origin === location.origin) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return response;
        });
      })
      .catch(() => {
        // Return offline page or fallback
        return new Response('Offline', { status: 503 });
      })
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
          })
        );
      })
    ])
  );
});
