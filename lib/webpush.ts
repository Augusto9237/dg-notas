import webpush from 'web-push';

const vapidEmail = process.env.VAPID_EMAIL!;
const formattedEmail = vapidEmail.startsWith('mailto:') 
  ? vapidEmail 
  : `mailto:${vapidEmail}`;

webpush.setVapidDetails(
  formattedEmail,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  url?: string;
  link?: string;
  tag?: string;
  requireInteraction?: boolean; // ← Importante
  vibrate?: number[]; // ← Adicione
  silent?: boolean; // ← Adicione
  renotify?: boolean; // ← Adicione
  actions?: Array<{
    action: string;
    title: string;
  }>;
}


/**
 * Detecta o navegador baseado no endpoint da subscription
 */
function detectBrowserFromEndpoint(endpoint: string): 'Chrome' | 'Edge' | 'Safari' | 'Other' {
  if (endpoint.includes('fcm.googleapis.com')) return 'Chrome';
  if (endpoint.includes('notify.windows.com')) return 'Edge';
  if (endpoint.includes('web.push.apple.com')) return 'Safari';
  return 'Other';
}

export async function sendWebPushNotification(
  subscription: PushSubscriptionData & { userId?: string },
  payload: NotificationPayload
) {
  try {
    const uniqueTag = payload.tag || `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const browser = detectBrowserFromEndpoint(subscription.endpoint);
    
    console.log('📤 Enviando notificação:', {
      endpoint: subscription.endpoint.substring(0, 50) + '...',
      title: payload.title,
      tag: uniqueTag,
      browser
    });

    // Para Edge: adiciona à fila de polling como fallback
    if (browser === 'Edge' && subscription.userId) {
      const { queueNotificationForPolling } = await import('@/lib/notification-queue');
      await queueNotificationForPolling(subscription.userId, {
        title: payload.title,
        body: payload.body,
        icon: payload.icon,
        badge: payload.badge,
        url: payload.url || payload.link || '/',
        tag: uniqueTag
      });
      console.log('📥 Notificação adicionada à fila de polling (Edge fallback)');
    }
    
    // Constrói payload otimizado por navegador
    let finalPayload: any;
    
    if (browser === 'Safari') {
      // Safari: apenas opções básicas
      finalPayload = {
        title: payload.title,
        body: payload.body,
        icon: payload.icon,
        badge: payload.badge,
        url: payload.url || payload.link || '/',
        tag: uniqueTag,
        silent: payload.silent ?? false
      };
    } else if (browser === 'Edge') {
      // Edge/WNS: sem vibrate, actions limitadas
      finalPayload = {
        title: payload.title,
        body: payload.body,
        icon: payload.icon,
        badge: payload.badge,
        url: payload.url || payload.link || '/',
        tag: uniqueTag,
        requireInteraction: payload.requireInteraction ?? true,
        silent: payload.silent ?? false,
        renotify: payload.renotify ?? true
      };
    } else {
      // Chrome/Firefox: suporte completo
      finalPayload = {
        ...payload,
        url: payload.url || payload.link || '/',
        tag: uniqueTag,
        requireInteraction: payload.requireInteraction ?? true,
        vibrate: payload.vibrate || [300, 100, 300],
        silent: payload.silent ?? false,
        renotify: payload.renotify ?? true,
      };
    }

    // Tenta enviar via Web Push Protocol
    const result = await webpush.sendNotification(
      subscription as any,
      JSON.stringify(finalPayload),
      {
        TTL: 60 * 60 * 24,
        urgency: 'high',
      }
    );
    
    // Log específico por navegador
    if (browser === 'Edge') {
      console.log('🪟 WNS Response:', {
        statusCode: result.statusCode,
        headers: result.headers
      });
    }
    
    console.log('✅ Notificação enviada com sucesso');
    return { 
      success: true,
      browser,
      fallback: browser === 'Edge' ? 'polling' : undefined
    };
  } catch (error: any) {
    console.error('❌ Erro ao enviar notificação:', error);
    
    const browser = detectBrowserFromEndpoint(subscription.endpoint);
    
    // Para Edge, o fallback de polling já foi configurado
    if (browser === 'Edge' && subscription.userId) {
      console.log('⚠️ Push falhou, mas polling está ativo como fallback');
      return {
        success: true, // Considera sucesso porque polling vai entregar
        browser,
        fallback: 'polling',
        pushFailed: true
      };
    }
    
    const isInvalid = 
      error.statusCode === 410 || 
      error.statusCode === 404 ||
      error.statusCode === 400 ||
      error.statusCode === 401 ||
      error.statusCode === 403 ||
      error.body?.includes('expired') ||
      error.body?.includes('invalid');
    
    return { 
      success: false, 
      error: error.message,
      isInvalid,
      browser
    };
  }
}

export async function sendWebPushNotifications(
  subscriptions: PushSubscriptionData[],
  payload: NotificationPayload
) {
  const results = await Promise.allSettled(
    subscriptions.map(sub => sendWebPushNotification(sub, payload))
  );

  const invalidEndpoints: string[] = [];
  let successCount = 0;
  let failureCount = 0;

  results.forEach((result, index) => {
    if (result.status === 'fulfilled' && result.value.success) {
      successCount++;
    } else {
      failureCount++;
      if (result.status === 'fulfilled' && result.value.isInvalid) {
        invalidEndpoints.push(subscriptions[index].endpoint);
      }
    }
  });

  return {
    success: failureCount === 0,
    successCount,
    failureCount,
    totalSubscriptions: subscriptions.length,
    invalidEndpoints,
  };
}