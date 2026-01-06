"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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

function isIOS() {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
}

function isStandalone() {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  return window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
}

function isPushSupported() {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    return false;
  }
  if (isIOS() && !isStandalone()) {
    return false;
  }
  return true;
}

export default function useWebPush({ userId }: { userId: string }) {
  const router = useRouter();
  const [permission, setPermission] = useState<NotificationPermission | null>(null);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start as true
  const [notificacoes, setNotificacoes] = useState<{ title: string; body: any; data: any } | null>(null);
  const [needsInstall, setNeedsInstall] = useState(false);

  // Unsubscribe function
  const unsubscribe = useCallback(async () => {
    if (!subscription) return false;
    setIsLoading(true);
    try {
      await subscription.unsubscribe();
      console.log('✅ Subscription cancelada');
      setSubscription(null);
      // Here you might want to call a server action to remove the subscription from the DB
      toast.success('Notificações desativadas');
      return true;
    } catch (error) {
      console.error('❌ Erro ao cancelar subscription:', error);
      toast.error('Erro ao desativar notificações');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [subscription]);


  // Subscribe function
  const subscribe = useCallback(async () => {
    if (!userId) {
        toast.error('Você precisa estar autenticado para ativar as notificações.');
        return false;
    }
    
    if (needsInstall) {
        toast.error('Instale o app na tela inicial primeiro', {
            description: 'Toque no botão compartilhar e depois em "Adicionar à Tela Inicial"'
        });
        return false;
    }

    if (!isPushSupported()) {
        toast.error('Notificações não são suportadas neste navegador/modo.');
        return false;
    }
    
    // Check permission status before requesting
    const currentPermission = Notification.permission;
    if (currentPermission === 'denied') {
        toast.error('As notificações estão bloqueadas.', {
            description: 'Você precisa permitir as notificações nas configurações do seu navegador.'
        });
        return false;
    }

    setIsLoading(true);

    try {
        const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
        await navigator.serviceWorker.ready;
        console.log('✅ Service Worker pronto');

        // Request permission if not granted
        let perm: NotificationPermission = currentPermission;
        if (perm === 'default') {
            perm = await Notification.requestPermission();
        }
        setPermission(perm);

        if (perm !== 'granted') {
            toast.error('Permissão para notificações não foi concedida.');
            return false;
        }

        // Get or create subscription
        let sub = await registration.pushManager.getSubscription();
        if (!sub) {
            console.log('🔄 Criando nova subscription...');
            try {
                sub = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!),
                });
            } catch (error: any) {
                if (error.name === 'InvalidStateError') {
                    console.warn('⚠️ Subscription com chave inválida. Removendo a antiga...');
                    const oldSub = await registration.pushManager.getSubscription();
                    if (oldSub) await oldSub.unsubscribe();
                    // Delay to allow unsub to process
                    await new Promise(resolve => setTimeout(resolve, 250)); 
                    sub = await registration.pushManager.subscribe({
                        userVisibleOnly: true,
                        applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!),
                    });
                } else {
                    throw error;
                }
            }
        }
        
        console.log('✅ Subscription obtida:', sub.endpoint);
        setSubscription(sub);
        
        // Save to DB
        const deviceInfo = `${navigator.userAgent} | Standalone: ${isStandalone()} | iOS: ${isIOS()}`;
        await salvarPushSubscription(userId, sub.toJSON() as any, deviceInfo);

        toast.success('Notificações ativadas com sucesso!');
        return true;
    } catch (error) {
        console.error('❌ Erro fatal ao inscrever:', error);
        toast.error('Erro ao ativar notificações', {
            description: error instanceof Error ? error.message : 'Ocorreu um problema desconhecido.'
        });
        return false;
    } finally {
        setIsLoading(false);
    }
  }, [userId, needsInstall]);


  // Main effect for initialization and synchronization
  useEffect(() => {
    // 1. Check basic support
    if (isIOS() && !isStandalone()) {
      setNeedsInstall(true);
      setIsLoading(false);
      return;
    }
    if (!isPushSupported()) {
      setIsLoading(false);
      return;
    }

    // 2. Sync state function
    const syncSubscriptionState = async () => {
      console.log('🔄 Sincronizando estado da subscription...');
      setIsLoading(true);
      try {
        const currentPermission = Notification.permission;
        setPermission(currentPermission);
        
        const registration = await navigator.serviceWorker.ready;
        const currentSub = await registration.pushManager.getSubscription();

        if (currentPermission === 'granted') {
          if (!currentSub) {
            console.log('✅ Permissão concedida, mas sem subscription. Tentando inscrever...');
            await subscribe();
          } else {
            console.log('✅ Permissão e subscription estão OK.');
            setSubscription(currentSub);
          }
        } else if (currentPermission === 'denied') {
          if (currentSub) {
            console.warn('⚠️ Permissão negada, mas uma subscription antiga existe. Removendo...');
            await currentSub.unsubscribe();
            setSubscription(null);
            // Optional: notify server to remove the subscription
          } else {
             console.log('✅ Permissão negada e sem subscription. Estado consistente.');
          }
        } else { // default
            console.log('🤔 Permissão pendente. Aguardando ação do usuário.');
            setSubscription(null); // Ensure no old sub is lingering in state
        }
      } catch (error) {
        console.error('❌ Erro ao sincronizar estado:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    syncSubscriptionState();

    // 3. Listen for app focus to re-sync
    window.addEventListener('focus', syncSubscriptionState);
    
    // 4. Listen for messages from SW
    const messageHandler = (event: MessageEvent) => {
        if (event.data?.type === 'PUSH_NOTIFICATION_FOREGROUND') {
            const { title, body, data } = event.data.data;
            console.log('🔔 Notificação recebida em primeiro plano:', title);
            setNotificacoes({ title, body, data });
            toast.info(title, {
                description: body,
                action: data?.url ? { label: "Ver", onClick: () => router.push(data.url) } : undefined,
                duration: 5000,
            });
        }
        if (event.data?.type === 'REVALIDATE_DATA') {
            console.log('🔄 Revalidando dados (solicitado pelo SW)');
            router.refresh();
        }
    };

    navigator.serviceWorker.addEventListener('message', messageHandler);

    // 5. Cleanup
    return () => {
      window.removeEventListener('focus', syncSubscriptionState);
      navigator.serviceWorker.removeEventListener('message', messageHandler);
    };
  }, [router, subscribe, userId]); // Dependency on subscribe and userId is important

  return {
    permission,
    subscription,
    isSubscribed: !!subscription,
    isLoading,
    subscribe,
    unsubscribe,
    notificacoes,
    isSupported: isPushSupported(),
    needsInstall,
    isIOS: isIOS(),
    isStandalone: isStandalone(),
  };
}
