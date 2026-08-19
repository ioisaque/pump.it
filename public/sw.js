const OFFLINE_CACHE = "pump-offline-v14";
const OFFLINE_URLS = ["/offline.html", "/error/503.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(OFFLINE_CACHE)
      .then((cache) => cache.addAll(OFFLINE_URLS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== OFFLINE_CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    fetch(event.request).catch(async () => {
      if (event.request.mode === "navigate") {
        const cached = await caches.match("/offline.html");
        if (cached) return cached;
      }
      const asset = await caches.match(event.request);
      if (asset) return asset;
      return new Response("", { status: 504, statusText: "Network Error" });
    }),
  );
});
