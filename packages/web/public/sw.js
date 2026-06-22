const CACHE_NAME = 'nmthub-v1';
const urlsToCache = ['/', '/index.html'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache)));
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
      return response || fetch(e.request).then((res) => {
        if (!res || res.status !== 200 || res.type === 'error') return res;
        const responseToCache = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(e.request, responseToCache));
        return res;
      }).catch(() => caches.match('/index.html'));
    })
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((names) => Promise.all(names.map((name) => name !== CACHE_NAME && caches.delete(name)))));
});
