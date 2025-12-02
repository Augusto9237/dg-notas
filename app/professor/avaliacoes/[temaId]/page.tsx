import Loading from '../loading';
import { Suspense } from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { ListarAvaliacoesTemaId } from '@/actions/avaliacao';
import { TabelaAvaliacoesTema } from '@/components/tabela-avaliacoes-tema';
import { calcularMedia } from '@/lib/media-geral';

export default async function Page({
  params,
}: {
  params: Promise<{ temaId: string }>
}) {
  const tema = (await params).temaId
  const avaliacoesTema = await ListarAvaliacoesTemaId(Number(tema))

  return (
    <Suspense fallback={<Loading />}>
      <div className="w-full max-w-screen overflow-hidden">
        <div className='flex justify-between items-center h-14 p-5 mt-3 relative w-full max-w-screen overflow-hidden'>
          <SidebarTrigger className='absolute' />
          <div className="max-[1025px]:pl-10 w-full max-w-screen overflow-hidden">
            <h1 className=" text-xl font-bold">Tema - {tema}</h1>
            <p className="text-xs text-muted-foreground max-sm:leading-none truncate">{avaliacoesTema.length > 0 ? avaliacoesTema[0].tema.nome : ""}</p>
          </div>
          <div>
            <div className='max-[1025px]:ml-10 overflow-hidden'>
              <h1 className="text-xl max-sm:text-lg font-bold">{calcularMedia(avaliacoesTema).toFixed(2).replace('.', ',')}</h1>
              <p className="text-xs text-muted-foreground max-sm:leading-none truncate">Média Geral</p>
            </div>
          </div>
        </div>

        <main className="p-5">
          <TabelaAvaliacoesTema avaliacoes={avaliacoesTema} />
        </main>
      </div>
    </Suspense>
  );
}

