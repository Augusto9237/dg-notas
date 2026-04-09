'use server'
import { prisma } from "@/lib/prisma"
import { cacheLife, cacheTag, revalidateTag, updateTag } from "next/cache"
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function adicionarInformacoes(nomePlataforma: string, slogan: string, emailContato: string, telefone: string, endereco: string, sobreCurso: string) {
      const session = await auth.api.getSession({
        headers: await headers()
    })
    
    if (!session) {
        throw new Error("Sessão não encontrada")
    }

    if (session.user.role !== 'admin') {
        throw new Error("Usuário não autorizado")
    }
    
    await prisma.configuracao.update({
        where: {
            id: 1 // Supondo que você tenha um ID único para as configurações
        },
        data: {
            nomePlataforma,
            slogan,
            emailContato,
            sobreCurso,
            telefone,
            endereco
        }
    })
    updateTag('configuracoes-app')
}

export async function adicionarLogo(
    logoAplicativo: string,
    logoSistema: string,
    favicon: string,
    coresSistema: { id?: number; cor: string; valor: string }[]
) {
    const session = await auth.api.getSession({
        headers: await headers()
    })
    
    if (!session) {
        throw new Error("Sessão não encontrada")
    }

    if (session.user.role !== 'admin') {
        throw new Error("Usuário não autorizado")
    }

    await prisma.$transaction(async (tx) => {
        await tx.configuracao.update({
            where: {
                id: 1 // Supondo que você tenha um ID único para as configurações
            },
            data: {
                logoAplicativo,
                logoSistema,
                favicon,
            },
        })

        // Apenas edita cores já existentes e já vinculadas à Configuracao(id=1)
        for (const corSistema of coresSistema ?? []) {
            if (!corSistema.id || corSistema.id <= 0) {
                throw new Error("Para editar cores existentes, é obrigatório informar o id de CorSistema.")
            }
            const resultado = await tx.corSistema.updateMany({
                where: {
                    id: corSistema.id,
                    configuracaos: { some: { id: 1 } },
                },
                data: {
                    cor: corSistema.cor,
                    valor: corSistema.valor,
                },
            })

            if (resultado.count === 0) {
                throw new Error(
                    `CorSistema(id=${corSistema.id}) não encontrada ou não vinculada à Configuracao(id=1)`
                )
            }
        }
    })
    updateTag('configuracoes-app')
}

export async function adicionarFotoCapa(fotoCapa: string) {
    const session = await auth.api.getSession({
        headers: await headers()
    })
    
    if (!session) {
        throw new Error("Sessão não encontrada")
    }

    if (session.user.role !== 'admin') {
        throw new Error("Usuário não autorizado")
    }
    
    await prisma.configuracao.update({
        where: {
            id: 1 // Supondo que você tenha um ID único para as configurações
        },
        data: {
            fotoCapa
        }
    })
    updateTag('configuracoes-app')

}

export async function obterInformacoes() {
    'use cache';
    
    cacheLife('days')

    cacheTag('configuracoes-app')

    const configuracao = await prisma.configuracao.findUnique({
        where: {
            id: 1
        },
        include: {
            coresSistema: true,
        },
    })
    return configuracao
}