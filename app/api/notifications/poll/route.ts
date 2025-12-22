import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { getPendingNotifications, markNotificationsAsDelivered } from '@/lib/notification-queue';

/**
 * API de polling para Edge/Safari
 * Permite que navegadores que não recebem push events busquem notificações pendentes
 */
export async function GET(_req: NextRequest) {
  try {
    // Autentica o usuário
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Busca notificações pendentes (últimos 60 segundos)
    const notifications = await getPendingNotifications(userId, 60000);

    // Marca como entregues
    if (notifications.length > 0) {
      const notificationIds = notifications.map(n => n.id);
      await markNotificationsAsDelivered(notificationIds);
      
      console.log(`📬 ${notifications.length} notificação(ões) entregue(s) via polling para ${userId}`);
    }

    return NextResponse.json({
      success: true,
      count: notifications.length,
      notifications: notifications.map(n => ({
        title: n.title,
        body: n.body,
        icon: n.icon,
        badge: n.badge,
        url: n.url,
        tag: n.tag,
        timestamp: n.createdAt.getTime()
      }))
    });
  } catch (error: unknown) {
    console.error('❌ Erro no polling de notificações:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
