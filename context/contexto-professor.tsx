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
    listaAvaliacoes: AvaliacaoTema[]
    listaMentorias: Mentoria[]
    listaTemas: Tema[]
    listaAlunos: Aluno[]
    notificacoes: Notificacoes
}

export const ContextoProfessor = createContext<ContextoProfessorProps>(null!);