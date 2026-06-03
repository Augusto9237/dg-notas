'use client'

import { Criterio, Prisma } from "@/app/generated/prisma"
import { ReactNode, useEffect, useState } from "react"
import useWebPush from "@/hooks/useWebPush"
import { ListarAvaliacoes, listarTemas } from "@/actions/avaliacao"
import { ContextoAssistente } from "./contexto-assistente"
import { atualizarCache, atualizarRota } from "@/actions/cache"

type AvaliacaoTema = Prisma.AvaliacaoGetPayload<{
    include: {
        aluno: true,
        criterios: true,
        tema: true,
    }
}>

type Mentoria = Prisma.MentoriaGetPayload<{
    include: {
        aluno: true,
        horario: {
            include: {
                slot: true
            }
        }
    }
}>

type Tema = Prisma.TemaGetPayload<{
    include: {
        professor: true
        Avaliacao: true
    }
}>

export type Aluno = Prisma.UserGetPayload<{
    include: {
        avaliacoesComoAluno: true,
    }
}>

interface AssistenteProvedorProps {
    children: ReactNode
    userId: string
    avaliacoes: {
        data: AvaliacaoTema[]
        meta: {
            limit: number;
            page: number;
            total: number;
            totalPages: number;
        }
    }
    temas: {
        data: Tema[]
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }
    criterios: Criterio[];
}

export const ProvedorAssistente = ({ children, userId, avaliacoes, temas, criterios }: AssistenteProvedorProps) => {
    const { notificacoes } = useWebPush({ userId })
    const [listaAvaliacoes, setListaAvaliacoes] = useState(avaliacoes);
    const [listaTemas, setListaTemas] = useState(temas);
    const [carregamento, setCarregamento] = useState(false);

    useEffect(() => {
        const handleNotification = async () => {
            if (!notificacoes?.data?.url) return;

            const url = notificacoes.data.url;
            setCarregamento(true);

            try {
                if (url === '/assistente/avaliacoes') {
                    const novasAvaliacoes = await ListarAvaliacoes(undefined, undefined, 1, 10);
                    const novosTemas = await listarTemas()
                    setListaAvaliacoes(novasAvaliacoes);
                    setListaTemas(novosTemas)

                }

                if (url === '/assistente/mentorias') {
                    await atualizarRota('/assistente/mentorias')
                }

                if (url === '/assistente/alunos') {
                    await atualizarCache('lista-alunos')
                }
            } catch (error) {
                console.error("Erro ao atualizar dados via notificação:", error);
            } finally {
                setCarregamento(false);
            }
        }

        handleNotification();
    }, [notificacoes])

    return (
        <ContextoAssistente.Provider value={{
            userId,
            listaAvaliacoes,
            listaTemas,
            notificacoes,
            listaCriterios: criterios
        }}>
            {children}
        </ContextoAssistente.Provider>

    )
}