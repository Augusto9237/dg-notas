import { ListarAvaliacoesAlunoId, ListarCriterios, listarTemas } from '@/actions/avaliacao';
import { BuscarAlunoGooglePorId } from '@/actions/alunos';
import { TabelaAvaliacoes } from '@/components/tabela-avaliacoes';
import { Suspense } from 'react';
import Loading from './loading';
import { RelatorioEvolucao } from '@/components/relatorio-evolucao';
import { HeaderTeacher } from '@/components/header-professor';

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
        <div className='flex justify-between items-center h-16 p-5 mt-3 relative'>
          <div className='max-[1025px]:ml-10'>
            <h1 className="text-xl font-bold">Aluno não encontrado</h1>
            <p className="text-xs text-muted-foreground">O aluno solicitado não foi encontrado</p>
          </div>
        </div>
      </div>
    );
  }

  const avaliacoes = await ListarAvaliacoesAlunoId(alunoId)

  return (
    <Suspense fallback={<Loading />}>
      <div className="w-full h-full min-h-screen relative pt-16 overflow-y-auto">
        <HeaderTeacher title={aluno.name} description={aluno.email}>
          <RelatorioEvolucao aluno={{ id: alunoId, nome: aluno.name, email: aluno.email, image: aluno.image || '', telefone: aluno.telefone || '', criado: aluno.createdAt }} avaliacoes={avaliacoes.data} />
        </HeaderTeacher>
        <main className="flex flex-col p-5 h-full">
          <TabelaAvaliacoes aluno={aluno} avaliacoes={avaliacoes} />
        </main>
      </div>
    </Suspense>
  );
}