'use client'

import { ReactNode, useEffect, useState } from "react";
import { ContextoAluno } from "./contexto-aluno";
import { authClient } from "@/lib/auth-client";
import { ListarAvaliacoesAlunoId } from "@/actions/avaliacao";
import { listarMentoriasAluno } from "@/actions/mentoria";
import { IncializarNotificacoes } from "@/components/inicializar-notificacoes";

interface AlunoProviderProps {
    children: ReactNode
}

export const ProvedorAluno = ({ children }: AlunoProviderProps) => {
    const { data: session } = authClient.useSession();
    const [isLoading, setIsLoading] = useState(false);
    const [mediaGeral, setMediaGeral] = useState(0)
    const [totalRedacoes, setTotalRedacoes] = useState(0)
    const [totalMentorias, setTotalMentorias] = useState(0)

    const fetchAvaliacoes = async () => {
        if (!session?.user.id) return;

        setIsLoading(true);
        try {
            const avaliacoes = await ListarAvaliacoesAlunoId(session.user.id)
            const somaNotas = avaliacoes.reduce((acc, avaliacao) => acc + avaliacao.notaFinal, 0);
            const media = avaliacoes.length > 0 ? somaNotas / avaliacoes.length : 0;
            const mentorias = await listarMentoriasAluno(session.user.id)

            setMediaGeral(media);
            setTotalRedacoes(avaliacoes.length);
            setTotalMentorias(mentorias.length)
        } catch (error) {
            console.error("Erro ao buscar avaliações:", error);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        if (session?.user.id) {
            fetchAvaliacoes();
        }
    }, [session?.user.id]);

    return (
        <ContextoAluno.Provider value={
            {
                isLoading,
                mediaGeral,
                totalRedacoes,
                totalMentorias,
                fetchAvaliacoes
            }
        }>
            <IncializarNotificacoes />
            {children}
        </ContextoAluno.Provider>
    )
}