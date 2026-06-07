
import Loading from './loading';
import { Suspense } from 'react';
import { HeaderTeacher } from '@/components/header-professor';
import { TabelaAlunos } from '@/components/tabela-alunos';
import { listarAlunosGoogle } from '@/actions/alunos';


export default async function Page() {
  const alunos = await listarAlunosGoogle()

  return (
    <Suspense fallback={<Loading />}>
      <div className="w-full h-full min-h-screen max-h-screen max-w-screen relative pt-16 overflow-y-auto">
        <HeaderTeacher title="Alunos" description="Lista de alunos" />
        <main className="flex flex-col p-5 h-full">
          <TabelaAlunos alunosIniciais={alunos.data} totalPaginas={alunos.totalPaginas} limite={alunos.limite} totalAlunos={alunos.total} />
        </main>
      </div>
    </Suspense>
  );
}

