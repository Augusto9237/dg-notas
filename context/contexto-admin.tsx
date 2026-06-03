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