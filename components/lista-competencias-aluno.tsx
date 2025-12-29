'use client'

import { ListarAvaliacoesAlunoId } from "@/actions/avaliacao";
import { Criterio } from "@/app/generated/prisma";
import { ContextoAluno } from "@/context/contexto-aluno";
import { useContext } from "react";
import { CardCompetencia } from "./card-competencias";

interface Props {
    criterios: Criterio[]
}
export function ListaCompetenciasAluno({ criterios }: Props) {
    const { listaAvaliacoes } = useContext(ContextoAluno)

    function calcularMediasPorCriterio(avaliacoes: Awaited<ReturnType<typeof ListarAvaliacoesAlunoId>>) {
        const pontuacoesPorCriterio = avaliacoes
            .flatMap(avaliacao => avaliacao.criterios)
            .reduce((acc, criterio) => {
                if (!acc[criterio.criterioId]) {
                    acc[criterio.criterioId] = [];
                }
                acc[criterio.criterioId].push(criterio.pontuacao);
                return acc;
            }, {} as Record<number, number[]>);

        return Object.entries(pontuacoesPorCriterio).map(([criterioId, pontuacoes]) => ({
            criterioId: Number(criterioId),
            media: pontuacoes.reduce((sum, current) => sum + current, 0) / pontuacoes.length,
        }));
    }

    const mediasPorCriterio = calcularMediasPorCriterio(listaAvaliacoes);
    return (
        <div className='space-y-4 h-full overflow-y-auto pb-14 scrollbar-thin scrollbar-thumb-card scrollbar-track-background'>
            {mediasPorCriterio.map((criterio, i) => (
                <CardCompetencia key={i} criterio={criterio} criterios={criterios} />
            ))}
        </div>
    )
}