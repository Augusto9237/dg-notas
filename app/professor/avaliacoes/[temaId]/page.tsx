import Loading from '../loading';
import { Suspense } from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { ListarAvaliacoesTemaId } from '@/actions/avaliacao';
import { TabelaAvaliacoesTema } from '@/components/tabela-avaliacoes-tema';

export default async function Page({
  params,
}: {
  params: Promise<{ temaId: string }>
}) {
  const tema = (await params).temaId
  const avaliacoesTema = await ListarAvaliacoesTemaId(Number(tema))

  return (
    <Suspense fallback={<Loading />}>
      <div className="w-full">
        <div className='flex justify-between items-center h-14 p-5 mt-3 relative'>
          <SidebarTrigger className='absolute'/>
          <div className="max-[1025px]:pl-10">
            <h1 className=" text-xl font-bold">Tema: {tema}</h1>
            <p className="text-xs text-muted-foreground">{avaliacoesTema.length > 0 ? avaliacoesTema[0].tema.nome: ""}</p>
          </div>
        </div>

        <main className="flex flex-col p-5">
          <TabelaAvaliacoesTema avaliacoes={avaliacoesTema} />
        </main>
      </div>
    </Suspense>
  );
}

