import { Suspense } from 'react';
import { HeaderTeacher } from '@/components/header-professor';
import { TabelaUsuarios } from '@/components/tabela-usuarios';
import { listarUsuarios } from '@/actions/admin';
import Loading from './loading';
import { FormularioUsuario } from '@/components/formulario-usuario';


export default async function Page() {
  const initialData = await listarUsuarios();

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
