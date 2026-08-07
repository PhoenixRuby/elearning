const CACHE_NAME = 'elearning-v1'; // 資料需要更新時，改這個名稱
const FILES = [
  './index.htm',
  './manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(FILES))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(res => {
      if (res) return res;
      
      // 沒有快取，去網路拿，拿到後存起來
      return fetch(event.request).then(response => {
        if (!response || response.status !== 200) return response;
        
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseClone);
        });
        
        return response;
      });
    })
  );
});