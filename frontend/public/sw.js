self.addEventListener("install", (e) => {
  console.log("[Service Worker] Install");
});

self.addEventListener("fetch", (e) => {
  // Pass-through fetch (no offline cache implementation for MVP)
  e.respondWith(fetch(e.request));
});
