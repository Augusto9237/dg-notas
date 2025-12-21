import { prisma } from '@/lib/prisma';

export interface QueuedNotification {
  id: string;
  userId: string;
  title: string;
  body: string;
  icon?: string | null;
  badge?: string | null;
  url?: string | null;
  tag?: string | null;
  delivered: boolean;
  createdAt: Date;
}

/**
 * Adiciona uma notificação à fila para polling (Edge fallback)
 */
export async function queueNotificationForPolling(
  userId: string,
  notification: {
    title: string;
    body: string;
    icon?: string;
    badge?: string;
    url?: string;
    tag?: string;
  }
): Promise<void> {
  try {
    await prisma.notificationQueue.create({
      data: {
        userId,
        title: notification.title,
        body: notification.body,
        icon: notification.icon,
        badge: notification.badge,
        url: notification.url || '/',
        tag: notification.tag,
        delivered: false,
      },
    });
    console.log('📥 Notificação adicionada à fila para polling');
  } catch (error) {
    console.error('❌ Erro ao adicionar notificação à fila:', error);
    throw error;
  }
}

/**
 * Busca notificações não entregues para um usuário
 */
export async function getPendingNotifications(
  userId: string,
  maxAge: number = 60000 // 60 segundos por padrão
): Promise<QueuedNotification[]> {
  const cutoffTime = new Date(Date.now() - maxAge);

  const notifications = await prisma.notificationQueue.findMany({
    where: {
      userId,
      delivered: false,
      createdAt: { gte: cutoffTime },
    },
    orderBy: { createdAt: 'desc' },
  });

  return notifications;
}

/**
 * Marca notificações como entregues
 */
export async function markNotificationsAsDelivered(
  notificationIds: string[]
): Promise<void> {
  if (notificationIds.length === 0) return;

  await prisma.notificationQueue.updateMany({
    where: { id: { in: notificationIds } },
    data: { delivered: true },
  });

  console.log(`✅ ${notificationIds.length} notificação(ões) marcada(s) como entregue(s)`);
}

/**
 * Limpa notificações antigas (já entregues ou muito antigas)
 */
export async function cleanupOldNotifications(
  maxAge: number = 3600000 // 1 hora por padrão
): Promise<number> {
  const cutoffTime = new Date(Date.now() - maxAge);

  const result = await prisma.notificationQueue.deleteMany({
    where: {
      OR: [
        { delivered: true },
        { createdAt: { lt: cutoffTime } },
      ],
    },
  });

  console.log(`🧹 ${result.count} notificação(ões) antiga(s) removida(s)`);
  return result.count;
}
