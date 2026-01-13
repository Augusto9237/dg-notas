import { ListarCriterios } from '@/actions/avaliacao';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import Header from '@/components/ui/header';
import { redirect } from 'next/navigation';
import { ListaCompetenciasAluno } from '@/components/lista-competencias-aluno';
import { DesempenhoAlunoGrafico } from '@/components/desempenho-aluno-grafico';

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
      <main className="sm:grid sm:grid-cols-2 flex flex-col  py-5 flex-1 overflow-hidden h-full max-h-[calc(100vh-156px)]">
        <div className="flex flex-col gap-4 sm:p-5">
          <h2 className="text-primary font-semibold max-sm:px-5">Suas Habilidades</h2>
          <ListaCompetenciasAluno criterios={criterios} />
        </div>
        <DesempenhoAlunoGrafico />
      </main>
    </div>
  );
}
