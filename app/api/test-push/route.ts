import { NextRequest, NextResponse } from 'next/server';
import { sendWebPushNotification } from '@/lib/webpush';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 });
    }

    // Busca todas as subscriptions do usuário
    const subscriptions = await prisma.pushSubscription.findMany({
      where: { userId },
      select: {
        endpoint: true,
        p256dh: true,
        auth: true,
      },
    });

    if (subscriptions.length === 0) {
      return NextResponse.json({ error: 'No subscriptions found' }, { status: 404 });
    }

    console.log(`🧪 Teste: Enviando para ${subscriptions.length} subscription(s)`);

    // Payload de teste simples
    const testPayload = {
      title: '🧪 Teste Edge',
      body: 'Se você vê isso, o push está funcionando!',
      icon: '/Símbolo1.png',
      badge: '/Símbolo1.png',
      requireInteraction: true,
    };

    const results = [];
    const invalidEndpoints = [];
    
    for (const sub of subscriptions) {
      const subscription = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth,
        },
      };

      const result = await sendWebPushNotification(subscription, testPayload);
      results.push({
        endpoint: sub.endpoint.substring(0, 50) + '...',
        success: result.success,
        error: result.error,
      });

      // Marca endpoints inválidos para remoção
      if (!result.success && result.isInvalid) {
        invalidEndpoints.push(sub.endpoint);
      }
    }

    // Remove subscriptions inválidas
    if (invalidEndpoints.length > 0) {
      console.log(`🗑️ Removendo ${invalidEndpoints.length} subscription(s) inválida(s)`);
      await prisma.pushSubscription.deleteMany({
        where: {
          endpoint: { in: invalidEndpoints },
        },
      });
    }

    return NextResponse.json({
      message: 'Test notifications sent',
      results,
      invalidEndpoints,
      cleanedUp: invalidEndpoints.length,
    });
  } catch (error: any) {
    console.error('❌ Erro no teste:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
