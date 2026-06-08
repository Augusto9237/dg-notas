'use client';
import {Prisma } from "@/app/generated/prisma";
import { createContext } from "react";


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

export interface ContextoAlunoProps {
    notificacoes: {
        title: string;
        body: any;
        data: any;
    } | null
}

export const ContextoAluno = createContext<ContextoAlunoProps>(null!);