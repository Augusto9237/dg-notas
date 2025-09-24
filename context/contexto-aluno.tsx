'use client';
import { Dispatch, SetStateAction, createContext } from "react";

export interface ContextoAlunoProps {
    isLoading: boolean;
    setIsLoading?: Dispatch<SetStateAction<boolean>>;
    mediaGeral: number;
    setMediaGeral?: Dispatch<SetStateAction<number>>;
    totalRedacoes: number;
    setTotalRedacoes?: Dispatch<SetStateAction<number>>;
    totalMentorias: number;
    setTotalMentorias?: Dispatch<SetStateAction<number>>;
    fetchAvaliacoes: () => Promise<void>
}

export const ContextoAluno = createContext<ContextoAlunoProps>(null!);