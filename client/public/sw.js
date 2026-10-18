// Service worker: makes the site installable as an app and caches the app shell for faster loads.
// API calls (resumes, login, AI) always go to the network so data is never stale.
const CACHE = 'resume-builder-v1'
const SHELL = ['/', '/manifest.webmanifest', '/icons/icon-192.png', '/icons/icon-512.png', '/logo.svg']

self.addEventListener('install', (event) => {
    event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(SHELL)))
    self.skipWaiting()
})

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key))))
    )
    self.clients.claim()
})

self.addEventListener('fetch', (event) => {
    const { request } = event
    const url = new URL(request.url)
    if (request.method !== 'GET' || url.origin !== self.location.origin || url.pathname.startsWith('/api')) return

    // Pages: network first (always get the latest version), fall back to the cached app when offline
    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request)
                .then(response => {
                    const copy = response.clone()
                    caches.open(CACHE).then(cache => cache.put('/', copy))
                    return response
                })
                .catch(() => caches.match('/'))
        )
        return
    }

    // Built JS/CSS files have unique names per deploy, so they can be served from cache
    if (url.pathname.startsWith('/assets/') || url.pathname.startsWith('/icons/')) {
        event.respondWith(
            caches.match(request).then(cached => cached || fetch(request).then(response => {
                const copy = response.clone()
                caches.open(CACHE).then(cache => cache.put(request, copy))
                return response
            }))
        )
    }
})
