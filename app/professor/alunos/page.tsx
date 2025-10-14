import { ListarAlunosGoogle } from '@/actions/alunos';
import { TabelaAlunos } from '@/components/tabela-alunos';
import Loading from './loading';
import { Suspense } from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';

export default async function Page() {
  const alunos = await ListarAlunosGoogle();

  return (
    <Suspense fallback={<Loading />}>
      <div className="w-full">
        <div className='flex justify-between items-center h-14 p-5 mt-3 relative'>
          <SidebarTrigger className='absolute'/>
          <div className="max-[1025px]:pl-10">
            <h1 className=" text-xl font-bold">Alunos</h1>
            <p className="text-xs text-muted-foreground">Lista de alunos cadastrados</p>
          </div>
        </div>

        <main className="flex flex-col p-5">
          <TabelaAlunos alunos={alunos} />
        </main>
      </div>
    </Suspense>
  );
}

