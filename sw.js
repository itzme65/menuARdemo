/* DineAR — Service Worker: cache GLB/USDZ assets for fast repeat loads */
const CACHE_NAME = 'dinear-models-v1';
const MODEL_EXTENSIONS = ['.glb', '.gltf', '.usdz'];

self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

function isModelRequest(url) {
  const path = new URL(url).pathname.toLowerCase();
  return MODEL_EXTENSIONS.some((ext) => path.endsWith(ext));
}

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET' || !isModelRequest(e.request.url)) return;

  e.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cached = await cache.match(e.request);
      if (cached) return cached;

      const response = await fetch(e.request);
      if (response.ok) {
        cache.put(e.request, response.clone());
      }
      return response;
    })
  );
});
