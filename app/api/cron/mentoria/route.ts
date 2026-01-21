// app/api/notificacoes/mentorias/route.ts

import { notificarAlunosMentoriaAgendada } from '@/actions/mentoria';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Validar token de segurança
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');
  
  if (token !== process.env.CRON_SECRET) {
    return NextResponse.json(
      { error: 'Unauthorized' }, 
      { status: 401 }
    );
  }

  try {
    const resultado = await notificarAlunosMentoriaAgendada();
    return NextResponse.json(resultado);
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message }, 
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: 'Unknown error' }, 
      { status: 500 }
    );
  }
}