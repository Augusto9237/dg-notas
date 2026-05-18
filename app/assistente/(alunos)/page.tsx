
import Loading from './loading';
import { Suspense } from 'react';
import { HeaderTeacher } from '@/components/header-professor';
import { TabelaAlunosAssistente } from '@/components/tabela-alunos-assistente';


export default async function Page() {

  return (
    <Suspense fallback={<Loading />}>
      <div className="w-full h-full min-h-screen max-h-screen max-w-screen relative pt-16 overflow-y-auto">
        <HeaderTeacher title="Alunos" description="Lista de alunos" />
        <main className="flex flex-col p-5 h-full">
          <TabelaAlunosAssistente />
        </main>
      </div>
    </Suspense>
  );
}

