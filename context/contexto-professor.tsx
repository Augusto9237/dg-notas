'use client'

import { Criterio, Prisma } from "@/app/generated/prisma";
import { createContext } from "react";
type Configuracao = Prisma.ConfiguracaoGetPayload<{
    include: {
        coresSistema: true,
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

export type Notificacoes = {
    title: string;
    body: any;
    data: any;
} | null

interface ContextoProfessorProps {
    configuracoes: Configuracao
    userId: string
    listaMentorias: Mentoria[]
    listaTemas: {
        data: Tema[]
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }
    listaCriterios: Criterio[];
    notificacoes: Notificacoes
}

export const ContextoProfessor = createContext<ContextoProfessorProps>(null!);