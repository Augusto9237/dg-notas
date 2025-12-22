import { NextRequest, NextResponse } from 'next/server';
import { sendWebPushNotifications } from '@/lib/webpush';
import type { PushSubscriptionData, NotificationPayload } from '@/lib/webpush';

export async function POST(request: NextRequest) {
  console.log('🔔 API /api/notificacoes chamada');
  
  try {
    // Parse do body
    let body;
    try {
      body = await request.json();
      console.log('📦 Body recebido:', JSON.stringify(body).substring(0, 200));
    } catch (parseError) {
      console.error('❌ Erro ao fazer parse do body:', parseError);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Body inválido - não é JSON válido',
          details: parseError instanceof Error ? parseError.message : 'Unknown error'
        },
        { status: 400 }
      );
    }

    const { subscriptions, payload } = body as {
      subscriptions: PushSubscriptionData[];
      payload: NotificationPayload;
    };

    // Validações
    if (!subscriptions || !Array.isArray(subscriptions)) {
      console.error('❌ Subscriptions inválidas:', typeof subscriptions);
      return NextResponse.json(
        { success: false, error: 'Campo "subscriptions" deve ser um array' },
        { status: 400 }
      );
    }

    if (subscriptions.length === 0) {
      console.log('⚠️ Nenhuma subscription fornecida');
      return NextResponse.json(
        { success: false, error: 'Nenhuma subscription fornecida' },
        { status: 400 }
      );
    }

    if (!payload || !payload.title) {
      console.error('❌ Payload inválido:', payload);
      return NextResponse.json(
        { success: false, error: 'Payload deve conter ao menos um "title"' },
        { status: 400 }
      );
    }

    console.log(`📤 Enviando para ${subscriptions.length} subscription(s)`);
    console.log(`📋 Título: ${payload.title}`);

    // Envia as notificações
    const result = await sendWebPushNotifications(subscriptions, payload);

    console.log('✅ Resultado:', result);

    return NextResponse.json(result, { 
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      }
    });

  } catch (error) {
    console.error('❌ Erro na API /api/notificacoes:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro ao processar requisição',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
        stack: process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

// Adicione suporte a OPTIONS para CORS (se necessário)
export async function OPTIONS(_request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}