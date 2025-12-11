import { ListarAvaliacoes, ListarCriterios, ListarTemas } from '@/actions/avaliacao';
import { FormularioTema } from '@/components/formulario-tema';
import { TabelaTemas } from '@/components/tabela-temas';
import { Suspense } from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import Loading from './loading';
import { ModalCompetencias } from '@/components/modal-competencias';

export default async function Page() {
  const [temas, criterios, avaliacoes] = await Promise.all([
    ListarTemas(),
    ListarCriterios(),
    ListarAvaliacoes()
  ]);

  return (
    <Suspense fallback={<Loading />}>
      <div className="w-full">
        <div className='flex justify-between items-center h-14 p-5 mt-3 relative'>
          <SidebarTrigger className='absolute' />
          <div className="max-[1025px]:pl-10">
            <h1 className=" text-xl font-bold">Avaliações</h1>
            <p className="text-xs text-muted-foreground max-sm:leading-none">Lista de avaliações</p>
          </div>
          <div className='flex items-center gap-4'>
            <ModalCompetencias criterios={criterios} />
            <FormularioTema />
          </div>
        </div>

        <main className="flex flex-col p-5">
          <TabelaTemas temas={temas} avaliacoes={avaliacoes} />
        </main>
      </div>
    </Suspense>
  );
}
