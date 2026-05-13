import { FormularioTema } from '@/components/formulario-tema';
import { Suspense } from 'react';
import Loading from './loading';
import { HeaderTeacher } from '@/components/header-professor';
import { TabelaTemasProfessor } from '@/components/tabela-temas-professor';

export default async function Page() {

  return (
    <Suspense fallback={<Loading />}>
      <div className="w-full h-full min-h-screen relative pt-16 overflow-y-auto">
        <HeaderTeacher title="Avaliações" description="Lista de Avaliações">
          <div className='flex items-center gap-4'>
            <FormularioTema />
          </div>
        </HeaderTeacher>

        <main className="flex flex-col p-5 h-full">
          <TabelaTemasProfessor />
        </main>
      </div>
    </Suspense>
  );
}
