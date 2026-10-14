import { prisma } from '@/lib/prisma';
import { Elysia, t } from 'elysia'

export const app = new Elysia({ prefix: '/api' })
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
    .post('/', ({ body }) => body, {
        body: t.Object({
            name: t.String()
        })
    })

export const GET = app.fetch;
export const POST = app.fetch;

export type App = typeof app;
