
import { NextRequest, NextResponse } from 'next/server';
import { sendWebPushNotifications } from '@/lib/webpush';
import type { PushSubscriptionData, NotificationPayload } from '@/lib/webpush';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { subscriptions, payload } = body as {
      subscriptions: PushSubscriptionData[];
      payload: NotificationPayload;
    };

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Nenhuma subscription fornecida' },
        { status: 400 }
      );
    }

    const result = await sendWebPushNotifications(subscriptions, payload);

    return NextResponse.json(result);
  } catch (error) {
    console.error('❌ Erro na API:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao processar requisição' },
      { status: 500 }
    );
  }
}