
import { ListarAvaliacoesAlunoId, listarTemasDisponiveis } from '@/actions/avaliacao';
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

  const avaliacoes = await ListarAvaliacoesAlunoId(userId);
  const temas = await listarTemasDisponiveis(userId);

  return (
    <Suspense fallback={<Loading />}>
      <div className="w-full h-full max-h-screen min-h-screen overflow-hidden">
        <main className="flex flex-col gap-4 p-5 h-full">
          <div className="flex items-center justify-between">
            <h2 className="text-primary font-semibold">Suas Avaliações</h2>
          </div>

          <TabelaAvaliacoesAluno avaliacoesIniciais={avaliacoes} temasIniciais={temas} />
        </main>
      </div>
    </Suspense>
  );
}