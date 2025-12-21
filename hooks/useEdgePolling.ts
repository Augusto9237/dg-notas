"use client";

import { useEffect, useRef } from 'react';

/**
 * Hook para polling de notificações no Edge
 * Busca notificações a cada 30 segundos quando o navegador é Edge
 */
export function useEdgePolling(userId: string | undefined) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Só ativa polling se for Edge
    const isEdge = /Edg/.test(navigator.userAgent);
    
    if (!isEdge || !userId) {
      return;
    }

    console.log('🔄 [Edge Polling] Ativado para usuário:', userId);

    const pollNotifications = async () => {
      try {
        const response = await fetch('/api/notifications/poll');
        
        if (!response.ok) {
          console.error('[Edge Polling] Erro na resposta:', response.status);
          return;
        }

        const data = await response.json();

        if (data.count > 0 && 'serviceWorker' in navigator) {
          console.log(`[Edge Polling] ${data.count} notificação(ões) recebida(s)`);
          
          const registration = await navigator.serviceWorker.ready;
          
          for (const notification of data.notifications) {
            await registration.showNotification(notification.title, {
              body: notification.body,
              icon: notification.icon || '/Simbolo1.png',
              badge: notification.badge || '/Simbolo1.png',
              tag: notification.tag || `poll-${Date.now()}`,
              data: {
                url: notification.url || '/',
                timestamp: notification.timestamp
              },
              requireInteraction: true
            });
          }
        }
      } catch (error) {
        console.error('[Edge Polling] Erro:', error);
      }
    };

    // Poll imediatamente e depois a cada 30 segundos
    pollNotifications();
    intervalRef.current = setInterval(pollNotifications, 30000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        console.log('🛑 [Edge Polling] Desativado');
      }
    };
  }, [userId]);
}
