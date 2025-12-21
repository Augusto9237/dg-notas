// Service Worker otimizado para Microsoft Edge
const SW_VERSION = 'v1.0.4';
const isEdge = /Edg/.test(self.navigator.userAgent);

console.log('[SW] Iniciando Service Worker', SW_VERSION);
console.log('[SW] Navegador Edge:', isEdge);

// Handler para eventos PUSH
self.addEventListener('push', function(event) {
  console.log('[SW] Push recebido', new Date().toISOString());
  
  if (!event.data) {
    console.log('[SW] Evento push sem dados');
    return;
  }

  try {
    const data = event.data.json();
    console.log('[SW] Dados parseados:', JSON.stringify(data));
    
    const title = data.title || 'Nova Notificacao';
    const notificationTag = data.tag || 'notification-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    
    const options = {
      body: data.body || data.message || 'Voce tem uma nova notificacao',
      icon: data.icon || '/Simbolo1.png',
      badge: data.badge || '/Simbolo1.png',
      vibrate: data.vibrate || [200, 100, 200],
      data: {
        dateOfArrival: Date.now(),
        url: data.url || data.link || '/',
        notificationId: Date.now()
      },
      tag: notificationTag,
      renotify: data.renotify !== undefined ? data.renotify : true,
      requireInteraction: data.requireInteraction !== undefined ? data.requireInteraction : true, // CRÍTICO: Respeita o valor do servidor
      silent: data.silent !== undefined ? data.silent : false,
      timestamp: Date.now(),
      actions: data.actions || []
    };

    console.log('[SW] Mostrando notificacao:', title);
    console.log('[SW] Opcoes completas:', JSON.stringify({
      requireInteraction: options.requireInteraction,
      renotify: options.renotify,
      silent: options.silent,
      tag: options.tag,
      vibrate: options.vibrate
    }));

    event.waitUntil(
      self.registration.showNotification(title, options)
        .then(() => {
          console.log('[SW] Notificacao exibida com sucesso');
          console.log('[SW] Tag usada:', notificationTag);
        })
        .catch(err => {
          console.error('[SW] Erro ao exibir notificacao:', err.message);
          console.error('[SW] Erro completo:', err);
          
          // Fallback simplificado para Edge
          return self.registration.showNotification(title, {
            body: options.body,
            icon: options.icon,
            tag: notificationTag,
            data: options.data
          }).catch(err2 => {
            console.error('[SW] Erro no fallback:', err2.message);
          });
        })
    );
  } catch (error) {
    console.error('[SW] Erro ao processar notificacao:', error.message);
    
    // Fallback genérico
    const fallbackTag = 'fallback-' + Date.now();
    event.waitUntil(
      self.registration.showNotification('Nova Notificacao', {
        body: 'Voce tem uma nova notificacao',
        icon: '/Simbolo1.png',
        tag: fallbackTag,
        data: { url: '/' }
      }).catch(err => {
        console.error('[SW] Erro fatal na notificacao:', err.message);
      })
    );
  }
});

// Handler para cliques em notificações
self.addEventListener('notificationclick', function(event) {
  console.log('[SW] Notificacao clicada:', event.notification.tag);
  event.notification.close();
  
  const url = event.notification.data?.url || '/';
  console.log('[SW] Abrindo URL:', url);
  
  event.waitUntil(
    clients.matchAll({ 
      type: 'window', 
      includeUncontrolled: true 
    })
      .then(function(clientList) {
        console.log('[SW] Clientes encontrados:', clientList.length);
        
        // Tenta focar janela existente
        for (const client of clientList) {
          if ('focus' in client) {
            console.log('[SW] Focando janela existente');
            return client.focus();
          }
        }
        
        // Abre nova janela
        if (clients.openWindow) {
          console.log('[SW] Abrindo nova janela');
          const fullUrl = url.startsWith('http') ? url : self.location.origin + url;
          return clients.openWindow(fullUrl);
        }
      })
      .catch(err => console.error('[SW] Erro ao abrir janela:', err.message))
  );
});

// Handler para fechamento de notificações
self.addEventListener('notificationclose', function(event) {
  console.log('[SW] Notificacao fechada:', event.notification.tag);
});

// Handler para instalação
self.addEventListener('install', function(event) {
  console.log('[SW] Service Worker instalando', SW_VERSION);
  event.waitUntil(
    self.skipWaiting().then(() => {
      console.log('[SW] Skip waiting executado');
    })
  );
});

// Handler para ativação
self.addEventListener('activate', function(event) {
  console.log('[SW] Service Worker ativando', SW_VERSION);
  event.waitUntil(
    self.clients.claim().then(() => {
      console.log('[SW] Service Worker assumiu controle');
      
      // Notifica todos os clientes
      return self.clients.matchAll().then(clients => {
        console.log('[SW] Notificando', clients.length, 'clientes');
        clients.forEach(client => {
          client.postMessage({ 
            type: 'SW_ACTIVATED',
            version: SW_VERSION
          });
        });
      });
    })
  );
});

// Handler para mensagens dos clientes
self.addEventListener('message', function(event) {
  console.log('[SW] Mensagem recebida:', event.data);
  
  if (!event.data) return;

  // Skip waiting
  if (event.data.type === 'SKIP_WAITING') {
    console.log('[SW] Executando skip waiting via mensagem');
    self.skipWaiting();
  }
  
  // Teste de push simulado
  if (event.data.type === 'TEST_PUSH') {
    console.log('[SW] Simulando push com dados:', event.data.data);
    
    const data = event.data.data || {};
    const title = data.title || 'Teste Push Simulado';
    
    self.registration.showNotification(title, {
      body: data.body || 'Notificacao de teste via mensagem',
      icon: data.icon || '/Simbolo1.png',
      badge: '/Simbolo1.png',
      tag: 'test-message-' + Date.now(),
      requireInteraction: true,
      data: { url: '/', test: true }
    })
      .then(() => {
        console.log('[SW] Notificacao de teste exibida');
        // Envia confirmação de volta
        event.source.postMessage({
          type: 'TEST_PUSH_SUCCESS',
          message: 'Notificacao exibida com sucesso'
        });
      })
      .catch(err => {
        console.error('[SW] Erro ao exibir notificacao de teste:', err.message);
        event.source.postMessage({
          type: 'TEST_PUSH_ERROR',
          error: err.message
        });
      });
  }
});

// Log de inicialização
console.log('[SW] Service Worker carregado completamente', SW_VERSION);