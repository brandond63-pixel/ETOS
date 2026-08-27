/* ETOS v0.5.87 development build: intentionally clears old offline caches. */
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',event=>event.waitUntil((async()=>{for(const key of await caches.keys())await caches.delete(key);await self.clients.claim();})()));
self.addEventListener('fetch',()=>{});
