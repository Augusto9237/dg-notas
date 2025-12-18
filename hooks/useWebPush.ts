"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
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
  const { data: session, isPending } = authClient.useSession();
  const [permission, setPermission] = useState<NotificationPermission | null>(null);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const subscriptionSaved = useRef(false);

  // Verifica suporte e permissão inicial
  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('⚠️ Web Push não é suportado neste navegador');
      return;
    }

    setPermission(Notification.permission);
    checkExistingSubscription();
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

      // Cria subscription
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
        ),
      });

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
      toast.success('Notificações ativadas com sucesso!');
      return true;
    } catch (error) {
      console.error('❌ Erro ao criar subscription:', error);
      toast.error('Erro ao ativar notificações');
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
    isSupported: 'serviceWorker' in navigator && 'PushManager' in window,
  };
}
