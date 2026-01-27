'use client'

import { ReactNode, useEffect, useMemo, useState } from "react";
import { ContextoAluno, Mentoria } from "./contexto-aluno";
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
    mentorias: Mentoria[]
    temas: Tema[]
    criterios: Criterio[]
}

export const ProvedorAluno = ({ children, userId, avaliacoes, mentorias, temas, criterios }: AlunoProviderProps) => {
    const { notificacoes } = useWebPush({ userId });
    const [isLoading, setIsLoading] = useState(false);
    const [listaAvaliacoes, setListaAvaliacoes] = useState<AlunoProviderProps['avaliacoes']>({ data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } });
    const [listaMentorias, setListaMentorias] = useState<Mentoria[]>([]);
    const [listaTemas, setListaTemas] = useState<Tema[]>([]);

    // Atualiza o estado se as props mudarem (ex: revalidação do servidor)
    useEffect(() => {
        setListaAvaliacoes(avaliacoes || []);
        setListaMentorias(mentorias || []);
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
                    setListaMentorias(novasMentorias.data);
                }
            } catch (error) {
                console.error("Erro ao atualizar dados via notificação:", error);
            } finally {
                setIsLoading(false);
            }
        };

        handleNotification();
    }, [notificacoes, userId]);

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