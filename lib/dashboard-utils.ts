import { Prisma } from "@/app/generated/prisma";

type Avaliacao = Prisma.AvaliacaoGetPayload<{
    include: {
        aluno: true,
        criterios: true,
        tema: true,
    }
}>

export interface AlunoRanking {
    posicao: number;
    alunoId: string;
    nome: string;
    email: string;
    image: string | null;
    mediaFinal: number;
    totalAvaliacoes: number;
}

export function calcularMediaGeral(avaliacoes: { notaFinal: number }[]): number {
    if (avaliacoes.length === 0) {
        return 0;
    }

    const somaNotas = avaliacoes.reduce((acc, avaliacao) => acc + avaliacao.notaFinal, 0);
    const media = somaNotas / avaliacoes.length;

    return media;
}

export function rankearMelhoresAlunos(avaliacoes: Avaliacao[]): AlunoRanking[] {
    if (!avaliacoes?.length) return [];

    // 1. Encontra o ID do tema mais recente (maior ID) de forma segura
    const maiorTemaId = avaliacoes.reduce((max, av) => Math.max(max, av.temaId || -1), -1);
    
    if (maiorTemaId === -1) return [];

    // 2. Filtra as avaliações do último tema e ordena da mais ANTIGA para a mais RECENTE
    const avaliacoesDoUltimoTema = avaliacoes
        .filter(av => av.temaId === maiorTemaId)
        .sort((a, b) => (new Date(a.createdAt).getTime() || 0) - (new Date(b.createdAt).getTime() || 0));

    // 3. Mantém apenas a avaliação mais recente por aluno
    // Como está ordenado (antiga -> recente), a última ocorrência do aluno sobrescreve as anteriores no Map
    const avaliacoesRecentes = new Map(avaliacoesDoUltimoTema.map(av => [av.alunoId, av]));

    // 4. Converte, ordena pelas maiores notas e extrai o Top 10
    return Array.from(avaliacoesRecentes.values())
        .map(av => ({
            alunoId: av.alunoId,
            nome: av.aluno.name,
            email: av.aluno.email || "",
            image: av.aluno.image || null,
            mediaFinal: Number.isFinite(av.notaFinal) ? av.notaFinal : 0,
            totalAvaliacoes: 1
        }))
        .sort((a, b) => b.mediaFinal - a.mediaFinal) // Maior nota primeiro
        .slice(0, 10)                                // Pega os 10 primeiros
        .map((aluno, index) => ({
            posicao: index + 1,
            ...aluno
        }));
}
