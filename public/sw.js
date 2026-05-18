// Doxxy Service Worker
const CACHE_NAME = 'doxxy-v1'
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png',
]

// Install: cache the app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS)
    })
  )
  self.skipWaiting()
})

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    })
  )
  self.clients.claim()
})

// Fetch: network-first with cache fallback
self.addEventListener('fetch', (event) => {
  // Skip non-GET and non-http(s) requests
  if (
    event.request.method !== 'GET' ||
    !event.request.url.startsWith('http')
  ) {
    return
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache successful responses for static assets
        if (
          response.status === 200 &&
          response.type === 'basic'
        ) {
          const cacheClone = response.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, cacheClone)
          })
        }
        return response
      })
      .catch(() => {
        // Offline: try cache
        return caches.match(event.request).then((cached) => {
          if (cached) return cached
          // For navigation requests, serve the cached root page
          if (event.request.mode === 'navigate') {
            return caches.match('/')
          }
          return new Response('Offline', { status: 503 })
        })
      })
  )
})
