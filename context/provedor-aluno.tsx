'use client'

import { ReactNode, useEffect, useState } from "react";
import { ContextoAluno } from "./contexto-aluno";
import { ListarAvaliacoesAlunoId, ListarTemasDisponiveis } from "@/actions/avaliacao";
import { listarMentoriasAluno } from "@/actions/mentoria";
import { Criterio, Prisma } from "@/app/generated/prisma";
import useWebPush from "@/hooks/useWebPush";

type AvaliacaoTema = Prisma.AvaliacaoGetPayload<{
    include: {
        aluno: true,
        criterios: true,
        tema: true,
    }
}>

type Tema = Prisma.TemaGetPayload<{
    include: {
        professor: true
    }
}>

export type Mentoria = Prisma.MentoriaGetPayload<{
    include: {
        aluno: true,
        professor: true,
        horario: {
            include: {
                slot: true
            }
        }
    }
}>

interface AlunoProviderProps {
    children: ReactNode
    userId: string
    avaliacoes: {
        data: AvaliacaoTema[]
        meta: {
            total: number,
            page: number,
            limit: number,
            totalPages: number,
        }
    }
    mentorias: {
        data: Mentoria[]
        meta: {
            total: number,
            page: number,
            limit: number,
            totalPages: number,
        }
    }
    temas: {
        data: Tema[]
        meta: {
            total: number;
            pagina: number;
            limite: number;
            totalPaginas: number;
        };
    }
    criterios: Criterio[]
}

export const ProvedorAluno = ({ children, userId, avaliacoes, mentorias, temas, criterios }: AlunoProviderProps) => {
    const { notificacoes } = useWebPush({ userId });
    const [isLoading, setIsLoading] = useState(false);
    const [listaAvaliacoes, setListaAvaliacoes] = useState<AlunoProviderProps['avaliacoes']>({ data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } });
    const [listaMentorias, setListaMentorias] = useState<AlunoProviderProps['mentorias']>({ data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } });
    const [listaTemas, setListaTemas] = useState<AlunoProviderProps['temas']>({ data: [], meta: { total: 0, pagina: 1, limite: 10, totalPaginas: 0 } });

    // Atualiza o estado se as props mudarem (ex: revalidação do servidor)
    useEffect(() => {
        setListaAvaliacoes(avaliacoes || []);
        setListaMentorias(mentorias);
        setListaTemas(temas || []);
    }, [avaliacoes, mentorias, temas]);


    // Gerenciamento de Notificações
    useEffect(() => {
        const handleNotification = async () => {
            if (!notificacoes?.data?.url) return;

            const url = notificacoes.data.url;
            setIsLoading(true);

            try {
                if (url === '/aluno/avaliacoes') {
                    const [novasAvaliacoes, novosTemas] = await Promise.all([
                        ListarAvaliacoesAlunoId(userId),
                        ListarTemasDisponiveis(userId)
                    ]);
                    setListaAvaliacoes(novasAvaliacoes);
                    setListaTemas(novosTemas);
                }

                if (url === '/aluno/mentorias') {
                    const novasMentorias = await listarMentoriasAluno(userId);
                    setListaMentorias(novasMentorias);
                }
            } catch (error) {
                console.error("Erro ao atualizar dados via notificação:", error);
            } finally {
                setIsLoading(false);
            }
        };

        handleNotification();
    }, [notificacoes]);

    return (
        <ContextoAluno.Provider value={{
            isLoading,
            listaAvaliacoes,
            listaMentorias,
            listaTemas,
            criterios,
            notificacoes
        }}>
            {children}
        </ContextoAluno.Provider>
    )
}