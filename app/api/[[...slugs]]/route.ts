import { obterUrlImagem } from '@/lib/obter-imagem';
import { prisma } from '@/lib/prisma';
import { Elysia, t } from 'elysia'
import * as z from "zod"

const schemaVideoaula = z.object({
  id: z.number().int(),
  titulo: z.string(),
  descricao: z.string(),
  urlVideo: z.string(),
  urlThumbnail: z.string(),
  duracao: z.number().int(),
  moduloId: z.number().int(),
  professorId: z.string().nullable(),
  tags: z.array(z.string()),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const app = new Elysia({ prefix: '/api' })
    .get('/professores', async ({ query }) => {
        const { busca, page = 1, limit = 12 } = query;
         try {
                const skip = (page - 1) * limit;
                const whereClause = {
                    role: {
                        in: ['admin', 'professor']
                    },
                    ...(busca && busca.trim() !== '' && {
                        name: {
                            contains: busca.trim(),
                            mode: 'insensitive' as const,
                        },
                    }),
                };
        
                const [professores, total] = await prisma.$transaction([
                    prisma.user.findMany({
                        where: whereClause,
                        take: limit,
                        skip: skip,
                        orderBy: {
                            name: 'asc'
                        },
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            image: true,
                            telefone: true,
                            especialidade: true,
                            bio: true
                        }
                    }),
                    prisma.user.count({
                        where: whereClause,
                    })
                ]);
        
                const professoresComImagem = await Promise.all(
                    professores.map(async (professor) => ({
                        ...professor,
                        image: professor.image ? await obterUrlImagem(professor.image) : null,
                    }))
                );
        
                return {
                    data: professoresComImagem,
                    total,
                    pagina: page,
                    limite: limit,
                    totalPaginas: Math.ceil(total / limit)
                };
            } catch (error) {
                console.error("Erro ao listar professores:", error);
                throw error;
            }
    }, {
        query: t.Object({
            busca: t.Optional(t.String()),
            page: t.Optional(t.Numeric({ default: 1 })),
            limit: t.Optional(t.Numeric({ default: 12 })),
        })
    })
    .get('/alunos', async ({ query }) => {
        const { busca, page = 1, limit = 12 } = query;
        const skip = (page - 1) * limit;
        
         const clausulaDeFiltro = {
        accounts: {
          every: {
            providerId: 'google'
          }
        },
        banned: false,
        ...(busca && busca.trim() !== '' && {
          email: {
            contains: busca.trim(),
            mode: 'insensitive' as const,
          },
        }),
      };

  const [alunos, total, totalPendentes] = await Promise.all([
        prisma.user.findMany({
          where: clausulaDeFiltro,
          take: limit,
          skip,
          select: {
            id: true,
            image: true,
            name: true,
            email: true,
            telefone: true,
            matriculado: true,
            avaliacoesComoAluno: true,
          },
          orderBy: { name: 'asc' },
        }),
        prisma.user.count({ where: clausulaDeFiltro }),
        prisma.user.count({ where: { ...clausulaDeFiltro, matriculado: { not: true } } }),
      ]);

        return { data: alunos, total: total, totalPendentes: totalPendentes, totalPaginas: Math.ceil(total / limit), limite: limit, pagina: page };
    }, {
        query: t.Object({
            busca: t.Optional(t.String()),
            page: t.Optional(t.Numeric({ default: 1 })),
            limit: t.Optional(t.Numeric({ default: 12 })),
        })
    })
    .get('/criterios', async () => {
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
    })
    .get('/modulos', async () => {
      try {
          const modulos = await prisma.modulo.findMany({
            orderBy: {
              id: 'asc',
            },
            include: {
              videoaulas: true,
            },
          })
          return modulos;
        } catch (error) {
          console.error("Erro ao listar modulos:", error);
          throw error;
        }
    }, {
        response: z.array(
          z.object({
            id: z.number(),
            nome: z.string().max(255),
            descricao: z.string(),
            videoaulas: z.array(schemaVideoaula),
          })
        )
      })

export const GET = app.fetch;
export const POST = app.fetch;

export type App = typeof app;
