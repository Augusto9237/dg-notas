'use server'
import { cacheLife, cacheTag, revalidatePath, unstable_cache, updateTag } from "next/cache";
import { Criterio, Tema } from "../app/generated/prisma";
import { Avaliacao } from "../app/generated/prisma";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { atualizarCache } from "./cache";
import { resolverIntervaloMes } from "@/helpers/resolver-intervalo-mes";

export async function verificarSessaoAdmin(): Promise<boolean> {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    return !!(session?.user && session.user.role === 'admin');
}

export async function verificarSessaoProfessor(professorId: string): Promise<boolean> {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    return !!(session?.user && session.user.role === 'professor' && session.user.id === professorId);
}

export async function verificarSessaoAluno(alunoId: string): Promise<boolean> {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    return !!(session?.user && session.user.role === 'user' && session.user.id === alunoId);
}


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
    feedback?: string;
}

export async function adicionarTema(nome: string, entrega?: Date): Promise<Tema> {
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
                entrega: entrega,
            },
        });
        revalidatePath('/professor')
        return novoTema;
    } catch (error) {
        console.error("Erro ao adicionar tema:", error);
        throw error;
    }
}

export async function listarTemas(busca?: string, page: number = 1, limit: number = 12) {
    const session = await auth.api.getSession({
        headers: await headers()
    })
    if (!session) {
        throw new Error("Usuário não autenticado")
    }

    const role = session.user.role as string;
    if (role !== 'admin' && role !== 'assistente' && role !== 'professor') {
        throw new Error('Usuário não autorizado');
    }

    try {
        const whereClause = {
            // Só aplica o filtro se busca for fornecida e não vazia
            ...(busca && busca.trim() !== '' && {
                nome: {
                    contains: busca.trim(),
                    mode: 'insensitive' as const, // Case-insensitive
                }
            }),
        };

        const [temas, total] = await Promise.all([
            prisma.tema.findMany({
                where: whereClause,
                orderBy: {
                    createdAt: 'desc',
                },
                include: {
                    professor: true,
                    Avaliacao: true,
                    _count: {
                        select: {
                            Avaliacao: {
                                where: { 
                                    status: { 
                                        in: ['ENVIADA', 'CORRIGIDA'] 
                                    }
                                }
                            }
                        }
                    }
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

export async function listarTemasProfessor(professorId: string, busca?: string, page: number = 1, limit: number = 12) {
    // if(!(await verificarSessaoProfessor(professorId))){
    //      throw new Error('Usuário não autorizado');
    // }

    try {
        const whereClause = {
            professorId: professorId,
            // Só aplica o filtro de nome se busca for fornecida e não vazia
            ...(busca && busca.trim() !== '' && {
                nome: {
                    contains: busca.trim(),
                    mode: 'insensitive' as const,
                },
            }),
        };

        const [temas, total] = await Promise.all([
            prisma.tema.findMany({
                where: whereClause,
                orderBy: {
                    createdAt: 'desc',
                },
                include: {
                    Avaliacao: true,
                    professor: true,
                    _count: {
                        select: {
                            Avaliacao: {
                                where: { 
                                    status: { 
                                        in: ['ENVIADA', 'CORRIGIDA'] 
                                    }
                                },
                            }
                        }
                    }
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

export async function listarTemasMes(month?: number, year?: number, professorId?: string) {
    const session = await auth.api.getSession({
        headers: await headers()
    })
    if (!session) {
        throw new Error("Usuário não autenticado")
    }
    if(session.user.role !== 'assistente' && session.user.role !== 'professor' && session.user.role !== 'admin') {
        throw new Error('Usuário não autorizado')
    }
    
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
            ...(professorId && { professorId }),
        };

        const temas = await prisma.tema.findMany({
            where: whereClause,
            orderBy: {
                nome: 'asc',
            },
            include: {
                professor: true,
                Avaliacao: true,
            }, // Limita o retorno a apenas 10 registros
        });

        return temas;
    } catch (error) {
        console.error("Erro ao listar temas:", error);
        throw error;
    }
}

export async function EditarTema(id: number, novoNome: string, entrega?: Date): Promise<Tema> {
    if (!(await verificarSessaoAdmin())) {
        throw new Error('Usuário não autorizado');
    }
    try {
        const temaEditado = await prisma.tema.update({
            where: {
                id,
            },
            data: {
                nome: novoNome,
                entrega: entrega,
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
    if (!(await verificarSessaoAdmin())) {
        throw new Error('Usuário não autorizado');
    }
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
    if (!(await verificarSessaoAdmin())) {
        throw new Error('Usuário não autorizado');
    }

    try {
        await prisma.$transaction([
            prisma.criterioAvaliacao.deleteMany({
                where: {
                    avaliacao: {
                        temaId: id
                    }
                }
            }),

            prisma.avaliacao.deleteMany({
                where: {
                    temaId: id,
                },
            }),

            prisma.tema.delete({
                where: {
                    id,
                },
            }),
        ]);

        revalidatePath('/professor/avaliacoes')
        revalidatePath('/professor')
        revalidatePath('/aluno/avaliacoes')
    } catch (error) {
        console.error("Erro ao deletar tema:", error);
        throw error;
    }
}

export async function ListarCriterios() {
    'use cache'

    cacheLife('days')

    cacheTag('listar-criterios')

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
    if (!(await verificarSessaoAdmin())) {
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
    updateTag('listar-criterios')
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
        await atualizarCache(`listar-avaliacoes-aluno-${alunoId}`);
        return avaliacao;
    } catch (error) {
        console.error("Erro ao adicionar avaliação:", error);
        throw error;
    }
}

export async function enviarRespostaAvaliacao(
    idAluno: string,
    idProfessor: string,
    idTema: number,
    resposta: string
) {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session?.user) {
        throw new Error('Usuário não autorizado');
    }

    if (session.user.id !== idAluno) {
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
                professorId: idProfessor,
                temaId: idTema,
                resposta: resposta,
                notaFinal: 0, // Default score
            },
        });
        
        await atualizarCache(`listar-avaliacoes-aluno-${idAluno}`);
        await atualizarCache(`listar-temas-disponiveis-${idAluno}`);

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
    if (!(await verificarSessaoAdmin())) {
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
                    feedback: data.feedback,
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
        await atualizarCache(`listar-avaliacoes-aluno-${data.alunoId}`);
        
        return transaction[1];
    } catch (error) {
        console.error("Erro ao editar avaliação:", error);
        throw error;
    }
}

export async function ListarAvaliacoesTemaId(temaId: number, busca?:string) {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session?.user) {
        throw new Error('Usuário não autorizado');
    }

    const whereClause = {
        temaId: temaId,
        // Só aplica o filtro de nome se busca for fornecida e não vazia
        ...(busca && busca.trim() !== '' && {
            aluno: {
                email: {
                    contains: busca.trim(),
                    mode: 'insensitive' as const,
                }
            }
        }),
    };
    
    const avaliacoes = await prisma.avaliacao.findMany({
        where: whereClause,
        orderBy: {
            createdAt: 'desc',
        },
        include: {
            tema: true,
            aluno: true,
            criterios: true
        }
    });

    return avaliacoes;
}

async function obterAvaliacoesAluno(alunoId: string, busca?: string, limit: number = 10, page: number = 1) {
    'use cache'
    cacheLife({stale: 1800})
    cacheTag(`listar-avaliacoes-aluno-${alunoId}`)

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

        const [avaliacoes, total, aggregate] = await Promise.all([
            prisma.avaliacao.findMany({
                where: whereClause,
                include: {
                    tema: true,
                    criterios: true,
                    aluno: true,
                    professor: {
                        select: {
                            name: true,
                            email: true,
                            image: true,
                            id: true,
                            especialidade: true
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc',
                },
                take: limit,
                skip: (page - 1) * limit,
            }),
            prisma.avaliacao.count({
                where: whereClause,
            }),
            prisma.avaliacao.aggregate({
                where: whereClause,
                _avg: {
                    notaFinal: true,
                },
            }),
        ]);

        const mediaGeral = (aggregate)._avg.notaFinal || 0;

        return {
            data: avaliacoes,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
                mediaGeral
            }
        };
    } catch (error) {
        console.error('Erro ao listar avaliações:', error);
        return {
            data: [],
            meta: {
                total: 0,
                page,
                limit,
                totalPages: 0,
                mediaGeral: 0
            }
        };
    }
}

export async function ListarAvaliacoesAlunoId(alunoId: string, busca?: string, limit: number = 10, page: number = 1) {
    const session = await auth.api.getSession({
        headers: await headers()
    })
    if (!session) {
        throw new Error("Usuário não autenticado")
    }

    if (session.user.id !== alunoId && session.user.role !== 'admin') {
        throw new Error('Acesso negado.');
    }
    return obterAvaliacoesAluno(alunoId, busca, limit, page);
}

async function obterTemasDisponiveis(alunoId: string, pagina: number = 1, limite: number = 10) {
    'use cache'
    cacheTag(`listar-temas-disponiveis-${alunoId}`)
    cacheLife({stale: 300})
   
    try {
        const [temas, total] = await Promise.all([
            prisma.tema.findMany({
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
                    createdAt: 'desc'
                },
                take: limite,
                skip: (pagina - 1) * limite
            }),
            prisma.tema.count({
                where: {
                    Avaliacao: {
                        none: {
                            alunoId: alunoId
                        }
                    },
                    disponivel: true
                },
            }
            )
        ])

        return {
            data: temas,
            meta: {
                total,
                pagina,
                limite,
                totalPaginas: Math.ceil(total / limite),
            }
        };
    } catch (error) {
        console.error("Erro ao listar temas disponíveis:", error);
        throw error;
    }
}


export async function listarTemasDisponiveis(alunoId: string, pagina: number = 1, limite: number = 10) {
    const session = await auth.api.getSession({
        headers: await headers()
    })
    if (!session) {
        throw new Error("Usuário não autenticado")
    }

    return obterTemasDisponiveis(alunoId, pagina, limite);
}

export async function DeletarAvaliacao(id: number) {
    if (!(await verificarSessaoAdmin())) {
        throw new Error('Usuário não autorizado');
    }
    try {
        // Busca o alunoId antes de deletar a avaliação para invalidar o cache dele corretamente
        const avaliacaoExistente = await prisma.avaliacao.findUnique({
            where: { id },
            select: { alunoId: true }
        });

        if (!avaliacaoExistente) {
            throw new Error('Avaliação não encontrada.');
        }

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

        await atualizarCache(`listar-avaliacoes-aluno-${avaliacaoExistente.alunoId}`);
    } catch (error) {
        console.error("Erro ao deletar avaliação:", error);
        throw error;
    }
}



  export async function ListarAvaliacoes(month?: number, year?: number, page: number = 1, limit: number = 10) {
    const session = await auth.api.getSession({
        headers: await headers()
    })
    if (!session) {
        throw new Error("Usuário não autenticado")
    }

    const role = session.user.role as string;
    if (role !== 'admin' && role !== 'assistente') {
        throw new Error('Usuário não autorizado');
    }

    const { startDate, endDate } = resolverIntervaloMes(month, year);

    try {
        const whereClause = {
            createdAt: {
                gte: startDate,
                lt: endDate,
            },
        };

        const [avaliacoes, total] = await Promise.all([
            prisma.avaliacao.findMany({
                where: whereClause,
                include: {
                    aluno: true,
                    criterios: true,
                    tema: true,
                },
                orderBy: {
                    createdAt: 'desc',
                },
                take: limit,
                skip: (page - 1) * limit,
            }),
            prisma.avaliacao.count({
                where: whereClause,
            })
        ]);

        return {
            data: avaliacoes,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            }
        };
    } catch (error) {
        console.error("Erro ao listar avaliações:", error);

        if (error instanceof Error) {
            throw new Error(`Falha ao buscar avaliações: ${error.message}`);
        }

        throw new Error('Erro desconhecido ao buscar avaliações');
    }
}

export async function listarTopAlunosUltimoTema(month?: number, year?: number, limiteTop: number = 10) {
    const session = await auth.api.getSession({
        headers: await headers()
    })
    if (!session) {
        throw new Error("Usuário não autenticado")
    }

    const role = session.user.role as string;
    if (role !== 'admin' && role !== 'assistente') {
        throw new Error('Usuário não autorizado');
    }

    const { startDate, endDate } = resolverIntervaloMes(month, year);

    try {
        // 1. Acha o maior temaId dentro do período — uma consulta que só
        //    traz um inteiro, em vez de trazer o mês inteiro pra achar o
        //    máximo em memória.
        const temaMaisRecente = await prisma.avaliacao.findFirst({
            where: { createdAt: { gte: startDate, lt: endDate } },
            orderBy: { temaId: 'desc' },
            select: { temaId: true },
        });

        if (!temaMaisRecente) return [];

        // 2. Só as avaliações CORRIGIDAS desse tema específico, dentro do
        //    mesmo período — replica exatamente o filtro original
        //    (temaId + status), que também ficava implicitamente restrito
        //    ao período porque o array de entrada já vinha filtrado assim.
        //    Universo bem menor que o mês inteiro: no máximo uma entrega
        //    por aluno, só pra esse tema — e só os campos do aluno que a
        //    UI usa, sem incluir criterios/tema.
        const avaliacoesDoTema = await prisma.avaliacao.findMany({
            where: {
                temaId: temaMaisRecente.temaId,
                status: 'CORRIGIDA',
                createdAt: { gte: startDate, lt: endDate },
            },
            include: {
                aluno: { select: { id: true, name: true, email: true, image: true } },
            },
            orderBy: { createdAt: 'asc' },
        });

        // 3. Mantém só a avaliação mais recente por aluno — mesma lógica do
        //    original: ordenado da mais antiga pra mais recente, a última
        //    ocorrência no Map sobrescreve as anteriores.
        const maisRecentePorAluno = new Map(
            avaliacoesDoTema.map((av) => [av.alunoId, av])
        );

        // 4. Ordena pela nota e corta no top N
        return Array.from(maisRecentePorAluno.values())
            .sort((a, b) => b.notaFinal - a.notaFinal)
            .slice(0, limiteTop)
            .map((av, index) => ({
                posicao: index + 1,
                alunoId: av.alunoId,
                nome: av.aluno.name,
                email: av.aluno.email || "",
                image: av.aluno.image || null,
                mediaFinal: Number.isFinite(av.notaFinal) ? av.notaFinal : 0,
            }));
    } catch (error) {
        console.error('Erro ao listar top alunos do tema mais recente:', error);
        throw error;
    }
}