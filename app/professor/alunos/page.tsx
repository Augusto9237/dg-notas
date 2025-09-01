import { FormularioTema } from '@/components/formulario-tema';
import { TabelaAlunos } from '@/components/tabela-alunos';

export default function Home() {
  return (
    <div className="w-full">
      <div className='flex justify-between items-center h-14 p-5 mt-3'>
        <div className="max-md:pl-10">
          <h1 className=" text-xl font-bold">Alunos</h1>
          <p className="text-xs text-muted-foreground">Lista de alunos cadastrados</p>
        </div>
        <FormularioTema/>
      </div>

      <main className="flex flex-col p-5">
        <TabelaAlunos />
      </main>
    </div>
  );
}

