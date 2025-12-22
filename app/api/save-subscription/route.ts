import { NextRequest, NextResponse } from 'next/server';
import { salvarPushSubscription } from '@/actions/notificacoes';

export async function POST(req: NextRequest) {
  try {
    const { userId, subscription } = await req.json();

    if (!userId || !subscription) {
      return NextResponse.json({ error: 'userId and subscription required' }, { status: 400 });
    }

    const userAgent = req.headers.get('user-agent') || 'Unknown';
    await salvarPushSubscription(userId, subscription, userAgent);

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('❌ Erro ao salvar subscription:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
