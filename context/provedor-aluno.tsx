'use client'

import { ReactNode, useState } from "react";
import { ContextoAluno } from "./contexto-aluno";
import { Criterio, Prisma } from "@/app/generated/prisma";
import useWebPush from "@/hooks/useWebPush";


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
}

export const ProvedorAluno = ({ children, userId }: AlunoProviderProps) => {
    const { notificacoes } = useWebPush({ userId });

    return (
        <ContextoAluno.Provider value={{
            notificacoes
        }}>
            {children}
        </ContextoAluno.Provider>
    )
}