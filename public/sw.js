self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    fetch(event.request).catch(() => {
      if (event.request.mode === "navigate") {
        return new Response(
          "<!doctype html><meta charset=utf-8><title>Offline</title><p>Sem rede.</p>",
          { status: 503, headers: { "Content-Type": "text/html; charset=utf-8" } },
        );
      }
      return new Response("", { status: 504, statusText: "Network Error" });
    }),
  );
});
