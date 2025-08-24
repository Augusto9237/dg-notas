import { TabelaAlunos } from '@/components/tabela-alunos';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';


export default function Home() {
  return (
    <div className="w-full max-w-screen-2xl mx-auto pt-[72px]">
      <main className="p-4 flex flex-col gap-4">
        <h1 className=" text-xl font-bold">Alunos</h1>

        <div className="flex items-center max-w-md relative">
          <Input type="text" placeholder="Buscar por nome..." className="bg-card/70" />
          <Button className='absolute right-0 top-0 bg-background border rounded-bl-none rounded-tl-none' variant='ghost'>
            <Search />
          </Button>
        </div>
        <TabelaAlunos />
      </main>
    </div>
  );
}
