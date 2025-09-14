'use server'
import { revalidatePath } from "next/cache";
import { Criterio, Tema } from "../app/generated/prisma";
import { Avaliacao } from "../app/generated/prisma";
import { prisma } from "@/lib/prisma";

interface CriterioAvaliacaoInput {
    criterioId: number;
    pontuacao: number;
}

interface AdicionarAvaliacaoInput {
    alunoId: string;
    temaId: number;
    criterios: CriterioAvaliacaoInput[];
    notaFinal: number;
}


export async function AdicionarTema(nome: string): Promise<Tema> {
    try {
        const novoTema = await prisma.tema.create({
            data: {
                nome,
            },
        });
        revalidatePath('/professor')
        return novoTema;
    } catch (error) {
        console.error("Erro ao adicionar tema:", error);
        throw error;
    }
}

export async function ListarTemas(): Promise<Tema[]> {
    try {
        const temas = await prisma.tema.findMany({
            orderBy: {
                nome: 'asc',
            },
        });
        return temas;
    } catch (error) {
        console.error("Erro ao listar temas:", error);
        throw error;
    }
}

export async function EditarTema(id: number, novoNome: string): Promise<Tema> {
    try {
        const temaEditado = await prisma.tema.update({
            where: {
                id,
            },
            data: {
                nome: novoNome,
            },
        });
        revalidatePath('/professor')
        return temaEditado;
    } catch (error) {
        console.error("Erro ao editar tema:", error);
        throw error;
    }
}

export async function DeletarTema(id: number) {
    try {
        await prisma.avaliacao.deleteMany({
            where: {
                temaId: id,
            },
        });
        await prisma.tema.delete({
            where: {
                id,
            },
        });
        revalidatePath('/professor')
    } catch (error) {
        console.error("Erro ao deletar tema:", error);
        throw error;
    }
}


export async function ListarCriterios(): Promise<Criterio[]> {
    try {
        const criterios = await prisma.criterio.findMany({})

        return criterios;
    } catch (error) {
        console.error("Erro ao listar criterios:", error);
        throw error;
    }

}


export async function AdicionarAvaliacao({
    alunoId,
    temaId,
    criterios,
    notaFinal,
}: AdicionarAvaliacaoInput): Promise<Avaliacao> {
    try {
        const avaliacao = await prisma.avaliacao.create({
            data: {
                alunoId,
                temaId,
                notaFinal,
                criterios: {
                    create: criterios.map((criterio) => ({
                        criterioId: criterio.criterioId,
                        pontuacao: criterio.pontuacao,
                    })),
                },
            },
            include: {
                criterios: true,
                tema: true,
                aluno: true,
            },
        });
        revalidatePath('/professor');
        return avaliacao;
    } catch (error) {
        console.error("Erro ao adicionar avaliação:", error);
        throw error;
    }
}

export async function EditarAvaliacao(
    id: number,
    data: AdicionarAvaliacaoInput
): Promise<Avaliacao> {
    try {
        const transaction = await prisma.$transaction([
            prisma.criterioAvaliacao.deleteMany({
                where: { avaliacaoId: id },
            }),
            prisma.avaliacao.update({
                where: { id },
                data: {
                    alunoId: data.alunoId,
                    temaId: data.temaId,
                    notaFinal: data.notaFinal,
                    criterios: {
                        create: data.criterios.map((criterio) => ({
                            criterioId: criterio.criterioId,
                            pontuacao: criterio.pontuacao,
                        })),
                    },
                },
                include: {
                    criterios: true,
                    tema: true,
                    aluno: true,
                },
            }),
        ]);

        revalidatePath('/professor');
        return transaction[1]; 
    } catch (error) {
        console.error("Erro ao editar avaliação:", error);
        throw error;
    }
}

export async function ListarAvaliacoesAlunoId(alunoId: string) {
    try {
        const avaliacoes = await prisma.avaliacao.findMany({
            where: {
                alunoId: alunoId,
            },
            include: {
                tema: true,
                aluno: true,
                criterios: true,
            },
        });
        return avaliacoes;
    } catch (error) {
        console.error("Erro ao listar avaliações do aluno:", error);
        throw error;
    }
}

export async function DeletarAvaliacao(id: number) {
    try {
        // Primeiro, deleta todos os critérios associados à avaliação
        await prisma.criterioAvaliacao.deleteMany({
            where: {
                avaliacaoId: id,
            },
        });

        // Depois, deleta a avaliação
        await prisma.avaliacao.delete({
            where: {
                id,
            },
        });

        revalidatePath('/professor');
    } catch (error) {
        console.error("Erro ao deletar avaliação:", error);
        throw error;
    }
}
