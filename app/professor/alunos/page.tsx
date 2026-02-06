
import { TabelaAlunos } from '@/components/tabela-alunos';
import Loading from './loading';
import { Suspense } from 'react';
import { HeaderProfessor } from '@/components/header-professor';

export default async function Page() {

  return (
    <Suspense fallback={<Loading />}>
      <div className="w-full h-full min-h-screen max-h-screen max-w-screen relative pt-14 overflow-y-auto">
        <HeaderProfessor>
          <div>
            <h1 className="text-xl font-bold">Alunos</h1>
            <p className="text-xs text-muted-foreground leading-none">Lista de alunos</p>
          </div>
        </HeaderProfessor>
        <main className="flex flex-col p-5 h-full">
          <TabelaAlunos />
        </main>
      </div>
    </Suspense>
  );
}

