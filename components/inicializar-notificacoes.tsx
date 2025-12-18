'use client';

import useWebPush from '@/hooks/useWebPush';
import { useEffect } from 'react';
export function IncializarNotificacoes({ userId }: { userId: string }) {
  const { isSupported, permission, isSubscribed, subscribe } = useWebPush({
    userId,
  });

  useEffect(() => {
    if (!isSupported) {
      console.log('ℹ️ Web Push não é suportado neste navegador');
      return;
    }

    if (permission === 'granted' && !isSubscribed) {
      console.log('🔔 Permissão concedida, criando subscription...');
      subscribe();
    }

    if (permission === 'denied') {
      console.warn('⚠️ Usuário negou permissão para notificações');
    }

    if (isSubscribed) {
      console.log('✅ Notificações já estão ativas');
    }
  }, [isSupported, permission, isSubscribed]);

  return null;
}

