"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { salvarPushSubscription, removerPushSubscription, buscarSubscriptionsPorUsuario } from "@/actions/notificacoes";
import type { PushSubscriptionData } from "@/lib/webpush";

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

// Cache para evitar múltiplas chamadas ao banco
interface SubscriptionCache {
  subscriptions: (PushSubscriptionData & { userId: string })[];
  timestamp: number;
}

const SUBSCRIPTION_CACHE_TTL = 60000; // 1 minuto
const MIN_SYNC_INTERVAL = 30000; // 30 segundos mínimo entre sincronizações

export default function useWebPush({ userId }: { userId: string }) {
  const router = useRouter();
  const [permission, setPermission] = useState<NotificationPermission | null>(null);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notificacoes, setNotificacoes] = useState<{ title: string; body: any; data: any } | null>(null);
  const [needsInstall, setNeedsInstall] = useState(false);

  // Cache e controle de sincronização
  const subscriptionCacheRef = useRef<Map<string, SubscriptionCache>>(new Map());
  const lastSyncRef = useRef<number>(0);
  const isSyncingRef = useRef(false);
  const isSubscribingRef = useRef(false);
  const subscribeRef = useRef<(() => Promise<boolean>) | null>(null);
  const focusTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Helper: Buscar subscriptions com cache
  const fetchSubscriptionsWithCache = useCallback(async (userId: string, forceRefresh = false) => {
    const now = Date.now();
    const cache = subscriptionCacheRef.current.get(userId);

    // Retorna do cache se válido e não forçado a atualizar
    if (!forceRefresh && cache && (now - cache.timestamp) < SUBSCRIPTION_CACHE_TTL) {
      return cache.subscriptions;
    }

    // Busca do banco
    const subscriptions = await buscarSubscriptionsPorUsuario(userId);
    
    // Atualiza cache
    subscriptionCacheRef.current.set(userId, {
      subscriptions,
      timestamp: now,
    });

    return subscriptions;
  }, []);

  // Helper: Invalidar cache
  const invalidateCache = useCallback((userId: string) => {
    subscriptionCacheRef.current.delete(userId);
  }, []);

  // Unsubscribe function
  const unsubscribe = useCallback(async () => {
    if (!subscription) return false;
    
    if (isSubscribingRef.current) {
      console.log('⏸️ Operação em andamento, aguarde...');
      return false;
    }

    isSubscribingRef.current = true;
    setIsLoading(true);
    
    try {
      const endpoint = subscription.endpoint;
      await subscription.unsubscribe();
      console.log('✅ Subscription cancelada localmente');

      // Remove do banco de dados e invalida cache
      try {
        await removerPushSubscription(endpoint);
        invalidateCache(userId);
        console.log('✅ Subscription removida do banco de dados');
      } catch (dbError) {
        console.error('⚠️ Erro ao remover subscription do banco:', dbError);
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
      isSubscribingRef.current = false;
    }
  }, [subscription, userId, invalidateCache]);


  // Subscribe function - otimizada para reduzir chamadas ao banco
  const subscribe = useCallback(async () => {
    // Previne múltiplas execuções simultâneas
    if (isSubscribingRef.current) {
      console.log('⏸️ Subscribe já em andamento, ignorando...');
      return false;
    }

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

    const currentPermission = Notification.permission;
    if (currentPermission === 'denied') {
      toast.error('As notificações estão bloqueadas.', {
        description: 'Você precisa permitir as notificações nas configurações do seu navegador.'
      });
      return false;
    }

    isSubscribingRef.current = true;
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

      // Se já existe subscription local, verifica se precisa salvar no banco
      if (sub) {
        console.log('✅ Subscription local encontrada:', sub.endpoint);
        
        // Usa cache para verificar se já existe no banco
        const subsNoBanco = await fetchSubscriptionsWithCache(userId);
        const jaExisteNoBanco = subsNoBanco.some(s => s.endpoint === sub!.endpoint);

        if (jaExisteNoBanco) {
          console.log('✅ Subscription já existe no banco de dados. Usando existente.');
          setSubscription(sub);
          
          // Limpar outras subscriptions antigas apenas se houver mais de uma
          const outrasSubs = subsNoBanco.filter(s => s.endpoint !== sub!.endpoint);
          if (outrasSubs.length > 0) {
            console.log(`🧹 Removendo ${outrasSubs.length} subscription(s) antiga(s)...`);
            // Remove em paralelo para melhor performance
            await Promise.allSettled(
              outrasSubs.map(oldSub => removerPushSubscription(oldSub.endpoint))
            );
            invalidateCache(userId);
          }

          isSubscribingRef.current = false;
          setIsLoading(false);
          return true;
        }
        // Se não existe no banco, continua para salvar abaixo
      }

      // Criar nova subscription se não existir
      if (!sub) {
        console.log('🔄 Criando nova subscription...');
        try {
          sub = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!),
          });
        } catch (error: any) {
          if (error.name === 'InvalidStateError' || error.name === 'AbortError') {
            console.warn('⚠️ Subscription inválida. Limpando...');
            try {
              const oldSub = await registration.pushManager.getSubscription();
              if (oldSub) {
                await oldSub.unsubscribe();
                await removerPushSubscription(oldSub.endpoint).catch(() => {});
                invalidateCache(userId);
              }
            } catch (cleanupErr) {
              console.warn('⚠️ Erro ao limpar:', cleanupErr);
            }
            await new Promise(resolve => setTimeout(resolve, 300));
            
            // Retry
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

      // Limpar subscriptions antigas ANTES de salvar (usando cache se disponível)
      try {
        const subsNoBanco = await fetchSubscriptionsWithCache(userId, true);
        const outrasSubs = subsNoBanco.filter(s => s.endpoint !== sub.endpoint);
        
        if (outrasSubs.length > 0) {
          console.log(`🧹 Removendo ${outrasSubs.length} subscription(s) antiga(s)...`);
          await Promise.allSettled(
            outrasSubs.map(oldSub => removerPushSubscription(oldSub.endpoint))
          );
        }
      } catch (cleanupError) {
        console.warn('⚠️ Erro ao limpar subscriptions antigas:', cleanupError);
      }

      // Save to DB
      const deviceInfo = `${navigator.userAgent} | Standalone: ${isStandalone()} | iOS: ${isIOS()}`;
      await salvarPushSubscription(userId, sub.toJSON() as any, deviceInfo);
      invalidateCache(userId); // Invalida cache após salvar
      console.log('✅ Subscription salva no banco de dados');

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
      isSubscribingRef.current = false;
    }
  }, [userId, needsInstall, fetchSubscriptionsWithCache, invalidateCache]);


  // Atualiza ref quando subscribe muda
  useEffect(() => {
    subscribeRef.current = subscribe;
  }, [subscribe]);

  // Main effect for initialization and synchronization - OTIMIZADO
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

    // 2. Sync state function - otimizada com throttling e cache
    const syncSubscriptionState = async (force = false) => {
      const now = Date.now();
      
      // Throttling: só sincroniza se passou tempo suficiente desde última sync
      if (!force && (now - lastSyncRef.current) < MIN_SYNC_INTERVAL) {
        console.log('⏸️ Sincronização muito recente, ignorando...');
        return;
      }

      // Previne múltiplas execuções simultâneas
      if (isSyncingRef.current || isSubscribingRef.current) {
        console.log('⏸️ Operação já em andamento, ignorando...');
        return;
      }

      isSyncingRef.current = true;
      lastSyncRef.current = now;
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
            if (subscribeRef.current) {
              await subscribeRef.current();
            }
          } else {
            console.log('✅ Permissão e subscription local estão OK.');
            
            // Usa cache para verificar se está no banco
            try {
              const subsNoBanco = await fetchSubscriptionsWithCache(userId);
              const jaExisteNoBanco = subsNoBanco.some(s => s.endpoint === currentSub.endpoint);

              if (jaExisteNoBanco) {
                console.log('✅ Subscription também existe no banco de dados.');
                
                // Limpar outras subscriptions antigas apenas se houver mais de uma
                const outrasSubs = subsNoBanco.filter(s => s.endpoint !== currentSub.endpoint);
                if (outrasSubs.length > 0) {
                  console.log(`🧹 Removendo ${outrasSubs.length} subscription(s) duplicada(s)...`);
                  await Promise.allSettled(
                    outrasSubs.map(oldSub => removerPushSubscription(oldSub.endpoint))
                  );
                  invalidateCache(userId);
                }
              } else {
                console.log('⚠️ Subscription local existe mas não está no banco. Salvando...');
                const deviceInfo = `${navigator.userAgent} | Standalone: ${isStandalone()} | iOS: ${isIOS()}`;
                await salvarPushSubscription(userId, currentSub.toJSON() as any, deviceInfo);
                invalidateCache(userId);
                console.log('✅ Subscription salva no banco de dados');

                // Limpar outras subscriptions antigas
                if (subsNoBanco.length > 0) {
                  console.log(`🧹 Removendo ${subsNoBanco.length} subscription(s) antiga(s)...`);
                  await Promise.allSettled(
                    subsNoBanco.map(oldSub => removerPushSubscription(oldSub.endpoint))
                  );
                  invalidateCache(userId);
                }
              }
            } catch (dbError) {
              console.warn('⚠️ Erro ao verificar/limpar subscriptions no banco:', dbError);
            }
            setSubscription(currentSub);
          }
        } else if (currentPermission === 'denied') {
          if (currentSub) {
            console.warn('⚠️ Permissão negada, mas uma subscription antiga existe. Removendo...');
            const endpoint = currentSub.endpoint;
            try {
              await currentSub.unsubscribe();
              console.log('✅ Subscription cancelada localmente');

              await removerPushSubscription(endpoint).catch(() => {});
              invalidateCache(userId);
            } catch (unsubError) {
              console.error('⚠️ Erro ao cancelar subscription:', unsubError);
            }
            setSubscription(null);
          } else {
            console.log('✅ Permissão negada e sem subscription. Estado consistente.');
          }
        } else {
          console.log('🤔 Permissão pendente. Aguardando ação do usuário.');
          setSubscription(null);
        }
      } catch (error) {
        console.error('❌ Erro ao sincronizar estado:', error);
      } finally {
        setIsLoading(false);
        isSyncingRef.current = false;
      }
    };

    // Sincronização inicial
    syncSubscriptionState(true);

    // 3. Listen for app focus to re-sync (com debounce mais agressivo)
    const handleFocus = () => {
      if (focusTimeoutRef.current) {
        clearTimeout(focusTimeoutRef.current);
      }
      // Debounce de 2 segundos para evitar múltiplas sincronizações
      focusTimeoutRef.current = setTimeout(() => {
        syncSubscriptionState(false);
      }, 2000);
    };

    window.addEventListener('focus', handleFocus);

    // 4. Listen for messages from SW
    const messageHandler = (event: MessageEvent) => {
      if (event.data?.type === 'PUSH_NOTIFICATION_FOREGROUND') {
        const { title, body, data, tag } = event.data.data;
        console.log('🔔 Notificação recebida em primeiro plano:', title);
        setNotificacoes({ title, body, data });
        toast.info(title, {
          id: tag,
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
      if (focusTimeoutRef.current) {
        clearTimeout(focusTimeoutRef.current);
      }
      window.removeEventListener('focus', handleFocus);
      navigator.serviceWorker.removeEventListener('message', messageHandler);
      isSyncingRef.current = false;
    };
  }, [router, userId, fetchSubscriptionsWithCache, invalidateCache]);

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
