'use client'

import { Prisma } from "@/app/generated/prisma"
import { ReactNode, useEffect, useState } from "react"
import { ContextoProfessor } from "./contexto-professor"

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

interface ProfessorProviderProps {
    children: ReactNode
    userId: string
    avaliacoes: AvaliacaoTema[]
    mentorias: Mentoria[]
    temas: Tema[]
    alunos: Aluno[]
}

export const ProverdorProfessor = ({ children, userId, avaliacoes, mentorias, temas, alunos }: ProfessorProviderProps) => {
    const [listaAvaliacoes, setListaAvaliacoes] = useState<AvaliacaoTema[]>([]);
    const [listaMentorias, setListaMentorias] = useState<Mentoria[]>([]);
    const [listaTemas, setListaTemas] = useState<Tema[]>([]);
    const [listaAlunos, setListaAlunos] = useState<Aluno[]>([]);

    useEffect(() => {
        setListaAvaliacoes(avaliacoes);
        setListaMentorias(mentorias);
        setListaTemas(temas);
        setListaAlunos(alunos);
    }, [avaliacoes, mentorias, temas, alunos]);

    return (
        <ContextoProfessor.Provider value={{
            userId,
            listaAvaliacoes,
            listaMentorias,
            listaTemas,
            listaAlunos
        }}>
            {children}
        </ContextoProfessor.Provider>

    )
}