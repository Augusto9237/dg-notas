
import { ListarAvaliacoesAlunoId, ListarCriterios, ListarTemasDisponiveis } from '@/actions/avaliacao';
import { TabelaAvaliacoesAluno } from '@/components/tabela-avaliacoes-aluno';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';



export default async function Page() {
  const session = await auth.api.getSession({
    headers: await headers() // you need to pass the headers object.
  })

  if (session?.user) {

    const [criterios,] = await Promise.all([
      ListarCriterios(),
    ])

    return (
      <div className="w-full">
        <main className="flex flex-col gap-4 p-5 pb-20">
          <div className="flex items-center justify-between">
            <h2 className="text-primary font-semibold">Suas Avaliações</h2>
          </div>

          <TabelaAvaliacoesAluno criterios={criterios} />
        </main>
      </div>
    );
  }
}