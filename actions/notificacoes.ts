"use server";
import { prisma } from "@/lib/prisma";
import { sendWebPushNotifications } from "@/lib/webpush";
import type { PushSubscriptionData, NotificationPayload } from "@/lib/webpush";

/**
 * Salva ou atualiza uma subscription Web Push para um usuário
 */
export async function salvarPushSubscription(
  userId: string,
  subscription: PushSubscriptionData,
  deviceInfo?: string,
): Promise<void> {
  try {
    await prisma.pushSubscription.upsert({
      where: {
        userId_endpoint: {
          userId: userId,
          endpoint: subscription.endpoint,
        },
      },
      update: {
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        deviceInfo: deviceInfo,
        updatedAt: new Date(),
      },
      create: {
        userId: userId,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        deviceInfo: deviceInfo,
      },
    });
  } catch (error) {
    console.error("❌ Erro ao salvar subscription:", error);
    throw new Error("Falha ao salvar subscription");
  }
}

/**
 * Remove uma subscription específica
 */
export async function removerPushSubscription(endpoint: string): Promise<void> {
  try {
    await prisma.pushSubscription.deleteMany({
      where: { endpoint },
    });
  } catch (error) {
    console.error("❌ Erro ao remover subscription:", error);
  }
}

/**
 * Busca subscriptions por role do usuário
 */
export async function buscarSubscriptionsPorRole(
  role: string,
): Promise<PushSubscriptionData[]> {
  try {
    const subs = await prisma.pushSubscription.findMany({
      where: {
        user: { role },
      },
      select: {
        endpoint: true,
        p256dh: true,
        auth: true,
      },
    });

    return subs.map((sub) => ({
      endpoint: sub.endpoint,
      keys: {
        p256dh: sub.p256dh,
        auth: sub.auth,
      },
    }));
  } catch (error) {
    console.error("❌ Erro ao buscar subscriptions por role:", error);
    return [];
  }
}

/**
 * Busca subscriptions de um usuário específico
 */
export async function buscarSubscriptionsPorUsuario(
  userId: string,
): Promise<PushSubscriptionData[]> {
  try {
    const subs = await prisma.pushSubscription.findMany({
      where: { userId },
      select: {
        endpoint: true,
        p256dh: true,
        auth: true,
      },
    });

    return subs.map((sub) => ({
      endpoint: sub.endpoint,
      keys: {
        p256dh: sub.p256dh,
        auth: sub.auth,
      },
    }));
  } catch (error) {
    console.error("❌ Erro ao buscar subscriptions por usuário:", error);
    return [];
  }
}

/**
 * Envia notificações para todos os usuários de um role
 */
export async function enviarNotificacaoParaTodos(
  role: string,
  title: string,
  message: string,
  link?: string,
) {
  try {
    const subscriptions = await buscarSubscriptionsPorRole(role);

    if (subscriptions.length === 0) {
      return { successCount: 0, failureCount: 0, totalSubscriptions: 0 };
    }

    const payload: NotificationPayload = {
      title,
      body: message,
      url: link,
      icon: "/Símbolo1.png",
      badge: "/Símbolo1.png",
    };

    const result = await sendWebPushNotifications(subscriptions, payload);

    // Remove subscriptions inválidas
    if (result.invalidEndpoints && result.invalidEndpoints.length > 0) {
      await prisma.pushSubscription.deleteMany({
        where: {
          endpoint: { in: result.invalidEndpoints },
        },
      });
    }

    return {
      successCount: result.successCount,
      failureCount: result.failureCount,
      totalSubscriptions: result.totalSubscriptions,
    };
  } catch (error) {
    console.error("❌ Erro ao enviar notificações:", error);
    throw new Error("Falha ao enviar notificações");
  }
}

/**
 * Envia notificações para um usuário específico
 */
export async function enviarNotificacaoParaUsuario(
  userId: string,
  title: string,
  message: string,
  link?: string,
) {
  try {
    const subscriptions = await buscarSubscriptionsPorUsuario(userId);

    if (subscriptions.length === 0) {
      return { successCount: 0, failureCount: 0, totalSubscriptions: 0 };
    }

    const payload: NotificationPayload = {
      title,
      body: message,
      url: link,
      icon: "/Símbolo1.png",
      badge: "/Símbolo1.png",
    };

    const result = await sendWebPushNotifications(subscriptions, payload);

    // Remove subscriptions inválidas
    if (result.invalidEndpoints && result.invalidEndpoints.length > 0) {
      await prisma.pushSubscription.deleteMany({
        where: {
          endpoint: { in: result.invalidEndpoints },
        },
      });
    }

    return {
      successCount: result.successCount,
      failureCount: result.failureCount,
      totalSubscriptions: result.totalSubscriptions,
    };
  } catch (error) {
    console.error("❌ Erro ao enviar notificações para usuário:", error);
    throw new Error("Falha ao enviar notificações");
  }
}

/**
 * Limpa subscriptions antigas (>90 dias)
 */
export async function limparSubscriptionsAntigas(): Promise<number> {
  try {
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setDate(threeMonthsAgo.getDate() - 90);

    const result = await prisma.pushSubscription.deleteMany({
      where: {
        updatedAt: { lt: threeMonthsAgo },
      },
    });

    return result.count;
  } catch (error) {
    console.error("❌ Erro ao limpar subscriptions antigas:", error);
    return 0;
  }
}
