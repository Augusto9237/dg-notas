import { FormularioAvaliacao } from '@/components/formulario-avaliação';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { ListarAvaliacoesAlunoId, ListarCriterios, ListarTemas } from '@/actions/avaliacao';
import { BuscarAlunoGooglePorId } from '@/actions/alunos';
import { TabelaAvaliacoes } from '@/components/tabela-avaliacoes';

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const alunoId = (await params).id
  const aluno = await BuscarAlunoGooglePorId(alunoId)

  // Verificar se o aluno existe
  if (!aluno) {
    return (
      <div className="w-full">
        <div className='flex justify-between items-center h-14 p-5 mt-3 relative'>
          <SidebarTrigger className='md:hidden absolute' />
          <div className='max-md:ml-10'>
            <h1 className="text-xl font-bold">Aluno não encontrado</h1>
            <p className="text-xs text-muted-foreground">O aluno solicitado não foi encontrado</p>
          </div>
        </div>
      </div>
    );
  }

  const temas = await ListarTemas()
  const criterios = await ListarCriterios()
  const avaliacoes = await ListarAvaliacoesAlunoId(alunoId)

  return (
    <div className="w-full">
      <div className='flex justify-between items-center h-14 p-5 mt-3 relative'>
        <SidebarTrigger className='md:hidden absolute' suppressHydrationWarning />
        <div className='max-md:ml-10'>
          <h1 className="text-xl font-bold">{aluno.name}</h1>
          <p className="text-xs text-muted-foreground">{aluno.email}</p>
        </div>
        <FormularioAvaliacao alunoId={alunoId} temas={temas} criterios={criterios} />
      </div>
      <main className="flex flex-col gap-4 p-5">
        <div className='bg-card rounded-lg shadow-sm p-4 flex flex-col gap-4'>
          <div className="flex items-center w-full max-w-md relative">
            <Input type="text" placeholder="Buscar por Tema" className="bg-card/70" />
            <Button className='absolute right-0 top-0 bg-background border rounded-bl-none rounded-tl-none' variant='ghost'>
              <Search />
            </Button>
          </div>
          <TabelaAvaliacoes aluno={aluno} avaliacoes={avaliacoes} criterios={criterios} temas={temas} />
        </div>
      </main>
    </div>
  );
}