const VERSION = 'v202610280952';
const CACHE_PREFIX = 'elearning-';
const CACHE_NAME = CACHE_PREFIX + VERSION;

const FILES = [
  './index.htm',
  './manifest.json'
];

self.addEventListener('install', event => {
  console.log('[SW] install:', VERSION);

  // 新 SW 安裝完成後，不等待舊 SW 結束
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(FILES))
  );
});

self.addEventListener('activate', event => {
  console.log('[SW] activate:', VERSION);

  event.waitUntil(
    caches.keys()
      .then(keys =>
        Promise.all(
          keys
            .filter(key =>
              key.startsWith(CACHE_PREFIX) &&
              key !== CACHE_NAME
            )
            .map(key => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (!event.request.url.startsWith('http')) return;
  if (event.request.method !== 'GET') return;

  // version.json 永遠走網路
  if (event.request.url.includes('version.json')) {
    event.respondWith(
      fetch(event.request, { cache: 'no-store' })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(res => {
        if (res) {
          return res;
        }

        return fetch(event.request)
          .then(response => {
            if (!response || response.status !== 200) {
              return response;
            }

            const responseClone = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseClone);
              });

            return response;
          });
      })
  );
});