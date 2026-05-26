'use client'

import { Criterio, Prisma } from "@/app/generated/prisma";
import { createContext } from "react";
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


export type Notificacoes = {
    title: string;
    body: any;
    data: any;
} | null

interface ContextoAdminProps {
    configuracoes: Configuracao
    userId: string
    listaAvaliacoes: {
        data: AvaliacaoTema[]
        meta: {
            limit: number;
            page: number;
            total: number;
            totalPages: number;
        }
    }
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

export const ContextoAdmin = createContext<ContextoAdminProps>(null!);