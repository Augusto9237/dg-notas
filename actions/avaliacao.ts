'use server'
import { revalidatePath } from "next/cache";
import { Criterio, Tema } from "../app/generated/prisma";
import { Avaliacao } from "../app/generated/prisma";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

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
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session?.user || session.user.role !== 'admin') {
        throw new Error('Usuário não autorizado');
    }

    try {
        const novoTema = await prisma.tema.create({
            data: {
                nome,
                professorId: session.user.id,
            },
        });
        revalidatePath('/professor')
        return novoTema;
    } catch (error) {
        console.error("Erro ao adicionar tema:", error);
        throw error;
    }
}

export async function ListarTemas(busca?: string, page: number = 1, limit: number = 10) {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session?.user || session.user.role !== 'admin') {
        throw new Error('Usuário não autorizado');
    }

    try {
        const whereClause = {
            // Só aplica o filtro se busca for fornecida e não vazia
            ...(busca && busca.trim() !== '' && {
                nome: {
                    contains: busca.trim(),
                    mode: 'insensitive' as const, // Case-insensitive
                },
            }),
        };

        const [temas, total] = await Promise.all([
            prisma.tema.findMany({
                where: whereClause,
                orderBy: {
                    nome: 'asc',
                },
                include: {
                    professor: true,
                },
                take: limit,
                skip: (page - 1) * limit,
            }),
            prisma.tema.count({
                where: whereClause,
            })
        ]);

        return {
            data: temas,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            }
        };
    } catch (error) {
        console.error("Erro ao listar temas:", error);
        throw error;
    }
}

export async function listarTemasMes(month?: number, year?: number) {
    try {
        const now = new Date();

        // Se nenhum parâmetro for fornecido, usa o mês e ano atual
        const targetMonth = month ?? (now.getMonth() + 1);
        const targetYear = year ?? now.getFullYear();

        // Validação do mês
        if (targetMonth < 1 || targetMonth > 12) {
            throw new Error('O mês deve estar entre 1 e 12');
        }

        // Validação do ano
        if (targetYear < 1900 || targetYear > 2100) {
            throw new Error('Ano inválido');
        }

        // Criar intervalo de datas para o mês inteiro
        const startDate = new Date(Date.UTC(targetYear, targetMonth - 1, 1));
        const endDate = new Date(Date.UTC(targetYear, targetMonth, 1));

        // Validação adicional para garantir que as datas são válidas
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            throw new Error('Erro ao criar datas de filtro');
        }

        const whereClause = {
            createdAt: {
                gte: startDate,
                lt: endDate,
            },
        };

        const temas = await prisma.tema.findMany({
            where: whereClause,
            orderBy: {
                nome: 'asc',
            },
            include: {
                professor: true,
            }, // Limita o retorno a apenas 10 registros
        });

        return temas;
    } catch (error) {
        console.error("Erro ao listar temas:", error);
        throw error;
    }
}

export async function EditarTema(id: number, novoNome: string): Promise<Tema> {
    const session = await auth.api.getSession({
        headers: await headers()
    })
    if (!session?.user || session.user.role !== 'admin') {
        throw new Error('Usuário não autorizado');
    }
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
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session?.user || session.user.role !== 'admin') {
        throw new Error('Usuário não autorizado');
    }

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
        revalidatePath('/professor')
        revalidatePath('/aluno/avaliacoes')
    } catch (error) {
        console.error("Erro ao deletar tema:", error);
        throw error;
    }
}


export async function ListarCriterios(): Promise<Criterio[]> {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session?.user) {
        throw new Error('Usuário não autorizado');
    }
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
    const session = await auth.api.getSession({
        headers: await headers()
    })
    if (!session?.user || session.user.role !== 'admin') {
        throw new Error('Usuário não autorizado');
    }
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
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session?.user) {
        throw new Error('Usuário não autorizado');
    }

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
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session?.user) {
        throw new Error('Usuário não autorizado');
    }

    try {
        const avaliacaoExistente = await prisma.avaliacao.findFirst({
            where: {
                alunoId: idAluno,
                temaId: idTema,
            },
        });

        if (avaliacaoExistente) {
            throw new Error('Você já enviou uma resposta para este tema.');
        }

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
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session?.user || session.user.role !== 'admin') {
        throw new Error('Usuário não autorizado');
    }
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
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session?.user) {
        throw new Error('Usuário não autorizado');
    }
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

export async function ListarTemasDisponiveis(alunoId: string) {
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
            include: {
                professor: true
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
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session?.user || session.user.role !== 'admin') {
        throw new Error('Usuário não autorizado');
    }
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
    const now = new Date();

    // Se nenhum parâmetro for fornecido, usa o mês e ano atual
    const targetMonth = month ?? (now.getMonth() + 1); // getMonth() retorna 0-11
    const targetYear = year ?? now.getFullYear();

    // Validação do mês
    if (targetMonth < 1 || targetMonth > 12) {
        throw new Error('O mês deve estar entre 1 e 12');
    }

    // Validação do ano
    if (targetYear < 1900 || targetYear > 2100) {
        throw new Error('Ano inválido');
    }

    // Cria as datas de início e fim do mês
    // month - 1 porque o construtor Date usa índice 0-11 para meses
    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 1);

    // Validação adicional para garantir que as datas são válidas
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new Error('Erro ao criar datas de filtro');
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
                createdAt: 'desc',
            },
        });

        return avaliacoes;
    } catch (error) {
        console.error("Erro ao listar avaliações:", error);

        if (error instanceof Error) {
            throw new Error(`Falha ao buscar avaliações: ${error.message}`);
        }

        throw new Error('Erro desconhecido ao buscar avaliações');
    }
}
