'use client'

import { Prisma } from "@/app/generated/prisma"
import { ReactNode, useEffect, useState } from "react"
import { ContextoProfessor } from "./contexto-professor"
import useWebPush from "@/hooks/useWebPush"
import { listarMentoriasMes } from "@/actions/mentoria"
import { ListarAvaliacoes } from "@/actions/avaliacao"

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
    }
}>

export type Aluno = Prisma.UserGetPayload<{
    include: {
        avaliacoesComoAluno: true,
    }
}>

interface ProfessorProviderProps {
    children: ReactNode
    userId: string
    avaliacoes: AvaliacaoTema[]
    mentorias: Mentoria[]
    temas: Tema[]
    alunos: Aluno[]
}

export const ProverdorProfessor = ({ children, userId, avaliacoes, mentorias, temas, alunos }: ProfessorProviderProps) => {
    const { notificacoes } = useWebPush({ userId })
    const [listaAvaliacoes, setListaAvaliacoes] = useState<AvaliacaoTema[]>([]);
    const [listaMentorias, setListaMentorias] = useState<Mentoria[]>([]);
    const [listaTemas, setListaTemas] = useState<Tema[]>([]);
    const [listaAlunos, setListaAlunos] = useState<Aluno[]>([]);

    const [carregamento, setCarregamento] = useState(false);

    useEffect(() => {
        setListaAvaliacoes(avaliacoes);
        setListaMentorias(mentorias);
        setListaTemas(temas);
        setListaAlunos(alunos);
    }, [avaliacoes, mentorias, temas, alunos]);

    useEffect(() => {
        const handleNotification = async () => {
            if (!notificacoes?.data?.url) return;

            const url = notificacoes.data.url;
            setCarregamento(true);

            try {
                if (url === '/professor/avaliacoes') {
                    const novasAvaliacoes = await ListarAvaliacoes()
                    setListaAvaliacoes(novasAvaliacoes);
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
            userId,
            listaAvaliacoes,
            listaMentorias,
            listaTemas,
            listaAlunos
        }}>
            {children}
        </ContextoProfessor.Provider>

    )
}