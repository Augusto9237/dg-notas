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
    status: 'ENVIADA' | 'CORRIGIDA';
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

export async function ListarTemas(busca?: string): Promise<Tema[]> {
    try {
        // Construir o where clause dinamicamente
        const whereClause = {
            // Só aplica o filtro se busca for fornecida e não vazia
            ...(busca && busca.trim() !== '' && {
                nome: {
                    contains: busca.trim(),
                    mode: 'insensitive' as const, // Case-insensitive
                },
            }),
        };

        const temas = await prisma.tema.findMany({
            where: whereClause,
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

export async function AlterarDisponibilidadeTema(id: number, disponivel: boolean): Promise<Tema> {
    try {
        const temaAtualizado = await prisma.tema.update({
            where: {
                id,
            },
            data: {
                disponivel,
            },
        });
        revalidatePath('/professor')
        return temaAtualizado;
    } catch (error) {
        console.error("Erro ao atualizar disponibilidade do tema:", error);
        throw error;
    }
}

export async function DeletarTema(id: number) {
    try {
        // First, delete all CriterioAvaliacao entries related to evaluations of this theme
        await prisma.criterioAvaliacao.deleteMany({
            where: {
                avaliacao: {
                    temaId: id
                }
            }
        });

        // Then delete all evaluations related to this theme
        await prisma.avaliacao.deleteMany({
            where: {
                temaId: id,
            },
        });

        // Finally delete the theme itself
        await prisma.tema.delete({
            where: {
                id,
            },
        });

        revalidatePath('/professor/avaliacoes')
    } catch (error) {
        console.error("Erro ao deletar tema:", error);
        throw error;
    }
}


export async function ListarCriterios(): Promise<Criterio[]> {
    try {
        const criterios = await prisma.criterio.findMany({
            orderBy: {
                id: 'asc',
            },
        })
        return criterios;
    } catch (error) {
        console.error("Erro ao listar criterios:", error);
        throw error;
    }

}

export async function EditarCriterio(id: number, nome: string, descricao: string, pontuacaoMax: number): Promise<Criterio> {
    const resposta = await prisma.criterio.update({
        where: {
            id,
        },
        data: {
            nome,
            descricao,
            pontuacaoMax,
        },
    });
    revalidatePath('/professor/temas')
    return resposta;
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
                resposta: '', // Add empty string as default response
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
        revalidatePath('/aluno');
        return avaliacao;
    } catch (error) {
        console.error("Erro ao adicionar avaliação:", error);
        throw error;
    }
}

export async function EnviarRespoastaAvaliacao(
    idAluno: string,
    idTema: number,
    resposta: string
) {
    try {
        const avaliacaoCriada = await prisma.avaliacao.create({
            data: {
                alunoId: idAluno,
                temaId: idTema,
                resposta: resposta,
                notaFinal: 0, // Default score
            },
        });
        revalidatePath('/aluno');
        return avaliacaoCriada;
    } catch (error) {
        console.error("Erro ao enviar resposta da avaliação:", error);
        throw error;
    }
}

export async function EditarAvaliacao(
    id: number,
    data: AdicionarAvaliacaoInput,
    correcao?: string
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
                    correcao: correcao,
                    criterios: {
                        create: data.criterios.map((criterio) => ({
                            criterioId: criterio.criterioId,
                            pontuacao: criterio.pontuacao,
                        })),
                    },
                    status: data.status
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

export async function ListarAvaliacoesTemaId(temaId: number) {
    const avaliacoes = await prisma.avaliacao.findMany({
        where: {
            temaId: temaId
        },
        include: {
            tema: true,
            aluno: true,
            criterios: true
        }
    });

    return avaliacoes;
}

export async function ListarAvaliacoesAlunoId(alunoId: string, busca?: string) {
    try {
        // Construir o where clause dinamicamente
        const whereClause = {
            alunoId: alunoId,
            // Só aplica o filtro se busca for fornecida e não vazia
            ...(busca && busca.trim() !== '' && {
                tema: {
                    nome: {
                        contains: busca.trim(),
                        mode: 'insensitive' as const, // Case-insensitive
                    },
                },
            }),
        }

        const avaliacoes = await prisma.avaliacao.findMany({
            where: whereClause,
            include: {
                tema: true,
                criterios: true,
                aluno: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return avaliacoes;
    } catch (error) {
        console.error('Erro ao listar avaliações:', error);
        return [];
    }
}

export async function ListarTemasDisponiveis(alunoId: string): Promise<Tema[]> {
    try {
        const temas = await prisma.tema.findMany({
            where: {
                Avaliacao: {
                    none: {
                        alunoId: alunoId
                    }
                },
                disponivel: true
            },
            orderBy: {
                createdAt: 'asc'
            }
        });
        return temas;
    } catch (error) {
        console.error("Erro ao listar temas disponíveis:", error);
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

export async function ListarAvaliacoes(month?: number, year?: number) {
    const targetYear = year ?? new Date().getFullYear();

    if (month !== undefined && (month < 1 || month > 12)) {
        throw new Error('O mês deve estar entre 1 e 12');
    }

    // Validação do ano
    if (targetYear < 1900 || targetYear > 2100) {
        throw new Error('Ano inválido');
    }

    let startDate: Date;
    let endDate: Date;

    if (month !== undefined) {
        // Filter para um mês específico
        startDate = new Date(targetYear, month - 1, 1);
        endDate = new Date(targetYear, month, 1);
    } else {
        // Filter para o ano inteiro
        startDate = new Date(targetYear, 0, 1);
        endDate = new Date(targetYear + 1, 0, 1);
    }

    try {
        const avaliacoes = await prisma.avaliacao.findMany({
            where: {
                createdAt: {
                    gte: startDate,
                    lt: endDate,
                },
            },
            include: {
                aluno: true,
                criterios: true,
                tema: true,
            },
            orderBy: {
                createdAt: 'desc', // Ordena da mais recente para a mais antiga
            },
        });

        return avaliacoes;
    } catch (error) {
        console.error("Erro ao listar avaliações:", error);

        // Fornece uma mensagem de erro mais específica
        if (error instanceof Error) {
            throw new Error(`Falha ao buscar avaliações: ${error.message}`);
        }

        throw new Error('Erro desconhecido ao buscar avaliações');
    }
}
