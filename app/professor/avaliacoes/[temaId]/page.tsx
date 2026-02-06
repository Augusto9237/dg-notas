import Loading from '../loading';
import { Suspense } from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { ListarAvaliacoesTemaId } from '@/actions/avaliacao';
import { TabelaAvaliacoesTema } from '@/components/tabela-avaliacoes-tema';
import { calcularMedia } from '@/lib/media-geral';
import { HeaderProfessor } from '@/components/header-professor';

export default async function Page({
  params,
}: {
  params: Promise<{ temaId: string }>
}) {
  const tema = (await params).temaId
  const avaliacoesTema = await ListarAvaliacoesTemaId(Number(tema))

  return (
    <Suspense fallback={<Loading />}>
      <div className="w-full h-full min-h-screen relative pt-14 overflow-y-auto">
        <HeaderProfessor>
          <div>
            <h1 className=" text-xl font-bold">Tema - {tema}</h1>
            <p className="text-xs text-muted-foreground max-sm:leading-none">{avaliacoesTema.length > 0 ? avaliacoesTema[0].tema.nome : ""}</p>
          </div>
          <div className='flex flex-col justify-center w-full flex-1 items-end'>
            <h1 className="text-xl max-sm:text-lg font-bold">{calcularMedia(avaliacoesTema).toFixed(2).replace('.', ',')}</h1>
            <p className="text-xs text-muted-foreground max-sm:leading-none truncate">Média Geral</p>
          </div>
        </HeaderProfessor>

        <main className="flex flex-col p-5 h-full">
          <TabelaAvaliacoesTema avaliacoes={avaliacoesTema} />
        </main>
      </div>
    </Suspense>
  );
}

