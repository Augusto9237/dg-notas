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

export async function sendWebPushNotification(
  subscription: PushSubscriptionData,
  payload: NotificationPayload
) {
  try {
    const uniqueTag = payload.tag || `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Detecta se é WNS (Edge)
    const isWNS = subscription.endpoint.includes('notify.windows.com');
    
    // Payload simplificado para WNS - remove campos não suportados
    const finalPayload = isWNS ? {
      title: payload.title,
      body: payload.body,
      icon: payload.icon,
      badge: payload.badge,
      url: payload.url || payload.link || '/',
      tag: uniqueTag,
      requireInteraction: payload.requireInteraction ?? true,
      silent: payload.silent ?? false,
    } : {
      // Payload completo para outros browsers (Chrome, Firefox)
      ...payload,
      url: payload.url || payload.link || '/',
      tag: uniqueTag,
      requireInteraction: payload.requireInteraction ?? true,
      vibrate: payload.vibrate || [300, 100, 300],
      silent: payload.silent ?? false,
      renotify: payload.renotify ?? true,
    };

    console.log('📤 Enviando notificação:', {
      endpoint: subscription.endpoint.substring(0, 50) + '...',
      title: finalPayload.title,
      tag: uniqueTag,
      requireInteraction: finalPayload.requireInteraction,
      isWNS
    });


    const result = await webpush.sendNotification(
      subscription as any,
      JSON.stringify(finalPayload),
      {
        TTL: 60 * 60 * 24,
        urgency: 'high',
      }
    );
    
    // Log detalhado para WNS (Edge)
    if (isWNS) {
      console.log('🪟 WNS Response:', {
        statusCode: result.statusCode,
        headers: result.headers,
        body: result.body?.toString().substring(0, 200)
      });
    }

    
    console.log('✅ Notificação enviada com sucesso');
    return { success: true };
  } catch (error: any) {
    console.error('❌ Erro ao enviar notificação:', error);
    
    // Log detalhado do erro WNS
    if (subscription.endpoint.includes('notify.windows.com')) {
      console.error('🪟 WNS Error Details:', {
        statusCode: error.statusCode,
        body: error.body,
        message: error.message,
        headers: error.headers
      });
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
      isInvalid 
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