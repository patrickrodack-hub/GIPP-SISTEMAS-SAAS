const CACHE_NAME = 'gipp-cache-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        // addAll will ignore failures so the SW installs even if some resources fail to cache
        return Promise.allSettled(urlsToCache.map(url => cache.add(url)));
      })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // Ignorar Firebase Firestore, genai e outras APIs para não atrapalhar
  if (url.hostname.includes('firestore.googleapis.com') ||
      url.hostname.includes('firebase') ||
      url.hostname.includes('google') ||
      event.request.method !== 'GET') {
      return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          // You can also update the cache in the background (stale-while-revalidate)
          // mas para um PWA offline de base isso é o suficiente.
          return response;
        }
        
        return fetch(event.request).then(
          response => {
            // Verifica se a resposta é válida
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            var responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        ).catch(() => {
          // Fallback final quando estiver de todo sem rede
          // Se for pedida navegação, retornar o index.html principal
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html');
          }
        });
      })
  );
});

// --- PUSH NOTIFICATION LISTENERS ---
self.addEventListener('push', event => {
  let data = { title: 'Alerta GIPP', body: 'Mensagem urgente da secretaria' };
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: 'Alerta GIPP', body: event.data.text() };
    }
  }

  const options = {
    body: data.body,
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    vibrate: [150, 80, 150],
    data: {
      url: data.url || '/'
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(windowClients => {
        // Se hover uma aba aberta, foca nela
        for (let i = 0; i < windowClients.length; i++) {
          const client = windowClients[i];
          if (client.url.includes(urlToOpen) && 'focus' in client) {
            return client.focus();
          }
        }
        // Caso contrário, abre uma nova
        if (self.clients.openWindow) {
          return self.clients.openWindow(urlToOpen);
        }
      })
  );
});

