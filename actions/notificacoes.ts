'use server'
import { Prisma } from "@/app/generated/prisma";
import { prisma } from "@/lib/prisma";
import { sendWebPushNotifications } from "@/lib/webpush";
import type { PushSubscriptionData, NotificationPayload } from "@/lib/webpush";


/**
 * Salva ou atualiza uma subscription Web Push para um usuário
 * @param userId - ID do usuário
 * @param subscription - Dados da subscription Web Push
 * @param deviceInfo - Informações opcionais do dispositivo (navegador, SO, etc)
 * @throws {Error} Se houver erro na operação com o banco de dados
 */
export async function salvarPushSubscription(
  userId: string,
  subscription: PushSubscriptionData,
  deviceInfo?: string
): Promise<void> {
  // Validação de entrada
  if (!userId || !subscription?.endpoint || !subscription?.keys) {
    throw new Error('Parâmetros inválidos: userId e subscription são obrigatórios');
  }

  try {
    // Usa upsert para simplificar lógica (create ou update em uma operação)
    await prisma.pushSubscription.upsert({
      where: { endpoint: subscription.endpoint },
      update: {
        userId,
        deviceInfo,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        updatedAt: new Date(),
      },
      create: {
        userId,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        deviceInfo,
      },
    });
  } catch (error) {
    // Log mais detalhado do erro
    console.error('❌ Erro ao salvar subscription:', {
      userId,
      endpoint: subscription.endpoint,
      error: error instanceof Error ? error.message : error,
    });

    // Tratamento específico para erros conhecidos
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new Error('Subscription duplicada');
      }
      if (error.code === 'P2025') {
        throw new Error('Registro não encontrado');
      }
    }

    throw new Error(
      `Falha ao salvar subscription: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
    );
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
    console.error('❌ Erro ao remover subscription:', error);
  }
}

/**
 * Busca subscriptions por role do usuário
 */
export async function buscarSubscriptionsPorRole(role: string): Promise<(PushSubscriptionData & { userId: string })[]> {
  try {
    const subs = await prisma.pushSubscription.findMany({
      where: {
        user: { role },
      },
      select: {
        endpoint: true,
        p256dh: true,
        auth: true,
        userId: true,
      },
    });

    return subs.map(sub => ({
      endpoint: sub.endpoint,
      keys: {
        p256dh: sub.p256dh,
        auth: sub.auth,
      },
      userId: sub.userId,
    }));
  } catch (error) {
    console.error('❌ Erro ao buscar subscriptions por role:', error);
    return [];
  }
}

/**
 * Busca subscriptions de um usuário específico
 */
export async function buscarSubscriptionsPorUsuario(userId: string): Promise<(PushSubscriptionData & { userId: string })[]> {
  try {
    const subs = await prisma.pushSubscription.findMany({
      where: { userId },
      select: {
        endpoint: true,
        p256dh: true,
        auth: true,
        userId: true,
      },
    });

    return subs.map(sub => ({
      endpoint: sub.endpoint,
      keys: {
        p256dh: sub.p256dh,
        auth: sub.auth,
      },
      userId: sub.userId,
    }));
  } catch (error) {
    console.error('❌ Erro ao buscar subscriptions por usuário:', error);
    return [];
  }
}

export async function enviarNotificacaoParaTodos(
  role: string,
  title: string,
  message: string,
  link?: string
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
      icon: '/Símbolo1.png',
      badge: '/Símbolo1.png',
      
      // CRÍTICO: Força notificação aparecer no Edge
      requireInteraction: true,
      
      // Configurações adicionais para melhor visibilidade
      vibrate: [300, 100, 300],
      silent: false,
      renotify: true,
    };

    console.log('📤 Enviando notificações para', subscriptions.length, 'usuários');
    console.log('📋 Payload:', { title, body: message, requireInteraction: true });

    const result = await sendWebPushNotifications(subscriptions, payload);

    console.log('✅ Resultado do envio:', result);

    // Remove subscriptions inválidas
    if (result.invalidEndpoints && result.invalidEndpoints.length > 0) {
      console.log('🗑️ Removendo', result.invalidEndpoints.length, 'subscriptions inválidas');
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
    console.error('❌ Erro ao enviar notificações:', error);
    throw new Error('Falha ao enviar notificações');
  }
}

// Função específica para enviar para um usuário
export async function enviarNotificacaoParaUsuario(
  userId: string,
  title: string,
  message: string,
  link?: string
) {
  try {
    const subscriptions = await buscarSubscriptionsPorUsuario(userId);

    if (subscriptions.length === 0) {
      console.log('⚠️ Usuário não tem subscriptions ativas');
      return { successCount: 0, failureCount: 0, totalSubscriptions: 0 };
    }

    const payload: NotificationPayload = {
      title,
      body: message,
      url: link,
      icon: '/Símbolo1.png',
      badge: '/Símbolo1.png',
      requireInteraction: true, // CRÍTICO
      vibrate: [300, 100, 300],
      silent: false,
      renotify: true,
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
    console.error('❌ Erro ao enviar notificações para usuário:', error);
    throw new Error('Falha ao enviar notificações');
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
    console.error('❌ Erro ao limpar subscriptions antigas:', error);
    return 0;
  }
}
