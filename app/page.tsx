import { TabelaAlunos } from '@/components/tabela-alunos';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search } from 'lucide-react';

export default function Home() {
  return (
    <div className="w-full">
      <div className='flex justify-between items-center h-14 p-5 mt-3'>
        <div>
          <h1 className=" text-xl font-bold">Alunos</h1>
          <p className="text-xs text-muted-foreground">Lista de alunos cadastrados</p>
        </div>
        <Button variant="secondary">
          <Plus />
          Adicionar Tema
        </Button>
      </div>

      <main className="flex flex-col gap-4 p-5">
        <TabelaAlunos />
      </main>
    </div>
  );
}

