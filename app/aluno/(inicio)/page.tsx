import { ListarAvaliacoesAlunoId, ListarCriterios } from '@/actions/avaliacao';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { CardCompetencia } from '@/components/card-competencias';
import Header from '@/components/ui/header';
import { redirect } from 'next/navigation';
import { ListaCompetenciasAluno } from '@/components/lista-competencias-aluno';

export default async function Page() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user) {
    redirect('/');
  }

  const criterios = await ListarCriterios();


  return (
    <div className="w-full h-full max-h-screen overflow-hidden">
      <Header />
      <main className="flex flex-col gap-4 p-5 h-full max-h-[calc(100vh-156px)] overflow-hidden">
        <div className="flex items-center justify-between">
          <h2 className="text-primary font-semibold">Suas Habilidades</h2>
        </div>

        <ListaCompetenciasAluno criterios={criterios} />
      </main>
    </div>
  );
}
