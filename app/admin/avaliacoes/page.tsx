import { ListarCriterios } from '@/actions/avaliacao';
import { FormularioTema } from '@/components/formulario-tema';
import { TabelaTemas } from '@/components/tabela-temas';
import { Suspense } from 'react';
import Loading from './loading';
import { ModalCompetencias } from '@/components/modal-competencias';
import { HeaderTeacher } from '@/components/header-professor';
import { listarTemas } from '@/actions/avaliacao';

export default async function Page() {
  const criterios = await ListarCriterios()
  const temas = await listarTemas()

  return (
    <Suspense fallback={<Loading />}>
      <div className="w-full h-full min-h-screen relative pt-16 overflow-y-auto">
        <HeaderTeacher title="Avaliações" description="Lista de Avaliações">
          <div className='flex items-center gap-4'>
            <ModalCompetencias criterios={criterios} />
            <FormularioTema />
          </div>
        </HeaderTeacher>

        <main className="flex flex-col p-5 h-full">
          <TabelaTemas temasIniciais={temas.data} totalPaginas={temas.meta.totalPages} limite={temas.meta.limit} totalTemas={temas.meta.total} />
        </main>
      </div>
    </Suspense>
  );
}
