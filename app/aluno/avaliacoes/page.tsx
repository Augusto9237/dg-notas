import { TabelaAvaliacoesAluno } from '@/components/tabela-avaliacoes-aluno';

export default async function Page() {
  return (
    <div className="w-full h-full max-h-screen min-h-screen overflow-hidden">
      <main className="flex flex-col gap-4 p-5 h-full">
        <div className="flex items-center justify-between">
          <h2 className="text-primary font-semibold">Suas Avaliações</h2>
        </div>
        <TabelaAvaliacoesAluno />
      </main>
    </div>
  );
}