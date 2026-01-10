// ============================================================================
// SERVICE WORKER 
// Version: 2.1.0
// ============================================================================

const SW_VERSION = 'v2.1.0';

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

const BROWSER_TYPE = (() => {
  const ua = self.navigator.userAgent;
  if (/Chrome/.test(ua) && !/Edg/.test(ua)) return 'Chrome';
  if (/Edg/.test(ua)) return 'Edge';
  if (/Safari/.test(ua) && !/Chrome/.test(ua)) return 'Safari';
  return 'Other';
})();

const DEFAULT_ICON = '/Simbolo1.png';
const DEFAULT_BADGE = '/Simbolo1.png';

const CLIENT_MATCH_OPTIONS = {
  type: 'window',
  includeUncontrolled: true
};

// Message types
const MESSAGE_TYPES = {
  PUSH_FOREGROUND: 'PUSH_NOTIFICATION_FOREGROUND',
  REVALIDATE_DATA: 'REVALIDATE_DATA',
  SW_ACTIVATED: 'SW_ACTIVATED',
  PING: 'PING',
  PONG: 'PONG',
  SKIP_WAITING: 'SKIP_WAITING',
  TEST_PUSH: 'TEST_PUSH',
  TEST_PUSH_SUCCESS: 'TEST_PUSH_SUCCESS',
  TEST_PUSH_ERROR: 'TEST_PUSH_ERROR'
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Generates a unique tag for notifications
 * @returns {string} Unique notification tag
 */
function generateUniqueTag() {
  return `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Normalizes URL to absolute format
 * @param {string} url - Relative or absolute URL
 * @returns {string} Absolute URL
 */
function normalizeUrl(url) {
  if (!url) return self.location.origin + '/';
  return url.startsWith('http') ? url : self.location.origin + url;
}

/**
 * Gets all window clients
 * @returns {Promise<Array>} Array of window clients
 */
async function getAllClients() {
  return self.clients.matchAll(CLIENT_MATCH_OPTIONS);
}

/**
 * Finds a visible/focused client
 * @param {Array} clients - Array of clients
 * @returns {Object|null} Visible client or null
 */
function findVisibleClient(clients) {
  return clients.find(client => client.visibilityState === 'visible') || null;
}

/**
 * Broadcasts message to all clients (only if clients exist)
 * @param {string} type - Message type
 * @param {Object} data - Message data
 */
async function broadcastToClients(type, data = {}) {
  const clients = await getAllClients();
  
  // Early return se não houver clientes (evita operações desnecessárias)
  if (clients.length === 0) {
    return;
  }
  
  console.log(`[SW] 📨 Broadcasting ${type} to ${clients.length} client(s)`);
  
  // Usa Promise.allSettled para evitar que um erro em um cliente impeça os outros
  await Promise.allSettled(
    clients.map(client => {
      try {
        client.postMessage({ type, data });
      } catch (err) {
        console.warn('[SW] ⚠️ Erro ao enviar mensagem para cliente:', err);
      }
    })
  );
}

/**
 * Builds notification options based on browser capabilities
 * @param {Object} data - Notification data
 * @returns {Object} Notification options
 */
function buildNotificationOptions(data) {
  const baseOptions = {
    body: data.body || data.message || 'Você tem uma nova notificação',
    icon: data.icon || DEFAULT_ICON,
    badge: data.badge || DEFAULT_BADGE,
    tag: data.tag || generateUniqueTag(),
    data: {
      url: data.url || data.link || '/',
      timestamp: Date.now(),
      notificationId: Date.now()
    }
  };

  // Chrome and Edge support additional options
  if (BROWSER_TYPE === 'Chrome' || BROWSER_TYPE === 'Edge') {
    return {
      ...baseOptions,
      requireInteraction: data.requireInteraction ?? true,
      vibrate: data.vibrate || [200, 100, 200],
      renotify: data.renotify ?? true,
      silent: data.silent ?? false,
      timestamp: Date.now(),
      actions: data.actions || []
    };
  }

  // Safari has limited support
  if (BROWSER_TYPE === 'Safari') {
    return {
      ...baseOptions,
      silent: data.silent ?? false
    };
  }

  return baseOptions;
}

/**
 * Shows notification and triggers data revalidation
 * @param {string} title - Notification title
 * @param {Object} options - Notification options
 */
async function showNotificationWithRevalidation(title, options) {
  await self.registration.showNotification(title, options);
  console.log('[SW] ✅ Notificação exibida com sucesso');
  
  // Trigger data revalidation in all clients
  await broadcastToClients(MESSAGE_TYPES.REVALIDATE_DATA, {
    url: options.data.url,
    timestamp: Date.now()
  });
}

/**
 * Handles foreground notification (app is visible)
 * @param {Object} client - Visible client
 * @param {string} title - Notification title
 * @param {Object} options - Notification options
 */
function handleForegroundNotification(client, title, options) {
  console.log('[SW] 👁️ App visível - enviando mensagem ao cliente');
  
  client.postMessage({
    type: MESSAGE_TYPES.PUSH_FOREGROUND,
    data: {
      title,
      body: options.body,
      icon: options.icon,
      image: options.image,
      data: options.data
    }
  });
}

/**
 * Handles background notification (app is not visible)
 * @param {string} title - Notification title
 * @param {Object} options - Notification options
 */
async function handleBackgroundNotification(title, options) {
  console.log('[SW] 💤 App em background - exibindo notificação do sistema');
  await showNotificationWithRevalidation(title, options);
}

/**
 * Finds and focuses existing window with exact URL match
 * @param {Array} clients - Array of clients
 * @param {string} targetUrl - Target URL
 * @returns {Promise<Object|null>} Focused client or null
 */
async function focusExactMatch(clients, targetUrl) {
  for (const client of clients) {
    if (client.url === targetUrl && 'focus' in client) {
      console.log('[SW] 🎯 Focando janela com URL exata');
      return client.focus();
    }
  }
  return null;
}

/**
 * Finds and reuses any app window, navigating to target URL
 * @param {Array} clients - Array of clients
 * @param {string} targetUrl - Target URL
 * @returns {Promise<Object|null>} Navigated client or null
 */
async function reuseAppWindow(clients, targetUrl) {
  for (const client of clients) {
    const isAppWindow = client.url.startsWith(self.location.origin);
    const canFocus = 'focus' in client;
    const canNavigate = 'navigate' in client;
    
    if (isAppWindow && canFocus && canNavigate) {
      console.log('[SW] � Reutilizando janela existente');
      await client.focus();
      return client.navigate(targetUrl);
    }
  }
  return null;
}

/**
 * Opens a new window with the target URL
 * @param {string} targetUrl - Target URL
 * @returns {Promise<Object|null>} New window or null
 */
async function openNewWindow(targetUrl) {
  if (clients.openWindow) {
    console.log('[SW] 🪟 Abrindo nova janela');
    return clients.openWindow(targetUrl);
  }
  return null;
}

// ============================================================================
// EVENT HANDLERS
// ============================================================================

/**
 * Handles push notification events
 */
self.addEventListener('push', async (event) => {
  console.log('[SW] 🔔 PUSH recebido:', new Date().toISOString());

  if (!event.data) {
    console.error('[SW] ❌ Push sem dados');
    return;
  }

  try {
    const data = event.data.json();
    const title = data.title || 'Nova Notificação';
    const options = buildNotificationOptions(data);

    event.waitUntil(
      (async () => {
        try {
          const clients = await getAllClients();
          const visibleClient = findVisibleClient(clients);

          if (visibleClient) {
            handleForegroundNotification(visibleClient, title, options);
          } else {
            await handleBackgroundNotification(title, options);
          }
        } catch (err) {
          console.error('[SW] ❌ Erro ao processar notificação:', err);
          // Fallback: show notification anyway
          return self.registration.showNotification(title, options).catch(fallbackErr => {
            console.error('[SW] ❌ Erro no fallback:', fallbackErr);
          });
        }
      })()
    );
  } catch (error) {
    console.error('[SW] ❌ Erro fatal ao processar push:', error);

    // Generic fallback notification
    event.waitUntil(
      self.registration.showNotification('Nova Notificação', {
        body: 'Você tem uma nova notificação',
        icon: DEFAULT_ICON,
        tag: generateUniqueTag(),
        data: { url: '/' }
      }).catch(err => console.error('[SW] ❌ Erro no fallback:', err))
    );
  }
});

/**
 * Handles notification click events
 */
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = normalizeUrl(event.notification.data?.url);

  event.waitUntil(
    (async () => {
      try {
        const clients = await getAllClients();

        // Strategy 1: Focus exact URL match
        const exactMatch = await focusExactMatch(clients, targetUrl);
        if (exactMatch) return;

        // Strategy 2: Reuse any app window
        const reusedWindow = await reuseAppWindow(clients, targetUrl);
        if (reusedWindow) return;

        // Strategy 3: Open new window
        await openNewWindow(targetUrl);
      } catch (err) {
        console.error('[SW] ❌ Erro ao abrir janela:', err);
        // Fallback: tenta abrir janela mesmo com erro
        try {
          await self.clients.openWindow(targetUrl);
        } catch (fallbackErr) {
          console.error('[SW] ❌ Erro no fallback de abertura:', fallbackErr);
        }
      }
    })()
  );
});

/**
 * Handles notification close events
 */
self.addEventListener('notificationclose', (event) => {
  console.log('[SW] 🚫 Notificação fechada:', event.notification.tag);
});

/**
 * Handles Service Worker installation
 */
self.addEventListener('install', (event) => {
  console.log('[SW] 📦 Instalando', SW_VERSION);
  event.waitUntil(
    self.skipWaiting().then(() => {
      console.log('[SW] ⏭️ Skip waiting executado');
    })
  );
});

/**
 * Handles Service Worker activation
 */
self.addEventListener('activate', (event) => {
  console.log('[SW] ⚡ Ativando', SW_VERSION);
  event.waitUntil(
    self.clients.claim().then(async () => {
      console.log('[SW] 👑 Service Worker assumiu controle');
      
      await broadcastToClients(MESSAGE_TYPES.SW_ACTIVATED, {
        version: SW_VERSION,
        browser: BROWSER_TYPE
      });
    })
  );
});

/**
 * Handles messages from clients
 */
self.addEventListener('message', (event) => {
  console.log('[SW] 📨 Mensagem recebida:', event.data?.type);

  if (!event.data) return;

  const { type, data } = event.data;

  // PING/PONG for communication testing
  if (type === MESSAGE_TYPES.PING) {
    console.log('[SW] 🏓 PING recebido');
    event.source.postMessage({
      type: MESSAGE_TYPES.PONG,
      timestamp: Date.now(),
      swVersion: SW_VERSION,
      browser: BROWSER_TYPE
    });
    return;
  }

  // Skip waiting command
  if (type === MESSAGE_TYPES.SKIP_WAITING) {
    console.log('[SW] ⏭️ Skip waiting via mensagem');
    self.skipWaiting();
    return;
  }

  // Test push simulation
  if (type === MESSAGE_TYPES.TEST_PUSH) {
    console.log('[SW] 🧪 Simulando push:', data);

    const testData = data || {};
    const title = testData.title || 'Teste Push Simulado';
    const options = buildNotificationOptions(testData);

    self.registration.showNotification(title, options)
      .then(() => {
        console.log('[SW] ✅ Notificação de teste exibida');
        event.source.postMessage({
          type: MESSAGE_TYPES.TEST_PUSH_SUCCESS,
          message: 'Notificação exibida com sucesso'
        });
      })
      .catch(err => {
        console.error('[SW] ❌ Erro no teste:', err);
        event.source.postMessage({
          type: MESSAGE_TYPES.TEST_PUSH_ERROR,
          error: err.message
        });
      });
  }
});

// ============================================================================
// INITIALIZATION
// ============================================================================

console.log('[SW] ✅ Service Worker carregado:', SW_VERSION);
console.log('[SW] 🌐 Navegador:', BROWSER_TYPE);