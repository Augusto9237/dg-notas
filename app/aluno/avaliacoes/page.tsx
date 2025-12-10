
import { ListarAvaliacoesAlunoId, ListarCriterios, ListarTemasDisponiveis } from '@/actions/avaliacao';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { ListaAvaliacoes } from '@/components/lista-avaliacoes';
import { CardNovoTema } from '@/components/card-novotema';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileX } from 'lucide-react';


export default async function Page() {
  const session = await auth.api.getSession({
    headers: await headers() // you need to pass the headers object.
  })

  if (session?.user) {

    const avaliacoes = await ListarAvaliacoesAlunoId(session.user.id)
    const criterios = await ListarCriterios()
    const novosTemas = await ListarTemasDisponiveis(session.user.id)

    return (
      <div className="w-full">
        <main className="flex flex-col gap-4 p-5 pb-20">
          <div className="flex items-center justify-between">
            <h2 className="text-primary font-semibold">Suas Avaliações</h2>
          </div>

          <Tabs defaultValue="pendentes">
            <TabsList>
              <TabsTrigger value="pendentes" className="text-foreground max-sm:text-xs">Pendentes</TabsTrigger>
              <TabsTrigger value="corrigidas" className="text-foreground max-sm:text-xs">Corrigidas</TabsTrigger>
            </TabsList>
            <TabsContent value='pendentes' className="flex flex-col gap-4">
              {(() => {
                const pendingAvaliacoes = avaliacoes.filter((avaliacao) => avaliacao.status === "ENVIADA");

                if (pendingAvaliacoes.length > 0) {
                  return (
                    <ListaAvaliacoes avaliacoesIniciais={pendingAvaliacoes} criteriosIniciais={criterios} />
                  );
                } else if (novosTemas.length > 0) {
                  return (
                    <div className='space-y-4'>
                      {novosTemas.map((tema) => (
                        <CardNovoTema key={tema.id} tema={tema} />
                      ))}
                    </div>
                  );
                } else {
                  return (
                    <div className="w-full h-full flex flex-col flex-1 items-center justify-center gap-2 text-muted-foreground pt-5">
                      <FileX className="size-10" />
                      <span className="text-foreground font-semibold">Nenhuma avaliação pendente</span>
                    </div>
                  );
                }
              })()}
            </TabsContent>
            <TabsContent value='corrigidas' className="flex flex-col gap-4">
              <ListaAvaliacoes avaliacoesIniciais={avaliacoes.filter((avaliacao) => avaliacao.status === "CORRIGIDA")} criteriosIniciais={criterios} />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    );
  }
}