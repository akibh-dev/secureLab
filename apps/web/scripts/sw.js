/* global self, cacheName, paths, caches */
self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(cacheName);
        await cache.addAll(paths);
      } catch (error) {
        await caches.delete(cacheName);
        throw error;
      }
    })(),
  );
});
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      for (const name of await caches.keys()) {
        if (name.startsWith("securelab-") && name !== cacheName)
          await caches.delete(name);
      }
      await self.clients.claim();
    })(),
  );
});
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  const path = url.pathname;
  event.respondWith(
    (async () => {
      const cache = await caches.open(cacheName);
      if (path.startsWith("/_astro/")) {
        return (await cache.match(path)) ?? fetch(event.request);
      }
      try {
        return await fetch(event.request);
      } catch {
        return (
          (await cache.match(path)) ??
          (await cache.match(path + "/")) ??
          new Response(
            "This page is unavailable offline. Reconnect and try again.",
            { status: 503, headers: { "content-type": "text/plain" } },
          )
        );
      }
    })(),
  );
});
