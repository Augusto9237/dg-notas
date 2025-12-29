const { revalidatePath } = require("next/cache");

// Service Worker Universal - Suporte para Chrome, Edge e Safari
const SW_VERSION = 'v2.0.0';

// Detecção de navegador
const userAgent = self.navigator.userAgent;
const isChrome = /Chrome/.test(userAgent) && !/Edg/.test(userAgent);
const isEdge = /Edg/.test(userAgent);
const isSafari = /Safari/.test(userAgent) && !/Chrome/.test(userAgent);

const browser = isChrome ? 'Chrome' : isEdge ? 'Edge' : isSafari ? 'Safari' : 'Other';

console.log('[SW] 🚀 Iniciando Service Worker', SW_VERSION);
console.log('[SW] 🌐 Navegador detectado:', browser);

// Função para gerar tag única
function generateUniqueTag() {
  return 'notif-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
}

// Função para construir opções de notificação específicas por navegador
function buildNotificationOptions(data, browserType) {
  const baseOptions = {
    body: data.body || data.message || 'Você tem uma nova notificação',
    icon: data.icon || '/Simbolo1.png',
    badge: data.badge || '/Simbolo1.png',
    tag: data.tag || generateUniqueTag(),
    data: {
      url: data.url || data.link || '/',
      timestamp: Date.now(),
      notificationId: Date.now()
    }
  };

  // Chrome e Edge suportam mais opções
  if (browserType === 'Chrome' || browserType === 'Edge') {
    return {
      ...baseOptions,
      requireInteraction: data.requireInteraction !== undefined ? data.requireInteraction : true,
      vibrate: data.vibrate || [200, 100, 200],
      renotify: data.renotify !== undefined ? data.renotify : true,
      silent: data.silent !== undefined ? data.silent : false,
      timestamp: Date.now(),
      actions: data.actions || []
    };
  } 
  
  // Safari tem suporte limitado
  if (browserType === 'Safari') {
    return {
      ...baseOptions,
      silent: data.silent !== undefined ? data.silent : false
      // Safari não suporta: vibrate, renotify, requireInteraction, actions
    };
  }

  // Fallback para outros navegadores
  return baseOptions;
}

// Handler para eventos PUSH
self.addEventListener('push', function(event) {
  console.log('[SW] ========================================');
  console.log('[SW] 🔔 PUSH EVENT RECEBIDO', new Date().toISOString());
  console.log('[SW] 🌐 Browser:', browser);
  console.log('[SW] ========================================');
  
  if (!event.data) {
    console.error('[SW] ❌ Evento push SEM DADOS');
    return;
  }

  try {
    const data = event.data.json();
    console.log('[SW] ✅ Dados recebidos:', JSON.stringify(data, null, 2));
    
    const title = data.title || 'Nova Notificação';
    const options = buildNotificationOptions(data, browser);

    revalidatePath(`${options.data.url}`);
  
    event.waitUntil(
      self.clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then(clientList => {
          // Check if there's at least one focused/visible client
          const focusedClient = clientList.find(client => client.visibilityState === 'visible');

          if (focusedClient) {
            console.log('[SW] 👁️ App está aberta e visível. Enviando mensagem para o cliente...');
            focusedClient.postMessage({
              type: 'PUSH_NOTIFICATION_FOREGROUND',
              data: {
                title,
                body: options.body,
                icon: options.icon,
                image: options.image,
                data: options.data
              }
            });
            return Promise.resolve(); // Não exibe notificação do sistema
          }

          console.log('[SW] 💤 App em background. Exibindo notificação do sistema...');
          return self.registration.showNotification(title, options)
            .then(() => {
              console.log('[SW] ✅✅✅ NOTIFICAÇÃO EXIBIDA COM SUCESSO!');
              console.log('[SW] ========================================');
            });
        })
        .catch(err => {
          console.error('[SW] ❌ ERRO ao processar notificação:', err);
          // Em caso de erro, tenta exibir a notificação mesmo assim
          return self.registration.showNotification(title, options);
        })
    );
  } catch (error) {
    console.error('[SW] ❌ ERRO FATAL ao processar push:', error);
    
    // Fallback genérico
    event.waitUntil(
      self.registration.showNotification('Nova Notificação', {
        body: 'Você tem uma nova notificação',
        icon: '/Simbolo1.png',
        tag: generateUniqueTag(),
        data: { url: '/' }
      }).catch(err => {
        console.error('[SW] ❌ Erro fatal no fallback genérico:', err);
      })
    );
  }
});

// Handler para cliques em notificações
self.addEventListener('notificationclick', function(event) {
  console.log('[SW] 🖱️ Notificação clicada:', event.notification.tag);
  event.notification.close();
  
  const url = event.notification.data?.url || '/';
  console.log('[SW] 🔗 Abrindo URL:', url);
  
  event.waitUntil(
    clients.matchAll({ 
      type: 'window', 
      includeUncontrolled: true 
    })
      .then(function(clientList) {
        console.log('[SW] 👥 Clientes encontrados:', clientList.length);
        
        // Tenta focar janela existente
        for (const client of clientList) {
          if (client.url === url && 'focus' in client) {
            console.log('[SW] 🎯 Focando janela existente');
            return client.focus();
          }
        }
        
        // Abre nova janela
        if (clients.openWindow) {
          console.log('[SW] 🪟 Abrindo nova janela');
          const fullUrl = url.startsWith('http') ? url : self.location.origin + url;
          return clients.openWindow(fullUrl);
        }
      })
      .catch(err => console.error('[SW] ❌ Erro ao abrir janela:', err))
  );
});

// Handler para fechamento de notificações
self.addEventListener('notificationclose', function(event) {
  console.log('[SW] 🚫 Notificação fechada:', event.notification.tag);
});

// Handler para instalação
self.addEventListener('install', function(event) {
  console.log('[SW] 📦 Service Worker instalando', SW_VERSION);
  event.waitUntil(
    self.skipWaiting().then(() => {
      console.log('[SW] ⏭️ Skip waiting executado');
    })
  );
});

// Handler para ativação
self.addEventListener('activate', function(event) {
  console.log('[SW] ⚡ Service Worker ativando', SW_VERSION);
  event.waitUntil(
    self.clients.claim().then(() => {
      console.log('[SW] 👑 Service Worker assumiu controle');
      
      // Notifica todos os clientes
      return self.clients.matchAll().then(clients => {
        console.log('[SW] 📢 Notificando', clients.length, 'clientes');
        clients.forEach(client => {
          client.postMessage({ 
            type: 'SW_ACTIVATED',
            version: SW_VERSION,
            browser: browser
          });
        });
      });
    })
  );
});

// Handler para mensagens dos clientes
self.addEventListener('message', function(event) {
  console.log('[SW] 📨 Mensagem recebida:', event.data);
  
  if (!event.data) return;

  // PING/PONG para teste de comunicação
  if (event.data.type === 'PING') {
    console.log('[SW] 🏓 PING recebido, enviando PONG...');
    event.source.postMessage({
      type: 'PONG',
      timestamp: Date.now(),
      swVersion: SW_VERSION,
      browser: browser
    });
    return;
  }

  // Skip waiting
  if (event.data.type === 'SKIP_WAITING') {
    console.log('[SW] ⏭️ Executando skip waiting via mensagem');
    self.skipWaiting();
  }
  
  // Teste de push simulado
  if (event.data.type === 'TEST_PUSH') {
    console.log('[SW] 🧪 Simulando push com dados:', event.data.data);
    
    const data = event.data.data || {};
    const title = data.title || 'Teste Push Simulado';
    const options = buildNotificationOptions(data, browser);
    
    self.registration.showNotification(title, options)
      .then(() => {
        console.log('[SW] ✅ Notificação de teste exibida');
        event.source.postMessage({
          type: 'TEST_PUSH_SUCCESS',
          message: 'Notificação exibida com sucesso'
        });
      })
      .catch(err => {
        console.error('[SW] ❌ Erro ao exibir notificação de teste:', err);
        event.source.postMessage({
          type: 'TEST_PUSH_ERROR',
          error: err.message
        });
      });
  }
});

// Log de inicialização completa
console.log('[SW] ✅ Service Worker carregado completamente', SW_VERSION);
console.log('[SW] 🌐 Otimizado para:', browser);