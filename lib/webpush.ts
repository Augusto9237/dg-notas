import webpush from 'web-push';

// Configurar VAPID
// IMPORTANTE: VAPID_EMAIL deve começar com "mailto:"
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
  url?: string;
  link?: string; // Alias para compatibilidade
  tag?: string; // Tag personalizada (opcional)
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
    // Garante tag única se não foi fornecida
    const uniqueTag = payload.tag || `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Normaliza URL (aceita tanto url quanto link)
    const finalPayload = {
      ...payload,
      url: payload.url || payload.link || '/',
      tag: uniqueTag, // Tag única para cada notificação
    };

    console.log('📤 Enviando notificação:', {
      endpoint: subscription.endpoint.substring(0, 50) + '...',
      title: finalPayload.title,
      tag: uniqueTag
    });

    const result = await webpush.sendNotification(
      subscription as any,
      JSON.stringify(finalPayload),
      {
        TTL: 60 * 60 * 24, // 24 horas
        urgency: 'high', // Prioridade alta
      }
    );
    
    console.log('✅ Notificação enviada com sucesso');
    return { success: true };
  } catch (error: any) {
    console.error('❌ Erro ao enviar notificação:', error);
    
    // Detecta se o subscription é inválido
    const isInvalid = 
      error.statusCode === 410 || 
      error.statusCode === 404 ||
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
