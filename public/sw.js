const CACHE_NAME = "ggsc-v2";
const SHELL_CACHE = "ggsc-shell-v2";

const PRECACHE_URLS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/img/main.png",
];

/* ── Install: pre-cache app shell ── */
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

/* ── Activate: purge old caches ── */
self.addEventListener("activate", (event) => {
  const KEEP = [SHELL_CACHE, CACHE_NAME];
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => !KEEP.includes(k)).map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

/* ── Helpers ── */
function isSameOrigin(url) {
  return url.startsWith(self.location.origin);
}

function isStaticAsset(url) {
  return /\.(css|js|woff2?|ttf|eot|png|jpe?g|gif|svg|webp|avif|ico|mp4|mp3|webm)(\?|$)/i.test(url);
}

function isNavigation(request) {
  return request.mode === "navigate";
}

/* ── Fetch strategy ── */
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const { request } = event;
  const url = new URL(request.url);

  /* ── 1. Cross-origin (fonts, CDN): cache-first, never network-fail ── */
  if (!isSameOrigin(url.href)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request)
          .then((response) => {
            if (response.ok) {
              const clone = response.clone();
              caches.open(CACHE_NAME).then((c) => c.put(request, clone));
            }
            return response;
          })
          .catch(() => new Response("", { status: 408 }));
      })
    );
    return;
  }

  /* ── 2. Static assets (hashed CSS/JS/images/fonts): cache-first ── */
  if (isStaticAsset(url.href)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((c) => c.put(request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  /* ── 3. Navigation: network-first, fallback to cached index.html ── */
  if (isNavigation(request)) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(SHELL_CACHE).then((c) => c.put(request, clone));
          }
          return response;
        })
        .catch(() => caches.match("/index.html"))
    );
    return;
  }

  /* ── 4. Everything else: network-first with cache fallback ── */
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((c) => c.put(request, clone));
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
});
