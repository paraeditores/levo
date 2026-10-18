/* Levo · service worker: avisos push y funcionamiento sin conexión (red primero, caché si no hay red) */
const CACHE = "levo-v12";
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", e => e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener("fetch", e => {
  const r = e.request; if (r.method !== "GET") return;
  const u = new URL(r.url);
  if (u.hostname.endsWith("supabase.co")) return;
  if (u.origin !== location.origin && !u.hostname.includes("jsdelivr")) return;
  e.respondWith(fetch(r, u.origin === location.origin ? { cache: "no-cache" } : {}).then(res => { if (res.ok || res.type === "opaque") { const cp = res.clone(); caches.open(CACHE).then(c => c.put(r, cp)) } return res })
    .catch(() => caches.match(r, { ignoreSearch: true }).then(m => m || caches.match("./", { ignoreSearch: true }))));
});
self.addEventListener("push", e => {
  let d = {}; try { d = e.data.json() } catch (_) { d = { title: "Levo", body: e.data ? e.data.text() : "" } }
  e.waitUntil(self.registration.showNotification(d.title || "Levo", { body: d.body || "", icon: "icon-192.png?v=bn", badge: "icon-192.png?v=bn", tag: d.tag || "levo", data: { url: "./" } }));
});
self.addEventListener("notificationclick", e => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: "window" }).then(cs => { for (const c of cs) { if ("focus" in c) return c.focus() } return self.clients.openWindow("./") }));
});
