// DentalFlow Service Worker
// Version 1.0.0

const CACHE_NAME = 'dentalflow-v1';
const OFFLINE_PAGE = '/offline';

const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/appointments',
  '/patients',
  '/offline',
  '/manifest.json',
  // Add CSS and JS files here after build
];

const CACHE_STRATEGIES = {
  images: 'cache-first',
  api: 'network-first',
  static: 'cache-first',
  pages: 'network-first'
};

// Install event - cache resources
self.addEventListener('install', (event) => {
  console.log('[SW] Install event');

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        // Force the waiting service worker to become the active service worker
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Cache failed:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activate event');

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        // Claim all clients to start controlling them immediately
        return self.clients.claim();
      })
  );
});

// Fetch event - handle requests
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension requests
  if (url.protocol === 'chrome-extension:') {
    return;
  }

  event.respondWith(handleRequest(request));
});

async function handleRequest(request) {
  const url = new URL(request.url);

  try {
    // API requests - network first with cache fallback
    if (url.pathname.startsWith('/api/')) {
      return await networkFirst(request);
    }

    // Images - cache first with network fallback
    if (request.destination === 'image') {
      return await cacheFirst(request);
    }

    // Static assets (CSS, JS) - cache first
    if (request.destination === 'style' || request.destination === 'script') {
      return await cacheFirst(request);
    }

    // Pages - network first with cache fallback
    if (request.destination === 'document') {
      return await networkFirstWithOffline(request);
    }

    // Default strategy
    return await networkFirst(request);

  } catch (error) {
    console.error('[SW] Request failed:', error);

    // Return offline page for navigation requests
    if (request.destination === 'document') {
      return await caches.match(OFFLINE_PAGE);
    }

    // Return error response for other requests
    return new Response('Network error', { status: 408 });
  }
}

// Cache first strategy
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);

  if (cachedResponse) {
    // Update cache in background
    updateCache(request);
    return cachedResponse;
  }

  const networkResponse = await fetch(request);

  if (networkResponse.ok) {
    await updateCache(request, networkResponse.clone());
  }

  return networkResponse;
}

// Network first strategy
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      await updateCache(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, checking cache:', request.url);
    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    throw error;
  }
}

// Network first with offline page fallback
async function networkFirstWithOffline(request) {
  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      await updateCache(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, checking cache:', request.url);

    // Try cache first
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Return offline page
    const offlinePage = await caches.match(OFFLINE_PAGE);
    if (offlinePage) {
      return offlinePage;
    }

    // Fallback HTML
    return new Response(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Offline - DentalFlow</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, sans-serif;
              text-align: center;
              padding: 50px;
              background: #f3f4f6;
            }
            .offline-container {
              max-width: 400px;
              margin: 0 auto;
              background: white;
              padding: 40px;
              border-radius: 12px;
              box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            }
            .offline-icon {
              font-size: 48px;
              margin-bottom: 20px;
            }
            h1 { color: #374151; margin-bottom: 16px; }
            p { color: #6b7280; line-height: 1.5; }
            .retry-btn {
              background: #2563eb;
              color: white;
              border: none;
              padding: 12px 24px;
              border-radius: 8px;
              margin-top: 24px;
              cursor: pointer;
            }
          </style>
        </head>
        <body>
          <div class="offline-container">
            <div class="offline-icon">📱</div>
            <h1>You're Offline</h1>
            <p>DentalFlow isn't available right now. Check your connection and try again.</p>
            <button class="retry-btn" onclick="window.location.reload()">Retry</button>
          </div>
        </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' }
    });
  }
}

// Update cache helper
async function updateCache(request, response = null) {
  const cache = await caches.open(CACHE_NAME);

  if (response) {
    await cache.put(request, response);
  } else {
    try {
      const networkResponse = await fetch(request);
      if (networkResponse.ok) {
        await cache.put(request, networkResponse.clone());
      }
    } catch (error) {
      // Silently fail background updates
    }
  }
}

// Background sync for appointment updates
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-appointments') {
    event.waitUntil(syncAppointments());
  }
});

async function syncAppointments() {
  try {
    // Implement appointment sync logic here
    console.log('[SW] Syncing appointments...');

    // Get offline actions from IndexedDB
    // Send to server when online
    // Update local cache

  } catch (error) {
    console.error('[SW] Sync failed:', error);
  }
}

// Push notifications for appointment reminders
self.addEventListener('push', (event) => {
  if (!event.data) {
    return;
  }

  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    tag: data.tag || 'default',
    data: data.data || {},
    actions: [
      {
        action: 'view',
        title: 'View Details',
        icon: '/icons/view-icon.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/icons/close-icon.png'
      }
    ],
    requireInteraction: data.requireInteraction || false,
    silent: false,
    vibrate: [200, 100, 200]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const { action, data } = event.notification;

  if (action === 'dismiss') {
    return;
  }

  // Default action or 'view' action
  const urlToOpen = data?.url || '/dashboard';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if there's already a window/tab open with the target URL
        for (let client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }

        // Open new window/tab
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Periodic background sync for data updates
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'update-appointments') {
    event.waitUntil(updateAppointments());
  }
});

async function updateAppointments() {
  try {
    console.log('[SW] Background updating appointments...');
    // Implement periodic sync logic
  } catch (error) {
    console.error('[SW] Background sync failed:', error);
  }
}

// Message handling from main thread
self.addEventListener('message', (event) => {
  const { type, payload } = event.data;

  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;

    case 'GET_CACHE_SIZE':
      getCacheSize()
        .then(size => {
          event.ports[0].postMessage({ size });
        });
      break;

    case 'CLEAR_CACHE':
      clearCache()
        .then(() => {
          event.ports[0].postMessage({ success: true });
        });
      break;

    default:
      break;
  }
});

async function getCacheSize() {
  const cache = await caches.open(CACHE_NAME);
  const keys = await cache.keys();

  let totalSize = 0;
  for (const key of keys) {
    const response = await cache.match(key);
    if (response) {
      const blob = await response.blob();
      totalSize += blob.size;
    }
  }

  return totalSize;
}

async function clearCache() {
  const cacheNames = await caches.keys();
  await Promise.all(
    cacheNames.map(cacheName => caches.delete(cacheName))
  );
}

console.log('[SW] Service Worker loaded - DentalFlow v1.0.0');