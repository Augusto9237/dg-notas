import { ListarAvaliacoesAlunoId, ListarCriterios } from '@/actions/avaliacao';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import Header, { HeaderSkeleton } from '@/components/ui/header';
import { redirect } from 'next/navigation';
import { ListaCompetenciasAluno, ListaCompetenciasAlunoSkeleton } from '@/components/lista-competencias-aluno';
import { DesempenhoAlunoGrafico, DesempenhoAlunoGraficoSkeleton } from '@/components/desempenho-aluno-grafico';
import { listarMentoriasAluno } from '@/actions/mentoria';
import { Suspense } from 'react';

export default async function Page() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user) {
    redirect('/');
  }

  const user = session.user

  const criterios = await ListarCriterios();
  const avaliacoes = await ListarAvaliacoesAlunoId(user.id)
  const mentorias = (await listarMentoriasAluno(user.id)).meta.total


  return (
    <div className="w-full h-full max-h-screen overflow-hidden">
      <Suspense fallback={<HeaderSkeleton />}>
        <Header avaliacoes={avaliacoes} mentorias={mentorias} user={user} />
      </Suspense>
      <main className="sm:grid sm:grid-cols-2 flex flex-col  py-5 flex-1 overflow-hidden h-full max-h-[calc(100vh-156px)]">
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
