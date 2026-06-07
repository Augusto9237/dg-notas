'use client'

import { Criterio, Prisma } from "@/app/generated/prisma"
import { ReactNode, useEffect, useState } from "react"
import { ContextoAdmin } from "./contexto-admin"
import useWebPush from "@/hooks/useWebPush"
import { atualizarCache, atualizarRota } from "@/actions/cache"

type Configuracao = Prisma.ConfiguracaoGetPayload<{
    include: {
        coresSistema: true,
    }
}>


type Tema = Prisma.TemaGetPayload<{
    include: {
        professor: true
        Avaliacao: true
    }
}>


interface AdminProviderProps {
    children: ReactNode
    configuracoes: Configuracao
    userId: string
}

export const ProvedorAdmin = ({ children, configuracoes, userId }: AdminProviderProps) => {
    const { notificacoes } = useWebPush({ userId })

    useEffect(() => {
        const handleNotification = async () => {
            if (!notificacoes?.data?.url) return;

            const url = notificacoes.data.url;

            try {
                if (url === '/admin/avaliacoes') {
                    await atualizarRota('/admin/avaliacoes')
                }

                if (url === '/admin/mentorias') {
                    await atualizarRota('/admin/mentorias')
                }

                if (url === '/admin/alunos') {
                    await atualizarCache('lista-alunos')
                }
            } catch (error) {
                console.error("Erro ao atualizar dados via notificação:", error);
            }
        }

        handleNotification();
    }, [notificacoes])

    return (
        <ContextoAdmin.Provider value={{
            configuracoes,
            userId,
            notificacoes,
        }}>
            {children}
        </ContextoAdmin.Provider>

    )
}