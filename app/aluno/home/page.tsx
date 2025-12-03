import { ListarAvaliacoesAlunoId, ListarCriterios, ListarTemasDisponiveis } from '@/actions/avaliacao';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { CardCompetencia } from '@/components/card-competencias';
import Header from '@/components/ui/header';


export default async function Page() {
  const session = await auth.api.getSession({
    headers: await headers() // you need to pass the headers object.
  })

  // if (session?.user) {

  const avaliacoes = await ListarAvaliacoesAlunoId('k8gK5fOMkhP7nkyUjkzo278B6Np4Usjs')
  const criterios = await ListarCriterios()

  const pontuacoesPorCriterio = avaliacoes
    .flatMap(avaliacao => avaliacao.criterios)
    .reduce((acc, criterio) => {
      if (!acc[criterio.criterioId]) {
        acc[criterio.criterioId] = [];
      }
      acc[criterio.criterioId].push(criterio.pontuacao);
      return acc;
    }, {} as Record<number, number[]>);

  const mediasPorCriterio = Object.entries(pontuacoesPorCriterio).map(([criterioId, pontuacoes]) => ({
    criterioId: Number(criterioId),
    media: pontuacoes.reduce((sum, current) => sum + current, 0) / pontuacoes.length,
  }));


  return (
    <div className="w-full">
      <Header />
      <main className="flex flex-col gap-4 p-5 pb-20">
        <div className="flex items-center justify-between">
          <h2 className="text-primary font-semibold">Suas Habilidades</h2>
        </div>

        <div className='space-y-4'>
          {mediasPorCriterio.map((criterio, i) => (
            <CardCompetencia key={i} criterio={criterio} criterios={criterios} />
          ))}
        </div>
      </main>
    </div>
  );
}
// }