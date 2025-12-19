self.addEventListener('push', function(event) {
  console.log('[SW] 📬 Push recebido:', event);
  
  if (!event.data) {
    console.log('[SW] ⚠️ Evento push sem dados');
    return;
  }

  try {
    // Tenta fazer parse dos dados
    const data = event.data.json();
    console.log('[SW] 📦 Dados parseados:', data);
    
    const title = data.title || 'Nova Notificação';
    
    // IMPORTANTE: Tag única para cada notificação
    // Isso garante que múltiplas notificações apareçam
    const notificationTag = data.tag || 'notification-' + Date.now() + '-' + Math.random();
    
    const options = {
      body: data.body || data.message || 'Você tem uma nova notificação',
      icon: data.icon || '/Símbolo1.png',
      badge: data.badge || '/Símbolo1.png',
      vibrate: [200, 100, 200],
      data: {
        dateOfArrival: Date.now(),
        url: data.url || data.link || '/',
        notificationId: Date.now()
      },
      tag: notificationTag, // Tag única
      renotify: true, // Força nova notificação mesmo com mesma tag
      requireInteraction: false,
      silent: false, // Nunca silencioso
      timestamp: Date.now(),
      actions: data.actions || []
    };

    console.log('[SW] 🔔 Mostrando notificação:', title, options);

    event.waitUntil(
      self.registration.showNotification(title, options)
        .then(() => {
          console.log('[SW] ✅ Notificação exibida com sucesso');
          console.log('[SW] 📊 Tag usada:', notificationTag);
        })
        .catch(err => {
          console.error('[SW] ❌ Erro ao exibir notificação:', err);
          // Tenta novamente sem algumas opções
          return self.registration.showNotification(title, {
            body: options.body,
            icon: options.icon,
            data: options.data,
            tag: notificationTag
          });
        })
    );
  } catch (error) {
    console.error('[SW] ❌ Erro ao processar notificação:', error);
    
    // Fallback: mostra notificação genérica com tag única
    const fallbackTag = 'fallback-' + Date.now();
    event.waitUntil(
      self.registration.showNotification('Nova Notificação', {
        body: 'Você tem uma nova notificação',
        icon: '/Símbolo1.png',
        badge: '/Símbolo1.png',
        data: { url: '/' },
        tag: fallbackTag,
        renotify: true
      })
    );
  }
});

self.addEventListener('notificationclick', function(event) {
  console.log('[SW] 🖱️ Notificação clicada:', event.notification.tag);
  event.notification.close();
  
  const url = event.notification.data?.url || '/';
  console.log('[SW] 🌐 Abrindo URL:', url);
  
  event.waitUntil(
    clients.matchAll({ 
      type: 'window', 
      includeUncontrolled: true 
    })
      .then(function(clientList) {
        console.log('[SW] 📱 Clientes encontrados:', clientList.length);
        
        // Tenta focar em uma janela existente
        for (const client of clientList) {
          const clientUrl = new URL(client.url);
          const targetUrl = url.startsWith('http') ? url : clientUrl.origin + url;
          
          if (client.url === targetUrl && 'focus' in client) {
            console.log('[SW] ✅ Focando janela existente');
            return client.focus();
          }
        }
        
        // Se tem alguma janela aberta, navega nela
        if (clientList.length > 0 && 'navigate' in clientList[0]) {
          console.log('[SW] 🔄 Navegando em janela existente');
          const client = clientList[0];
          const clientUrl = new URL(client.url);
          const targetUrl = url.startsWith('http') ? url : clientUrl.origin + url;
          return client.focus().then(() => client.navigate(targetUrl));
        }
        
        // Caso contrário, abre nova janela
        if (clients.openWindow) {
          console.log('[SW] 🆕 Abrindo nova janela');
          return clients.openWindow(url);
        }
      })
      .catch(err => console.error('[SW] ❌ Erro ao abrir janela:', err))
  );
});

self.addEventListener('notificationclose', function(event) {
  console.log('[SW] 🔕 Notificação fechada:', event.notification.tag);
});

self.addEventListener('install', function(event) {
  console.log('[SW] 🔧 Service Worker instalado');
  self.skipWaiting(); // Ativa imediatamente
});

self.addEventListener('activate', function(event) {
  console.log('[SW] ✅ Service Worker ativado');
  event.waitUntil(
    clients.claim().then(() => {
      console.log('[SW] 🎯 Service Worker assumiu controle dos clientes');
    })
  );
});