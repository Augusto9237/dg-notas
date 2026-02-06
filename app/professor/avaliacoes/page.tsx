import { ListarAvaliacoes, ListarCriterios, ListarTemas } from '@/actions/avaliacao';
import { FormularioTema } from '@/components/formulario-tema';
import { TabelaTemas } from '@/components/tabela-temas';
import { Suspense } from 'react';
import Loading from './loading';
import { ModalCompetencias } from '@/components/modal-competencias';
import { HeaderProfessor } from '@/components/header-professor';

export default async function Page() {
  const criterios = await ListarCriterios()

  return (
    <Suspense fallback={<Loading />}>
      <div className="w-full h-full min-h-screen relative pt-14 overflow-y-auto">
        <HeaderProfessor>
          <div>
            <h1 className=" text-xl font-bold">Avaliações</h1>
            <p className="text-xs text-muted-foreground max-sm:leading-none">Lista de avaliações</p>
          </div>
          <div className='flex justify-end w-full flex-1 items-center gap-4'>
            <ModalCompetencias criterios={criterios} />
            <FormularioTema />
          </div>
        </HeaderProfessor>

        <main className="flex flex-col p-5 h-full">
          <TabelaTemas />
        </main>
      </div>
    </Suspense>
  );
}
