import { FormularioAvaliacao } from '@/components/formulario-avaliação';
import { ListarAvaliacoesAlunoId, ListarCriterios, ListarTemas } from '@/actions/avaliacao';
import { BuscarAlunoGooglePorId } from '@/actions/alunos';
import { TabelaAvaliacoes } from '@/components/tabela-avaliacoes';
import { Suspense } from 'react';
import Loading from './loading';
import { InputBusca } from '@/components/input-busca';

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
          <div className='max-[1025px]:ml-10'>
            <h1 className="text-xl font-bold">Aluno não encontrado</h1>
            <p className="text-xs text-muted-foreground">O aluno solicitado não foi encontrado</p>
          </div>
        </div>
      </div>
    );
  }

  const [temas, criterios, avaliacoes] = await Promise.all([
    ListarTemas(),
    ListarCriterios(),
    ListarAvaliacoesAlunoId(alunoId)
  ])

  // Garantir que os dados são estáveis
  const temasData = JSON.parse(JSON.stringify(temas))
  const criteriosData = JSON.parse(JSON.stringify(criterios))
  const avaliacoesData = JSON.parse(JSON.stringify(avaliacoes))

  return (
    <Suspense fallback={<Loading />}>
      <div className="w-full">
        <div className='flex justify-between items-center h-14 p-5 mt-3 gap-2 relative'>
          <div className='max-[1025px]:ml-10 overflow-hidden'>
            <h1 className="text-xl max-sm:text-lg font-bold">{aluno.name}</h1>
            <p className="text-xs text-muted-foreground truncate">{aluno.email}</p>
          </div>
          <FormularioAvaliacao alunoId={alunoId} temas={temasData} criterios={criteriosData} />
        </div>
        <main className="flex flex-col gap-4 p-5">
          <div className='bg-card rounded-lg shadow-sm p-4 flex flex-col gap-4'>
            <InputBusca placeholder='Buscar por Tema'/>
            <TabelaAvaliacoes aluno={aluno} avaliacoes={avaliacoesData} criterios={criteriosData} temas={temasData} />
          </div>
        </main>
      </div>
    </Suspense>
  );
}