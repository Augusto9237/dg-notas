'use client'

import { ReactNode, useEffect, useMemo, useState } from "react";
import { ContextoAluno, Mentoria } from "./contexto-aluno";
import { ListarAvaliacoesAlunoId, ListarTemasDisponiveis } from "@/actions/avaliacao";
import { listarMentoriasAluno } from "@/actions/mentoria";
import { Prisma } from "@/app/generated/prisma";
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
    avaliacoes: AvaliacaoTema[]
    mentorias: Mentoria[]
    temas: Tema[]
}

export const ProvedorAluno = ({ children, userId, avaliacoes, mentorias, temas }: AlunoProviderProps) => {
    const { notificacoes } = useWebPush({ userId });
    const [isLoading, setIsLoading] = useState(false);

    const [listaAvaliacoes, setListaAvaliacoes] = useState<AvaliacaoTema[]>(avaliacoes || []);
    const [listaMentorias, setListaMentorias] = useState<Mentoria[]>(mentorias || []);
    const [listaTemas, setListaTemas] = useState<Tema[]>(temas || []);

    // Atualiza o estado se as props mudarem (ex: revalidação do servidor)
    useEffect(() => {
        setListaAvaliacoes(avaliacoes || []);
        setListaMentorias(mentorias || []);
        setListaTemas(temas || []);
    }, [avaliacoes, mentorias, temas]);

    // Cálculos derivados otimizados
    const { mediaGeral, totalRedacoes } = useMemo(() => {
        const total = listaAvaliacoes.length;
        const soma = listaAvaliacoes.reduce((acc, curr) => acc + curr.notaFinal, 0);
        return {
            mediaGeral: total > 0 ? soma / total : 0,
            totalRedacoes: total
        };
    }, [listaAvaliacoes]);

    const totalMentorias = useMemo(() => listaMentorias.length, [listaMentorias]);

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
    }, [notificacoes, userId]);

    return (
        <ContextoAluno.Provider value={{
            isLoading,
            mediaGeral,
            totalRedacoes,
            totalMentorias,
            listaAvaliacoes,
            listaMentorias,
            listaTemas
        }}>
            {children}
        </ContextoAluno.Provider>
    )
}