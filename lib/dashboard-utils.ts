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

export function rankearMelhoresAlunos(avaliacoes: Avaliacao[], ultimoTemaId?: number): AlunoRanking[] {
    if (!avaliacoes || avaliacoes.length === 0 || !ultimoTemaId) return [];

    // 1. Filtrar as avaliações para manter apenas as referentes ao último tema passado na função
    const avaliacoesUltimoTema = avaliacoes.filter(av => av.tema?.id === ultimoTemaId);

    // 2. Pegar a última avaliação de cada aluno para este tema específico
    const alunosMap = new Map<string, {
        nome: string;
        email: string;
        image: string | null;
        ultimaNota: number;
        dataAvaliacao: number;
    }>();

    avaliacoesUltimoTema.forEach(avaliacao => {
        const { alunoId, notaFinal, aluno, createdAt } = avaliacao;
        
        // Tratamento flexível para a data (evitando erros caso Prisma envie como string)
        const createdAtValue = createdAt;
        const dataAv = typeof createdAtValue === 'string' || typeof createdAtValue === 'number'
            ? new Date(createdAtValue).getTime()
            : createdAtValue instanceof Date ? createdAtValue.getTime() : 0;

        const existente = alunosMap.get(alunoId);
        
        // Se o aluno ainda não está no map, ou se a avaliação atual é mais recente que a armazenada
        if (!existente || dataAv > existente.dataAvaliacao) {
            alunosMap.set(alunoId, {
                nome: aluno.name,
                email: aluno.email,
                image: aluno.image,
                ultimaNota: notaFinal,
                dataAvaliacao: dataAv
            });
        }
    });

    // 3. Converter para array
    const ranking = Array.from(alunosMap.entries()).map(([alunoId, dados]) => {
        return {
            alunoId,
            nome: dados.nome,
            email: dados.email || "", // Garante string vazia se for null
            image: dados.image || null,
            mediaFinal: Number.isFinite(dados.ultimaNota) ? dados.ultimaNota : 0, // Previne NaN ou Infinity
            totalAvaliacoes: 1 // Como consideramos apenas a nota do último tema, o total refletido é 1
        };
    });

    // 4. Ordenar pelas notas (decrescente) e pegar os 10 primeiros
    return ranking
        .sort((a, b) => b.mediaFinal - a.mediaFinal)
        .slice(0, 10)
        .map((aluno, index) => ({
            posicao: index + 1,
            ...aluno
        }));
}
