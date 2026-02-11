
import { excluirMentoriaECascata } from '@/actions/mentoria';
import { enviarNotificacaoParaUsuario } from '@/actions/notificacoes';
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
      const resposta = await prisma.mentoria.findUnique({
        where: { id: mentoria.id },
        select: { horarioId: true, aluno: true },
      });

      if (!resposta) {
        console.error('Mentoria não encontrada para exclusão.');
        return false;
      }

      const countMentorias = await prisma.mentoria.count({
        where: { horarioId: resposta.horarioId },
      });

      await prisma.mentoria.delete({
        where: { id: mentoria.id },
      });

      if (countMentorias === 1) {
        await prisma.horario.delete({
          where: { id: resposta.horarioId },
        });
      }

      await enviarNotificacaoParaUsuario(
        resposta.aluno.id,
        'Mentoria cancelada ❌',
        `Olá, ${resposta.aluno.name}! \nSua mentoria foi cancelada por falta de confirmação.\nFique tranquilo(a), você pode agendar uma nova mentoria.`,
        '/aluno/mentorias'
      );


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
