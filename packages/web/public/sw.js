const CACHE_NAME = 'nmthub-v2';
const urlsToCache = ['/', '/index.html', '/nmt-bg-pattern.png', '/nmthub-icon.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache)));
  self.skipWaiting();
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;

  const requestUrl = new URL(e.request.url);
  const isSameOrigin = requestUrl.origin === self.location.origin;

  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put('/index.html', copy));
          return res;
        })
        .catch(() => caches.match('/index.html'))
    );
    return;
  }

  if (!isSameOrigin) return;

  e.respondWith(
    caches.match(e.request).then((response) => {
      if (response) return response;

      return fetch(e.request).then((res) => {
        if (!res || res.status !== 200 || res.type === 'error') return res;
        const responseToCache = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(e.request, responseToCache));
        return res;
      });
    })
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((names) => Promise.all(names.map((name) => name !== CACHE_NAME && caches.delete(name)))));
  self.clients.claim();
});
