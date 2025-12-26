'use client'

import { ReactNode, useEffect, useState } from "react";
import { ContextoAluno } from "./contexto-aluno";
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

type Mentoria = Prisma.MentoriaGetPayload<{
    include: {
        aluno: true,
        professor: true,
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
    const { notificacoes } = useWebPush({ userId: userId as string });
    const [isLoading, setIsLoading] = useState(false);
    const [mediaGeral, setMediaGeral] = useState(0)
    const [listaAvaliacoes, setListaAvaliacoes] = useState<AvaliacaoTema[]>(avaliacoes || [])
    const [listaMentorias, setListaMentorias] = useState<Mentoria[]>(mentorias || [])
    const [listaTemas, setListaTemas] = useState<Tema[]>(temas || [])
    const [totalRedacoes, setTotalRedacoes] = useState(0);
    const [totalMentorias, setTotalMentorias] = useState(0);


    useEffect(() => {
        const updateAvaliacoes = async () => {
            if (userId && (avaliacoes.length > 0 || notificacoes?.data?.url === '/aluno/avaliacoes')) {
                const data = await ListarAvaliacoesAlunoId(userId);
                setListaAvaliacoes(data);
                const somaNotas = data.reduce((acc, avaliacao) => acc + avaliacao.notaFinal, 0);
                const media = data.length > 0 ? somaNotas / data.length : 0;
                setMediaGeral(media);
                setTotalRedacoes(data.length);
            }
        };
        const atualizarTemas = async () => {
            if (userId && (temas.length > 0 || notificacoes?.data?.url === '/aluno/avaliacoes')) {
                const data = await ListarTemasDisponiveis(userId);
                setListaTemas(data);
                setTotalMentorias(data.length);
            }
        };

        atualizarTemas();
        updateAvaliacoes();
    }, [userId, avaliacoes, notificacoes, temas]);

    useEffect(() => {
        const updateMentorias = async () => {
            if (userId && (mentorias.length > 0 || notificacoes?.data?.url === '/aluno/mentorias')) {
                const data = await listarMentoriasAluno(userId);
                setListaMentorias(data);
                setTotalMentorias(data.length);
            }
        };

        updateMentorias();
    }, [userId, mentorias, notificacoes]);

    return (
        <ContextoAluno.Provider value={
            {
                isLoading,
                mediaGeral,
                totalRedacoes,
                totalMentorias,
                listaAvaliacoes,
                listaMentorias,
                listaTemas
            }
        }>

            {children}
        </ContextoAluno.Provider>
    )
}