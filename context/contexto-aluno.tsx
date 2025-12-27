'use client';
import { Prisma } from "@/app/generated/prisma";
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
    setIsLoading?: Dispatch<SetStateAction<boolean>>;
    mediaGeral: number;
    setMediaGeral?: Dispatch<SetStateAction<number>>;
    totalRedacoes: number;
    setTotalRedacoes?: Dispatch<SetStateAction<number>>;
    totalMentorias: number;
    setTotalMentorias?: Dispatch<SetStateAction<number>>;
    listaAvaliacoes: AvaliacaoTema[];
    listaMentorias: Mentoria[];
    listaTemas: Tema[];
}

export const ContextoAluno = createContext<ContextoAlunoProps>(null!);