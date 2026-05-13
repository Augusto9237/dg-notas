import { Suspense } from 'react';
import { HeaderTeacher } from '@/components/header-professor';
import { TabelaUsuarios } from '@/components/tabela-usuarios';
import { listarUsuarios } from '@/actions/admin';
import Loading from './loading';
import { FormularioUsuario } from '@/components/formulario-usuario';

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function Page({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const busca = typeof resolvedParams.busca === 'string' ? resolvedParams.busca : '';
  const page = typeof resolvedParams.page === 'string' ? Number(resolvedParams.page) : 1;
  const limit = 12;

  const initialData = await listarUsuarios(busca, page, limit);

  return (
    <Suspense fallback={<Loading />}>
      <div className="w-full h-full min-h-screen max-h-screen max-w-screen relative pt-16 overflow-y-auto">
        <HeaderTeacher title="Usuários" description="Lista de usuários do sistema">
          <FormularioUsuario />
        </HeaderTeacher>
        <main className="flex flex-col p-5 h-full">
          <TabelaUsuarios initialData={initialData} />
        </main>
      </div>
    </Suspense>
  );
}
