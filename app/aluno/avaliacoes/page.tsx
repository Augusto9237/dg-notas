
import { ListarAvaliacoesAlunoId, ListarCriterios, listarTemasDisponiveis } from '@/actions/avaliacao';
import { TabelaAvaliacoesAluno } from '@/components/tabela-avaliacoes-aluno';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import Loading from './loading';

export default async function Page() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user) {
    redirect('/');
  }

  if (session.user.role !== 'user') {
    await auth.api.signOut({
      headers: await headers()
    });
    redirect('/');
  }

  const userId = session.user.id;

  const [avaliacoes, temas, criterios] = await Promise.all([
    ListarAvaliacoesAlunoId(userId),
    listarTemasDisponiveis(userId),
    ListarCriterios(),
  ]);


  return (
    <div className="w-full h-full max-h-screen min-h-screen overflow-hidden bg-linear-to-b from-primary/15 via-primary/5 to-transparent">
      <main className="flex flex-col gap-4 p-5 h-full">
        <div className="flex flex-col">
          <h2 className="text-primary dark:text-primary-foreground font-semibold">Suas Avaliações</h2>
          <p className='text-primary dark:text-primary-foreground text-xs'>Acompanhe as suas avaliações</p>
        </div>

        <TabelaAvaliacoesAluno avaliacoesIniciais={avaliacoes} temasIniciais={temas} criterios={criterios} userId={userId} />
      </main>
    </div>
  );
}