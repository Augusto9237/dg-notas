import { NextRequest, NextResponse } from 'next/server';
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
    });

    console.log(`🔍 Subscriptions para usuário ${userId}:`);
    subscriptions.forEach((sub, i) => {
      const isWNS = sub.endpoint.includes('notify.windows.com');
      console.log(`  [${i}] ${isWNS ? '🪟 WNS (Edge)' : '🌐 Outro'}`);
      console.log(`      Endpoint: ${sub.endpoint.substring(0, 80)}...`);
      console.log(`      Criado: ${sub.createdAt}`);
      console.log(`      Atualizado: ${sub.updatedAt}`);
      console.log(`      Device: ${sub.deviceInfo?.substring(0, 50)}...`);
    });

    return NextResponse.json({
      userId,
      totalSubscriptions: subscriptions.length,
      subscriptions: subscriptions.map(sub => ({
        endpoint: sub.endpoint.substring(0, 80) + '...',
        isWNS: sub.endpoint.includes('notify.windows.com'),
        createdAt: sub.createdAt,
        updatedAt: sub.updatedAt,
        deviceInfo: sub.deviceInfo?.substring(0, 50)
      }))
    });
  } catch (error: any) {
    console.error('❌ Erro ao verificar subscriptions:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
