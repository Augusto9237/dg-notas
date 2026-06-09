import { ListarAvaliacoesAlunoId, ListarCriterios } from '@/actions/avaliacao';
import Header, { HeaderSkeleton } from '@/components/ui/header';
import { redirect } from 'next/navigation';
import { ListaCompetenciasAlunoSkeleton } from '@/components/lista-competencias-aluno';
import { DesempenhoAlunoGraficoSkeleton } from '@/components/desempenho-aluno-grafico';
import { listarMentoriasAluno } from '@/actions/mentoria';
import { Suspense } from 'react';
import { getSessionCached } from '@/lib/session';
import dynamic from 'next/dynamic';

const ListaCompetenciasAluno = dynamic(() => import('@/components/lista-competencias-aluno'))
const DesempenhoAlunoGrafico = dynamic(() => import('@/components/desempenho-aluno-grafico'))

export default async function Page() {
  const session = await getSessionCached()

  if (!session?.user) {
    redirect('/');
  }

  const user = session.user

  const [criterios, avaliacoes, mentorias] = await Promise.all([
    ListarCriterios(),
    ListarAvaliacoesAlunoId(user.id),
    listarMentoriasAluno(user.id)
  ]);


  return (
    <div className="w-full h-full max-h-screen overflow-hidden">
      <Suspense fallback={<HeaderSkeleton />}>
        <Header avaliacoes={avaliacoes} mentorias={mentorias.meta.total} user={user} />
      </Suspense>
      <main className="sm:grid sm:grid-cols-2 flex flex-col  py-5 pb-10 flex-1 overflow-hidden h-full max-h-[calc(100dvh-156px)]">
        <div className="flex flex-col gap-4 sm:p-5">
          <h2 className="text-primary font-semibold max-sm:px-5">Suas Habilidades</h2>

          <Suspense fallback={<ListaCompetenciasAlunoSkeleton />}>
            <ListaCompetenciasAluno avaliacoes={avaliacoes.data} criterios={criterios} />
          </Suspense>

        </div>
        <Suspense fallback={<DesempenhoAlunoGraficoSkeleton />}>
          <DesempenhoAlunoGrafico avaliacoes={avaliacoes.data} userId={user.id} />
        </Suspense>
      </main>
    </div>
  );
}
