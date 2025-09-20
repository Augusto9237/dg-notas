
import { CardAvaliacao } from '@/components/card-avaliacao';
import { ListarAvaliacoesAlunoId, ListarCriterios } from '@/actions/avaliacao';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export default async function Page() {
  const session = await auth.api.getSession({
    headers: await headers() // you need to pass the headers object.
  })

  if (session?.user) {

    const avaliacoes = await ListarAvaliacoesAlunoId(session.user.id)
    const criterios = await ListarCriterios()

    return (
      <div className="w-full">
        <main className="flex flex-col gap-4 p-5 pb-20">
          <div className="flex items-center justify-between">
            <h2 className="text-primary font-semibold">Suas Redações</h2>
          </div>
          {avaliacoes.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              Nenhuma avaliação encontrada
            </div>
          ) : (
            avaliacoes
              .filter(avaliacao => avaliacao.tema && avaliacao.tema.nome) // Filtro adicional de segurança
              .map((avaliacao) => (
                <CardAvaliacao key={avaliacao.id} avaliacao={avaliacao} criterios={criterios} />
              ))
          )}
        </main>
      </div>
    );
  }
}