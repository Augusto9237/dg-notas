"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { salvarPushSubscription, removerPushSubscription } from "@/actions/notificacoes";

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
      const endpoint = subscription.endpoint;
      await subscription.unsubscribe();
      console.log('✅ Subscription cancelada localmente');
      
      // Remove do banco de dados
      try {
        await removerPushSubscription(endpoint);
        console.log('✅ Subscription removida do banco de dados');
      } catch (dbError) {
        console.error('⚠️ Erro ao remover subscription do banco:', dbError);
        // Não falha a operação se não conseguir remover do banco
      }
      
      setSubscription(null);
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

        // Limpar subscriptions antigas/inválidas antes de criar nova
        try {
            const existingSub = await registration.pushManager.getSubscription();
            if (existingSub) {
                console.log('🔄 Subscription existente encontrada. Verificando validade...');
                // Se a subscription existente não é válida ou está inconsistente, remove
                try {
                    // Tenta obter novamente para verificar se está válida
                    const testSub = await registration.pushManager.getSubscription();
                    if (testSub && testSub.endpoint !== existingSub.endpoint) {
                        console.warn('⚠️ Endpoint inconsistente. Removendo subscription antiga...');
                        await existingSub.unsubscribe();
                        await removerPushSubscription(existingSub.endpoint).catch(() => {});
                        await new Promise(resolve => setTimeout(resolve, 300));
                    }
                } catch (checkError) {
                    console.warn('⚠️ Subscription existente pode estar inválida. Removendo...');
                    await existingSub.unsubscribe().catch(() => {});
                    await removerPushSubscription(existingSub.endpoint).catch(() => {});
                    await new Promise(resolve => setTimeout(resolve, 300));
                }
            }
        } catch (cleanupError) {
            console.warn('⚠️ Erro ao limpar subscriptions antigas:', cleanupError);
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
                if (error.name === 'InvalidStateError' || error.name === 'AbortError') {
                    console.warn('⚠️ Subscription com chave inválida ou estado inconsistente. Limpando...');
                    // Tenta obter e remover todas as subscriptions existentes
                    try {
                        const oldSub = await registration.pushManager.getSubscription();
                        if (oldSub) {
                            const oldEndpoint = oldSub.endpoint;
                            await oldSub.unsubscribe();
                            await removerPushSubscription(oldEndpoint).catch(() => {});
                        }
                    } catch (cleanupErr) {
                        console.warn('⚠️ Erro ao limpar subscription inválida:', cleanupErr);
                    }
                    
                    // Delay para garantir que a limpeza foi processada
                    await new Promise(resolve => setTimeout(resolve, 500)); 
                    
                    // Tenta criar nova subscription
                    try {
                        sub = await registration.pushManager.subscribe({
                            userVisibleOnly: true,
                            applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!),
                        });
                        console.log('✅ Nova subscription criada após limpeza');
                    } catch (retryError) {
                        console.error('❌ Erro ao criar subscription após limpeza:', retryError);
                        throw retryError;
                    }
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


  // Ref para evitar loop infinito
  const isSyncingRef = useRef(false);
  const subscribeRef = useRef(subscribe);
  
  // Atualiza ref quando subscribe muda
  useEffect(() => {
    subscribeRef.current = subscribe;
  }, [subscribe]);

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

    // 2. Sync state function - evitando loops com ref
    const syncSubscriptionState = async () => {
      // Previne múltiplas execuções simultâneas
      if (isSyncingRef.current) {
        console.log('⏸️ Sincronização já em andamento, ignorando...');
        return;
      }

      isSyncingRef.current = true;
      console.log('🔄 Sincronizando estado da subscription...');
      setIsLoading(true);
      
      try {
        // Garantir que o Service Worker está registrado
        let registration: ServiceWorkerRegistration;
        try {
          registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
          await navigator.serviceWorker.ready;
          console.log('✅ Service Worker registrado e pronto');
        } catch (swError) {
          console.error('❌ Erro ao registrar Service Worker:', swError);
          setIsLoading(false);
          isSyncingRef.current = false;
          return;
        }

        const currentPermission = Notification.permission;
        setPermission(currentPermission);
        
        const currentSub = await registration.pushManager.getSubscription();

        if (currentPermission === 'granted') {
          if (!currentSub) {
            console.log('✅ Permissão concedida, mas sem subscription. Tentando inscrever...');
            // Usa a ref para evitar dependência circular
            await subscribeRef.current();
          } else {
            console.log('✅ Permissão e subscription estão OK.');
            setSubscription(currentSub);
          }
        } else if (currentPermission === 'denied') {
          if (currentSub) {
            console.warn('⚠️ Permissão negada, mas uma subscription antiga existe. Removendo...');
            const endpoint = currentSub.endpoint;
            try {
              await currentSub.unsubscribe();
              console.log('✅ Subscription cancelada localmente');
              
              // Remove do banco de dados
              try {
                await removerPushSubscription(endpoint);
                console.log('✅ Subscription removida do banco de dados');
              } catch (dbError) {
                console.error('⚠️ Erro ao remover subscription do banco:', dbError);
              }
            } catch (unsubError) {
              console.error('⚠️ Erro ao cancelar subscription:', unsubError);
            }
            setSubscription(null);
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
        isSyncingRef.current = false;
      }
    };
    
    syncSubscriptionState();

    // 3. Listen for app focus to re-sync (com debounce)
    let focusTimeout: NodeJS.Timeout;
    const handleFocus = () => {
      clearTimeout(focusTimeout);
      focusTimeout = setTimeout(syncSubscriptionState, 500); // Debounce de 500ms
    };
    
    window.addEventListener('focus', handleFocus);
    
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
      clearTimeout(focusTimeout);
      window.removeEventListener('focus', handleFocus);
      navigator.serviceWorker.removeEventListener('message', messageHandler);
      isSyncingRef.current = false;
    };
  }, [router, userId]); // Removido 'subscribe' das dependências para evitar loop

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
