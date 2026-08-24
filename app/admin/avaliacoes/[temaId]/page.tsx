import { ListarAvaliacoesTemaId, ListarCriterios } from '@/actions/avaliacao';
import { TabelaAvaliacoesTema } from '@/components/tabela-avaliacoes-tema';
import { calcularMedia } from '@/lib/media-geral';
import { HeaderTeacher } from '@/components/header-professor';
import { CardDescription, CardTitle } from '@/components/ui/card';
import { notFound } from 'next/navigation';

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ temaId: string }>;
  searchParams: Promise<{ busca?: string }>;
}) {

  const temaIdParam = (await params).temaId;
  const temaId = Number(temaIdParam);

  if (!Number.isInteger(temaId)) {
    notFound(); // next/navigation
  }
  const [avaliacoesTema, criterios] = await Promise.all([
    ListarAvaliacoesTemaId(Number(temaId)),
    ListarCriterios(),
  ]);

  return (
      <div className="w-full h-full min-h-screen relative pt-16 overflow-y-auto">
        <HeaderTeacher title={`Tema - ${temaId}`} description={avaliacoesTema.length > 0 ? avaliacoesTema[0].tema.nome : ""}>
          <div className='flex flex-col justify-center w-full flex-1 items-end'>
            <CardTitle className="md:text-lg leading-none">{calcularMedia(avaliacoesTema).toFixed(2).replace('.', ',')}</CardTitle>
            <CardDescription className="max-md:text-xs truncate">Média Geral</CardDescription>
          </div>
        </HeaderTeacher>

        <main className="flex flex-col p-5 h-full">
          <TabelaAvaliacoesTema avaliacoes={avaliacoesTema} criterios={criterios} />
        </main>
      </div>
  );
}

