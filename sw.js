self.addEventListener("install", (e) => {
  console.log("[SW] Instalado");
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  console.log("[SW] Activado");
});

self.addEventListener("fetch", (e) => {
  console.log("[SW] Interceptando:", e.request.url);
});
