const CACHE_NAME = 'shosha-mart-cache-v3';
const urlsToCache = [
    '/favicon_io/android-chrome-192x192.png',
    '/favicon_io/android-chrome-512x512.png',
];

self.addEventListener('install', event => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return Promise.allSettled(
                urlsToCache.map(url => cache.add(url).catch(err => console.error('Cache add error:', err)))
            );
        })
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', event => {
    // Lewati jika bukan GET atau dari extension
    if (event.request.method !== 'GET' || event.request.url.startsWith('chrome-extension://')) {
        return;
    }

    // Perbaikan bug Chrome: https://bugs.chromium.org/p/chromium/issues/detail?id=973902
    if (event.request.cache === 'only-if-cached' && event.request.mode !== 'same-origin') {
        return;
    }

    event.respondWith(
        fetch(event.request).catch(async () => {
            // Jika network gagal, cek cache
            const cachedResponse = await caches.match(event.request);
            if (cachedResponse) {
                return cachedResponse;
            }

            // Jika benar-benar tidak ada internet dan yang diminta adalah halaman (bukan asset)
            if (event.request.mode === 'navigate') {
                return new Response(
                    '<html><head><meta charset="utf-8"><title>Offline - Shosha Mart</title></head><body style="text-align:center;padding:50px;font-family:sans-serif;"><h2>Koneksi Terputus</h2><p>Pastikan Anda memiliki internet dan coba muat ulang.</p><button onclick="window.location.reload()">Muat Ulang</button></body></html>',
                    { status: 200, headers: { 'Content-Type': 'text/html' } }
                );
            }
            
            return new Response('', { status: 408, statusText: 'Request Timeout' });
        })
    );
});
