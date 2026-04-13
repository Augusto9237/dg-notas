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
        professor: true
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
    alunos: {
        data: Aluno[]
        total: number
        pagina: number
        limite: number
        totalPaginas: number
    }
}

export const ProvedorProfessor = ({ children, configuracoes, userId, avaliacoes, mentorias, temas, alunos, criterios }: ProfessorProviderProps) => {
    const { notificacoes } = useWebPush({ userId })
    const [listaAvaliacoes, setListaAvaliacoes] = useState(avaliacoes);
    const [listaMentorias, setListaMentorias] = useState(mentorias);
    const [listaTemas, setListaTemas] = useState(temas);
    const [listaAlunos, setListaAlunos] = useState(alunos.data);

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
                    setListaAvaliacoes(novasAvaliacoes);
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
            listaAvaliacoes,
            listaMentorias,
            listaTemas,
            listaAlunos,
            totalPaginas: alunos.totalPaginas,
            pagina: alunos.pagina,
            limite: alunos.limite,
            notificacoes,
            listaCriterios: criterios
        }}>
            {children}
        </ContextoProfessor.Provider>

    )
}