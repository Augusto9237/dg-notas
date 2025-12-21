import { NextRequest, NextResponse } from 'next/server';
import { salvarPushSubscription } from '@/actions/notificacoes';

export async function POST(req: NextRequest) {
  try {
    const { userId, subscription } = await req.json();

    if (!userId || !subscription) {
      return NextResponse.json({ error: 'userId and subscription required' }, { status: 400 });
    }

    await salvarPushSubscription(userId, subscription, navigator?.userAgent || 'Unknown');

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('❌ Erro ao salvar subscription:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
