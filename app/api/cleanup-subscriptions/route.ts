import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendWebPushNotification } from '@/lib/webpush';

export async function POST(req: NextRequest) {
  try {
    console.log('🧹 Iniciando limpeza de subscriptions...');

    // Busca todas as subscriptions
    const allSubscriptions = await prisma.pushSubscription.findMany({
      select: {
        id: true,
        endpoint: true,
        p256dh: true,
        auth: true,
        userId: true,
      },
    });

    console.log(`📊 Total de subscriptions: ${allSubscriptions.length}`);

    const invalidEndpoints: string[] = [];
    const testPayload = {
      title: '🧹 Teste de Limpeza',
      body: 'Verificando subscriptions...',
      icon: '/Símbolo1.png',
      requireInteraction: false,
    };

    // Testa cada subscription
    for (const sub of allSubscriptions) {
      const subscription = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth,
        },
      };

      const result = await sendWebPushNotification(subscription, testPayload);

      if (!result.success && result.isInvalid) {
        console.log(`❌ Subscription inválida: ${sub.endpoint.substring(0, 50)}...`);
        invalidEndpoints.push(sub.endpoint);
      } else if (result.success) {
        console.log(`✅ Subscription válida: ${sub.endpoint.substring(0, 50)}...`);
      }
    }

    // Remove subscriptions inválidas
    if (invalidEndpoints.length > 0) {
      const deleted = await prisma.pushSubscription.deleteMany({
        where: {
          endpoint: { in: invalidEndpoints },
        },
      });

      console.log(`🗑️ ${deleted.count} subscription(s) inválida(s) removida(s)`);
    } else {
      console.log('✅ Nenhuma subscription inválida encontrada');
    }

    return NextResponse.json({
      success: true,
      totalChecked: allSubscriptions.length,
      invalidFound: invalidEndpoints.length,
      removed: invalidEndpoints.length,
      message: `Limpeza concluída: ${invalidEndpoints.length} subscription(s) removida(s)`,
    });
  } catch (error: any) {
    console.error('❌ Erro na limpeza:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
