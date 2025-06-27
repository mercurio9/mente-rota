const CACHE_NAME='mente-rota-v1';
const ASSETS=[
  '/',
  '/index.html',
  '/styles.css',
  '/script.js',
  '/manual-mente-rota.pdf'
];

self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(ASSETS)));
});

self.addEventListener('fetch',e=>{
  e.respondWith(caches.match(e.request).then(res=>res||fetch(e.request)));
});
