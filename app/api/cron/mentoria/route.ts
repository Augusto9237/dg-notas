
import { notificarAlunosMentoriaAgendada } from '@/actions/mentoria';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await notificarAlunosMentoriaAgendada();
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Unknown error' }, { status: 500 });
  }
}
