'use server'
import { revalidatePath } from "next/cache";
import { PrismaClient, Tema } from "../app/generated/prisma";
import { Avaliacao } from "../app/generated/prisma";

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

const prisma = new PrismaClient();

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
