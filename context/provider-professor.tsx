'use client'

import { Criterio, Prisma } from "@/app/generated/prisma"
import { ReactNode, useEffect, useState } from "react"
import { ContextoProfessor } from "./contexto-professor"
import useWebPush from "@/hooks/useWebPush"
import { listarMentoriasMes } from "@/actions/mentoria"
import { ListarAvaliacoes, listarTemas } from "@/actions/avaliacao"

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
        Avaliacao: true
    }
}>

export type Aluno = Prisma.UserGetPayload<{
    include: {
        avaliacoesComoAluno: true,
    }
}>

interface ProfessorProviderProps {
    children: ReactNode
    configuracoes: Configuracao
    userId: string
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

export const ProvedorProfessor = ({ children, configuracoes, userId, mentorias, temas, criterios }: ProfessorProviderProps) => {
    const { notificacoes } = useWebPush({ userId })
    const [listaMentorias, setListaMentorias] = useState(mentorias);
    const [listaTemas, setListaTemas] = useState(temas);

    const [carregamento, setCarregamento] = useState(false);

    useEffect(() => {
        const handleNotification = async () => {
            if (!notificacoes?.data?.url) return;

            const url = notificacoes.data.url;
            setCarregamento(true);

            try {
                if (url === '/professor/avaliacoes') {
                    const novasAvaliacoes = await ListarAvaliacoes(undefined, undefined, 1, 10);
                    const novosTemas = await listarTemas()
                    setListaTemas(novosTemas)

                }

                if (url === '/professor/mentorias') {
                    const novasMentorias = await listarMentoriasMes()
                    setListaMentorias(novasMentorias);
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
        <ContextoProfessor.Provider value={{
            configuracoes,
            userId,
            listaMentorias,
            listaTemas,
            notificacoes,
            listaCriterios: criterios
        }}>
            {children}
        </ContextoProfessor.Provider>

    )
}