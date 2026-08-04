// Service Worker de Nails Studio — archivo real y separado (no embebido),
// necesario para que empaquetadores como PWABuilder puedan detectarlo e
// incluirlo correctamente al generar el paquete para Android/APK.

const CACHE_NAME = 'nails-studio-v1';
const APP_SHELL = ['./', './index.html'];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  // App de una sola página: intenta la red primero; si no hay conexión,
  // sirve desde el caché guardado en la instalación (funcionamiento
  // 100% offline, como exige la especificación original).
  e.respondWith(
    fetch(e.request)
      .then((response) => {
        // Actualiza el caché con la respuesta más reciente cuando hay red.
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(e.request, copy));
        return response;
      })
      .catch(() => caches.match(e.request).then((cached) => cached || caches.match('./index.html')))
  );
});

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  e.waitUntil(self.clients.openWindow('./'));
});
