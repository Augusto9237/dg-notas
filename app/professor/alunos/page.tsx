
import { TabelaAlunos } from '@/components/tabela-alunos';
import Loading from './loading';
import { Suspense } from 'react';
import { HeaderProfessor } from '@/components/header-professor';
import { RelatorioEvolucao } from '@/components/relatorio-evolucao';

export default async function Page() {

  return (
    <Suspense fallback={<Loading />}>
      <div className="w-full h-full min-h-screen relative pt-14 overflow-y-auto">
        <HeaderProfessor>
          <div className=" max-[1025px]:pl-10">
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

