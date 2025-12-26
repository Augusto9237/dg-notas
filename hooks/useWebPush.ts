"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { salvarPushSubscription } from "@/actions/notificacoes";

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function useWebPush({ userId }: { userId: string }) {
  const router = useRouter();
  const [permission, setPermission] = useState<NotificationPermission | null>(null);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const subscriptionSaved = useRef(false);
  const [notificacoes, setNotificacoes] = useState<{ title: string; body: any; data: any } | null>(null);

  // Verifica suporte e permissão inicial
  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('⚠️ Web Push não é suportado neste navegador');
      return;
    }

    setPermission(Notification.permission);
    checkExistingSubscription();

    // Listener para mensagens do Service Worker (Foreground Push)
    const messageHandler = (event: MessageEvent) => {
      if (event.data && event.data.type === 'PUSH_NOTIFICATION_FOREGROUND') {
        const { title, body, data } = event.data.data;
        console.log('🔔 Notificação recebida em primeiro plano:', title);
        setNotificacoes({ title, body, data });

        toast.info(title, {
          description: body,
          action: data?.url ? {
            label: "Ver",
            onClick: () => router.push(data.url)
          } : undefined,
          duration: 5000,
        });
      }
    };

    navigator.serviceWorker.addEventListener('message', messageHandler);

    return () => {
      navigator.serviceWorker.removeEventListener('message', messageHandler);
    };
  }, []);

  // Verifica subscription existente
  const checkExistingSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const existingSub = await registration.pushManager.getSubscription();
      
      if (existingSub) {
        setSubscription(existingSub);
        console.log('✅ Subscription existente encontrada');
      }
    } catch (error) {
      console.error('❌ Erro ao verificar subscription:', error);
    }
  };

  // Registra o Service Worker
  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });
      
      await navigator.serviceWorker.ready;
      console.log('✅ Service Worker registrado');
      return registration;
    } catch (error) {
      console.error('❌ Erro ao registrar Service Worker:', error);
      throw error;
    }
  };

  // Solicita permissão e cria subscription
  const subscribe = async () => {
    if (!userId) {
      console.log('Você precisa estar autenticado');
      return false;
    }

    setIsLoading(true);

    try {
      // Solicita permissão
      const permissionResult = await Notification.requestPermission();
      setPermission(permissionResult);

      if (permissionResult !== 'granted') {
        toast.error('Permissão negada para notificações');
        return false;
      }

      // Registra Service Worker
      const registration = await registerServiceWorker();

      // Funcao auxiliar para realizar a inscricao
      const subscribeToPush = async () => {
        return await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(
            process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
          ),
        });
      };

      // Tenta criar subscription
      let sub;
      try {
        sub = await subscribeToPush();
      } catch (error: any) {
        // Se houver conflito de chaves (InvalidStateError), remove a anterior e tenta de novo
        if (error.name === 'InvalidStateError') {
          console.warn('⚠️ Subscription com chave diferente detectada. Renovando...');
          const existingSub = await registration.pushManager.getSubscription();
          if (existingSub) {
            await existingSub.unsubscribe();
            sub = await subscribeToPush();
          } else {
            throw error;
          }
        } else {
          throw error;
        }
      }

      console.log('✅ Subscription criada:', sub.endpoint);
      setSubscription(sub);

      // Salva no banco de dados
      const deviceInfo = navigator.userAgent;
      await salvarPushSubscription(
        userId,
        sub.toJSON() as any,
        deviceInfo
      );

      subscriptionSaved.current = true;
      console.log('Notificações ativadas com sucesso!');
      return true;
    } catch (error) {
      console.error('❌ Erro ao criar subscription:', error);
      console.error('Erro ao ativar notificações');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Cancela subscription
  const unsubscribe = async () => {
    if (!subscription) return false;

    try {
      await subscription.unsubscribe();
      setSubscription(null);
      subscriptionSaved.current = false;
      toast.success('Notificações desativadas');
      return true;
    } catch (error) {
      console.error('❌ Erro ao cancelar subscription:', error);
      toast.error('Erro ao desativar notificações');
      return false;
    }
  };

  return {
    permission,
    subscription,
    isSubscribed: !!subscription,
    isLoading,
    subscribe,
    unsubscribe,
    notificacoes,
    isSupported: 'serviceWorker' in navigator && 'PushManager' in window,
  };
}
