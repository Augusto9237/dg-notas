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

interface ContextoProfessorProps {
    userId: string
    listaAvaliacoes: AvaliacaoTema[]
    listaMentorias: Mentoria[]
    listaTemas: Tema[]
    listaAlunos: Aluno[]
}

export const ContextoProfessor = createContext<ContextoProfessorProps>(null!);