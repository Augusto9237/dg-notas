'use client'

import { Prisma } from "@/app/generated/prisma";
import { createContext } from "react";
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

type Aluno = Prisma.UserGetPayload<{
    include: {
        avaliacoesComoAluno: true,
    }
}>

export type Notificacoes = {
    title: string;
    body: any;
    data: any;
} | null

interface ContextoProfessorProps {
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
    listaAlunos: Aluno[]
    totalPaginas: number
    pagina: number
    limite: number
    notificacoes: Notificacoes
}

export const ContextoProfessor = createContext<ContextoProfessorProps>(null!);