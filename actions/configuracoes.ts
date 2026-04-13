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
    
    const configuracao = await prisma.configuracao.findFirst()
    if (!configuracao) {
        throw new Error('Registro de configurações não encontrado')
    }

    await prisma.configuracao.update({
        where: { id: configuracao.id },
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
        const configuracao = await tx.configuracao.findFirst()
        if (!configuracao) {
            throw new Error('Registro de configurações não encontrado')
        }

        await tx.configuracao.update({
            where: { id: configuracao.id },
            data: {
                logoAplicativo,
                logoSistema,
                favicon,
            },
        })

        for (const corSistema of coresSistema ?? []) {
            if (!corSistema.id || corSistema.id <= 0) {
                throw new Error("Para editar cores existentes, é obrigatório informar o id de CorSistema.")
            }
            const resultado = await tx.corSistema.updateMany({
                where: {
                    id: corSistema.id,
                    configuracaos: { some: { id: configuracao.id } },
                },
                data: {
                    cor: corSistema.cor,
                    valor: corSistema.valor,
                },
            })

            if (resultado.count === 0) {
                throw new Error(
                    `CorSistema(id=${corSistema.id}) não encontrada ou não vinculada à configuração ativa`
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
    
    const configuracao = await prisma.configuracao.findFirst()
    if (!configuracao) {
        throw new Error('Registro de configurações não encontrado')
    }

    await prisma.configuracao.update({
        where: { id: configuracao.id },
        data: { fotoCapa }
    })
    updateTag('configuracoes-app')

}

export async function obterInformacoes() {
    'use cache';
    
    cacheLife('days')

    cacheTag('configuracoes-app')

    const configuracao = await prisma.configuracao.findFirst({
        include: {
            coresSistema: true,
        },
    })
    return configuracao
}