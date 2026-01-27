
import { excluirMentoriaECascata } from '@/actions/mentoria';
import { prisma } from '@/lib/prisma';
import { fromZonedTime, toZonedTime } from 'date-fns-tz';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');

  if (token !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const timeZone = 'America/Sao_Paulo';
  const agora = toZonedTime(new Date(), timeZone);
  const hoje = new Date(agora);
  hoje.setHours(0, 0, 0, 0);

  const hojeUTC = fromZonedTime(hoje, timeZone);
  const amanha = new Date(hoje);
  amanha.setDate(hoje.getDate() + 1);
  const amanhaUTC = fromZonedTime(amanha, timeZone);

  try {
    const mentoriasParaExcluir = await prisma.mentoria.findMany({
      where: {
        status: 'AGENDADA',
        horario: {
          data: {
            gte: hojeUTC,
            lt: amanhaUTC,
          },
        },
      },
      select: {
        id: true,
      },
    });

    if (mentoriasParaExcluir.length === 0) {
      return NextResponse.json({
        message: 'Nenhuma mentoria agendada para hoje para excluir.',
      });
    }

    for (const mentoria of mentoriasParaExcluir) {
      await excluirMentoriaECascata(mentoria.id);
    }

    return NextResponse.json({
      message: `${mentoriasParaExcluir.length} mentorias foram excluídas.`,
    });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Unknown error' }, { status: 500 });
  }
}
