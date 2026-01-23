self.addEventListener('install', (event) => {
  console.log('Service Worker installed');
});

self.addEventListener('fetch', (event) => {
  // This allows the app to stay online while satisfying the PWA requirement
  event.respondWith(fetch(event.request));
});