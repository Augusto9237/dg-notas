import { ListarAvaliacoesAlunoId, ListarCriterios } from '@/actions/avaliacao';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { CardCompetencia } from '@/components/card-competencias';
import Header from '@/components/ui/header';
import { redirect } from 'next/navigation';

export default async function Page() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user) {
    redirect('/');
  }

  const avaliacoes = await ListarAvaliacoesAlunoId(session.user.id);
  const criterios = await ListarCriterios();


  function calcularMediasPorCriterio(avaliacoes: Awaited<ReturnType<typeof ListarAvaliacoesAlunoId>>) {
    const pontuacoesPorCriterio = avaliacoes
      .flatMap(avaliacao => avaliacao.criterios)
      .reduce((acc, criterio) => {
        if (!acc[criterio.criterioId]) {
          acc[criterio.criterioId] = [];
        }
        acc[criterio.criterioId].push(criterio.pontuacao);
        return acc;
      }, {} as Record<number, number[]>);

    return Object.entries(pontuacoesPorCriterio).map(([criterioId, pontuacoes]) => ({
      criterioId: Number(criterioId),
      media: pontuacoes.reduce((sum, current) => sum + current, 0) / pontuacoes.length,
    }));
  }

  const mediasPorCriterio = calcularMediasPorCriterio(avaliacoes);

  return (
    <div className="w-full h-full max-h-screen overflow-hidden">
      <Header />
      <main className="flex flex-col gap-4 p-5 h-full max-h-[calc(100vh-156px)] overflow-hidden">
        <div className="flex items-center justify-between">
          <h2 className="text-primary font-semibold">Suas Habilidades</h2>
        </div>

        <div className='space-y-4 h-full overflow-y-auto pb-14 scrollbar-thin scrollbar-thumb-card scrollbar-track-background'>
          {mediasPorCriterio.map((criterio, i) => (
            <CardCompetencia key={i} criterio={criterio} criterios={criterios} />
          ))}
        </div>
      </main>
    </div>
  );
}
