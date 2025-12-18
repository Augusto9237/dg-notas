
import webpush from "web-push";

// Configurar VAPID
webpush.setVapidDetails(
  `mailto:${process.env.VAPID_EMAIL}`,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
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
  tag?: string;
  actions?: Array<{
    action: string;
    title: string;
  }>;
}

export async function sendWebPushNotification(
  subscription: PushSubscriptionData,
  payload: NotificationPayload,
) {
  try {
    // Normaliza URL (aceita tanto url quanto link)
    const finalPayload = {
      ...payload,
      url: payload.url || payload.link || "/",
    };

    await webpush.sendNotification(
      subscription as webpush.PushSubscription,
      JSON.stringify(finalPayload),
    );

    return { success: true };
  } catch (error) {
    console.error("❌ Erro ao enviar notificação:", error);

    const err = error as {
      statusCode?: number;
      body?: string;
      message?: string;
    };

    // Detecta se o subscription é inválido
    const isInvalid =
      err.statusCode === 410 ||
      err.statusCode === 404 ||
      err.body?.includes("expired") ||
      err.body?.includes("invalid");

    return {
      success: false,
      error: err.message || "Unknown error",
      isInvalid,
    };
  }
}

export async function sendWebPushNotifications(
  subscriptions: PushSubscriptionData[],
  payload: NotificationPayload,
) {
  const results = await Promise.allSettled(
    subscriptions.map((sub) => sendWebPushNotification(sub, payload)),
  );

  const invalidEndpoints: string[] = [];
  let successCount = 0;
  let failureCount = 0;

  results.forEach((result, index) => {
    if (result.status === "fulfilled" && result.value.success) {
      successCount++;
    } else {
      failureCount++;
      if (result.status === "fulfilled" && result.value.isInvalid) {
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
