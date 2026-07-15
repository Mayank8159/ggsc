const CACHE_NAME = "ggsc-v1";
const PRECACHE_URLS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/img/main.png",
];

/* ── Install: pre-cache shell ── */
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

/* ── Activate: clean old caches ── */
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

/* ── Fetch: network-first with cache fallback ── */
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  /* Skip cross-origin requests (fonts, APIs, etc.) */
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        /* Clone and cache successful responses */
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => {
        /* Network failed — serve from cache */
        return caches.match(event.request).then((cached) => {
          if (cached) return cached;
          /* Last resort: offline fallback for navigation */
          if (event.request.mode === "navigate") {
            return caches.match("/index.html");
          }
          return new Response("Offline", { status: 503, statusText: "Offline" });
        });
      })
  );
});
