self.addEventListener('push', function (event) {
    console.log('[SW] Push recebido:', event);

    if (event.data) {
        const data = event.data.json();

        const options = {
            body: data.body,
            icon: data.icon || '/Símbolo1.png',
            badge: data.badge || '/Símbolo1.png',
            vibrate: [100, 50, 100],
            data: {
                dateOfArrival: Date.now(),
                url: data.url || data.link || '/'
            },
            tag: data.tag || 'notification',
            requireInteraction: false,
            actions: data.actions || []
        };

        event.waitUntil(
            self.registration.showNotification(data.title, options)
        );
    }
});

self.addEventListener('notificationclick', function (event) {
    console.log('[SW] Notificação clicada');
    event.notification.close();

    const url = event.notification.data.url;

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then(function (clientList) {
                // Tenta focar em uma janela existente
                for (const client of clientList) {
                    if (client.url === url && 'focus' in client) {
                        return client.focus();
                    }
                }
                // Caso contrário, abre nova janela
                if (clients.openWindow) {
                    return clients.openWindow(url);
                }
            })
    );
});

// Listener para instalação do SW
self.addEventListener('install', function (event) {
    console.log('[SW] Instalado');
    self.skipWaiting();
});

self.addEventListener('activate', function (event) {
    console.log('[SW] Ativado');
    event.waitUntil(clients.claim());
});