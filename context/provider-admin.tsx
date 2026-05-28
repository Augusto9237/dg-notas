'use client'

import { Criterio, Prisma } from "@/app/generated/prisma"
import { ReactNode, useEffect, useState } from "react"
import { ContextoAdmin } from "./contexto-admin"
import useWebPush from "@/hooks/useWebPush"
import { listarMentoriasMes } from "@/actions/mentoria"
import { ListarAvaliacoes, listarTemas } from "@/actions/avaliacao"
import { atualizarCache } from "@/actions/cache"

type Configuracao = Prisma.ConfiguracaoGetPayload<{
    include: {
        coresSistema: true,
    }
}>

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


interface AdminProviderProps {
    children: ReactNode
    configuracoes: Configuracao
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
    mentorias: Mentoria[]
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

export const ProvedorAdmin = ({ children, configuracoes, userId, avaliacoes, mentorias, temas, criterios }: AdminProviderProps) => {
    const { notificacoes } = useWebPush({ userId })
    const [listaAvaliacoes, setListaAvaliacoes] = useState(avaliacoes);
    const [listaMentorias, setListaMentorias] = useState(mentorias);
    const [listaTemas, setListaTemas] = useState(temas);


    const [carregamento, setCarregamento] = useState(false);

    useEffect(() => {
        const handleNotification = async () => {
            if (!notificacoes?.data?.url) return;

            const url = notificacoes.data.url;
            setCarregamento(true);

            try {
                if (url === '/admin/avaliacoes') {
                    const novasAvaliacoes = await ListarAvaliacoes(undefined, undefined, 1, 10);
                    const novosTemas = await listarTemas()
                    setListaAvaliacoes(novasAvaliacoes);
                    setListaTemas(novosTemas)

                }

                if (url === '/admin/mentorias') {
                    const novasMentorias = await listarMentoriasMes()
                    setListaMentorias(novasMentorias);
                }

                if (url === '/admin/alunos') {
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
        <ContextoAdmin.Provider value={{
            configuracoes,
            userId,
            listaAvaliacoes,
            listaMentorias,
            listaTemas,
            notificacoes,
            listaCriterios: criterios
        }}>
            {children}
        </ContextoAdmin.Provider>

    )
}