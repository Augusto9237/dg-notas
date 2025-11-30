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
    // Agrupa avaliações por aluno e calcula a média
    const alunosMap = new Map<string, {
        nome: string;
        email: string;
        image: string | null;
        somaNotas: number;
        totalAvaliacoes: number;
    }>();

    avaliacoes.forEach(avaliacao => {
        const { alunoId, notaFinal, aluno } = avaliacao;

        if (alunosMap.has(alunoId)) {
            const dados = alunosMap.get(alunoId)!;
            dados.somaNotas += notaFinal;
            dados.totalAvaliacoes += 1;
        } else {
            alunosMap.set(alunoId, {
                nome: aluno.name,
                email: aluno.email,
                image: aluno.image,
                somaNotas: notaFinal,
                totalAvaliacoes: 1
            });
        }
    });

    // Converte para array e calcula médias
    const ranking = Array.from(alunosMap.entries()).map(([alunoId, dados]) => ({
        alunoId,
        nome: dados.nome,
        email: dados.email || "", // Garante string vazia se for null
        image: dados.image || null,
        mediaFinal: Number((dados.somaNotas / dados.totalAvaliacoes).toFixed(2)),
        totalAvaliacoes: dados.totalAvaliacoes
    }));

    // Ordena por média decrescente e pega os 10 primeiros
    return ranking
        .sort((a, b) => b.mediaFinal - a.mediaFinal)
        .slice(0, 10)
        .map((aluno, index) => ({
            posicao: index + 1,
            ...aluno
        }));
}
