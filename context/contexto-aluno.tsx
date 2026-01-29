'use client';
import { Criterio, Prisma } from "@/app/generated/prisma";
import { Dispatch, SetStateAction, createContext } from "react";

type AvaliacaoTema = Prisma.AvaliacaoGetPayload<{
    include: {
        aluno: true,
        criterios: true,
        tema: true,
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

type Tema = Prisma.TemaGetPayload<{
    include: {
        professor: true
    }
}>

export interface ContextoAlunoProps {
    isLoading: boolean;
    listaAvaliacoes: {
        data: AvaliacaoTema[]
        meta: {
            total: number,
            page: number,
            limit: number,
            totalPages: number,
        }
    }
    listaMentorias: {
        data: Mentoria[]
        meta: {
            total: number,
            page: number,
            limit: number,
            totalPages: number,
        }
    },
    listaTemas: Tema[];
    criterios: Criterio[]
    notificacoes: {
        title: string;
        body: any;
        data: any;
    } | null
}

export const ContextoAluno = createContext<ContextoAlunoProps>(null!);