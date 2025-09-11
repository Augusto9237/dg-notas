import { ListarAlunosGoogle } from '@/actions/alunos';
import { ListarTemas } from '@/actions/avaliacao';
import { FormularioTema } from '@/components/formulario-tema';
import { ModalTemas } from '@/components/modal-temas';
import { TabelaAlunos } from '@/components/tabela-alunos';

export default async function Home() {
   const temas = await ListarTemas()
   const alunos = await ListarAlunosGoogle()
  return (
    <div className="w-full">
      <div className='flex justify-between items-center h-14 p-5 mt-3'>
        <div className="max-md:pl-10">
          <h1 className=" text-xl font-bold">Alunos</h1>
          <p className="text-xs text-muted-foreground">Lista de alunos cadastrados</p>
        </div>
        <div className='flex items-center gap-4'>
          <ModalTemas temas={temas}/>
          <FormularioTema />
        </div>
      </div>

      <main className="flex flex-col p-5">
        <TabelaAlunos alunos={alunos} />
      </main>
    </div>
  );
}

