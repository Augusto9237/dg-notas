'use client'

import { ReactNode, useState } from "react";
import { ContextoAluno } from "./contexto-aluno";
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
type Avaliacoes = {
    data: AvaliacaoTema[]
    meta: {
        total: number,
        page: number,
        limit: number,
        totalPages: number,
    }
}

interface AlunoProviderProps {
    children: ReactNode
    userId: string
    criterios: Criterio[]
}

export const ProvedorAluno = ({ children, userId, criterios }: AlunoProviderProps) => {
    const { notificacoes } = useWebPush({ userId });
    const [isLoading, setIsLoading] = useState(false);
    const [listaAvaliacoes, setListaAvaliacoes] = useState<Avaliacoes>({ data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } });


    return (
        <ContextoAluno.Provider value={{
            isLoading,
            listaAvaliacoes,
            criterios,
            notificacoes
        }}>
            {children}
        </ContextoAluno.Provider>
    )
}