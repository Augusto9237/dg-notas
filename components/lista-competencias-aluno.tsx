'use client'

import { Criterio, Prisma } from "@/app/generated/prisma"
import { CardCompetencia } from "./card-competencias"
import { Skeleton } from "./ui/skeleton"

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

type Avaliacao = Prisma.AvaliacaoGetPayload<{
    include: {
        aluno: true
        criterios: true
        tema: true
    }
}>

interface ListaCompetenciasAlunoProps {
    avaliacoes: Avaliacao[]
    criterios: Criterio[]
}

// ---------------------------------------------------------------------------
// Lógica de negócio — fora do componente: função pura, sem dependência de closure
// ---------------------------------------------------------------------------

function calcularMediasPorCriterio(avaliacoes: Avaliacao[], criterios: Criterio[]) {
    const pontuacoesPorCriterio = avaliacoes
        .flatMap(avaliacao => avaliacao.criterios)
        .reduce((acc, { criterioId, pontuacao }) => {
            acc[criterioId] = [...(acc[criterioId] ?? []), pontuacao]
            return acc
        }, {} as Record<number, number[]>)

    return criterios.map(criterio => {
        const pontuacoes = pontuacoesPorCriterio[criterio.id]
        const media = pontuacoes?.length
            ? pontuacoes.reduce((soma, p) => soma + p, 0) / pontuacoes.length
            : 0

        return { criterioId: criterio.id, media }
    })
}

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------

export function ListaCompetenciasAlunoSkeleton() {
    return (
        <ListaWrapper>
            {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton
                    key={i}
                    className="w-full rounded-lg max-sm:min-w-[90vw] min-h-[124px] h-full max-h-[124px]"
                />
            ))}
        </ListaWrapper>
    )
}

// ---------------------------------------------------------------------------
// Componente principal
// ---------------------------------------------------------------------------

export default function ListaCompetenciasAluno({ avaliacoes, criterios }: ListaCompetenciasAlunoProps) {
    const mediasPorCriterio = calcularMediasPorCriterio(avaliacoes, criterios)

    return (
        <ListaWrapper>
            {mediasPorCriterio.map((criterio) => (
                <div key={criterio.criterioId} className="w-full max-sm:min-w-[90vw]">
                    <CardCompetencia criterio={criterio} criterios={criterios} />
                </div>
            ))}
        </ListaWrapper>
    )
}

// ---------------------------------------------------------------------------
// Layout compartilhado
// ---------------------------------------------------------------------------

function ListaWrapper({ children }: { children: React.ReactNode }) {
    return (
        <div className="sm:space-y-4 max-sm:px-5 md:h-full max-sm:flex max-sm:gap-4 overflow-y-auto [&::-webkit-scrollbar]:hidden">
            {children}
        </div>
    )
}