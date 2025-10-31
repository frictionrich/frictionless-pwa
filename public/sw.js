// Service Worker for PWA
const CACHE_NAME = 'frictionless-v3';
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

  // Skip service worker for:
  // 1. External domains (like Supabase)
  // 2. API routes
  // 3. Non-GET requests (POST, PUT, DELETE, etc.)
  const isExternalRequest = url.origin !== location.origin;
  const isApiRoute = url.pathname.startsWith('/api/');
  const isNonGetRequest = event.request.method !== 'GET';

  if (isExternalRequest || isApiRoute || isNonGetRequest) {
    // Let the browser handle this request without service worker intervention
    return;
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
