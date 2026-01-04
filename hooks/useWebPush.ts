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


// Detecta se está no iOS
function isIOS() {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
}

// Detecta se o PWA está instalado (standalone mode)
function isStandalone() {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  return window.matchMedia('(display-mode: standalone)').matches ||
         (window.navigator as any).standalone === true;
}

// Verifica se Web Push é suportado
function isPushSupported() {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    return false;
  }
  
  // No iOS, só funciona em standalone mode
  if (isIOS() && !isStandalone()) {
    return false;
  }
  
  return true;
}

export default function useWebPush({ userId }: { userId: string }) {
  const router = useRouter();
  const [permission, setPermission] = useState<NotificationPermission | null>(null);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const subscriptionSaved = useRef(false);
  const [notificacoes, setNotificacoes] = useState<{ title: string; body: any; data: any } | null>(null);
  const [needsInstall, setNeedsInstall] = useState(false);

  // Verifica suporte e permissão inicial
  useEffect(() => {
    // Verifica se precisa instalar (iOS não standalone)
    if (isIOS() && !isStandalone()) {
      setNeedsInstall(true);
      console.warn('⚠️ iOS requer instalação do PWA na tela inicial para notificações');
      return;
    }

    if (!isPushSupported()) {
      console.warn('⚠️ Web Push não é suportado neste navegador/modo');
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
          duration: 2000,
        });
      }

      // Handler para revalidação de dados quando notificação chega em background
      if (event.data && event.data.type === 'REVALIDATE_DATA') {
        console.log('🔄 Revalidando dados após notificação em background');
        router.refresh();
      }
    };

    navigator.serviceWorker.addEventListener('message', messageHandler);

    return () => {
      navigator.serviceWorker.removeEventListener('message', messageHandler);
    };
  }, [router]);

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
      // No iOS, usar scope mais específico pode ajudar
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none', // Importante para iOS
      });
      
      // Aguarda o service worker estar pronto
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
      toast.error('Você precisa estar autenticado');
      return false;
    }

    // Verifica se precisa instalar no iOS
    if (isIOS() && !isStandalone()) {
      toast.error('Instale o app na tela inicial primeiro', {
        description: 'Toque no botão compartilhar e depois em "Adicionar à Tela Inicial"'
      });
      return false;
    }

    if (!isPushSupported()) {
      toast.error('Notificações não são suportadas neste navegador/modo');
      return false;
    }

    setIsLoading(true);

    try {
      // Solicita permissão - No iOS, isso deve ser chamado em resposta a uma ação do usuário
      const permissionResult = await Notification.requestPermission();
      setPermission(permissionResult);

      if (permissionResult !== 'granted') {
        toast.error('Permissão negada para notificações');
        return false;
      }

      // Registra Service Worker
      const registration = await registerServiceWorker();

      // Função auxiliar para realizar a inscrição
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
            // Pequeno delay para garantir que a unsubscribe foi processada
            await new Promise(resolve => setTimeout(resolve, 500));
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
      const deviceInfo = `${navigator.userAgent} | Standalone: ${isStandalone()} | iOS: ${isIOS()}`;
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
      toast.error('Erro ao ativar notificações', {
        description: error instanceof Error ? error.message : 'Erro desconhecido'
      });
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
    isSupported: isPushSupported(),
    needsInstall, // Novo: indica se precisa instalar o PWA
    isIOS: isIOS(),
    isStandalone: isStandalone(),
  };
}