'use client'

import { ListarAvaliacoesAlunoId } from "@/actions/avaliacao";
import { Criterio, Prisma } from "@/app/generated/prisma";
import { ContextoAluno } from "@/context/contexto-aluno";
import { useContext, useEffect, useState } from "react";
import { CardCompetencia } from "./card-competencias";
import { authClient } from "@/lib/auth-client";

type Avaliacao = Prisma.AvaliacaoGetPayload<{
    include: {
        aluno: true,
        criterios: true,
        tema: true,
    }
}>

interface Props {
    avaliacoes: Avaliacao[]
}
export function ListaCompetenciasAluno({ avaliacoes }: Props) {
    const { criterios, notificacoes } = useContext(ContextoAluno);
    const { data: session } = authClient.useSession();
    const [listaAvaliacoes, setListaAvaliacoes] = useState<Avaliacao[]>([]);

    useEffect(() => {
        setListaAvaliacoes(avaliacoes);
    }, [avaliacoes]);

    useEffect(() => {
        async function fetchAvaliacoes() {
            if (!notificacoes?.data?.url) return;

            const url = notificacoes.data.url;
            if (url === '/aluno/avaliacoes') {
                const novasAvaliacoes = await ListarAvaliacoesAlunoId(session?.user.id!, '', 10000, 1)
                setListaAvaliacoes(novasAvaliacoes.data);
            }
        }
        fetchAvaliacoes();
    }, []);

    function calcularMediasPorCriterio(
        avaliacoes: Avaliacao[],
        criterios: Criterio[]
    ) {
        const scoresByCriterio = avaliacoes
            .flatMap(a => a.criterios)
            .reduce((acc, c) => {
                acc[c.criterioId] = [...(acc[c.criterioId] || []), c.pontuacao];
                return acc;
            }, {} as Record<number, number[]>);

        return criterios.map(criterio => {
            const scores = scoresByCriterio[criterio.id];
            const media = (scores && scores.length > 0)
                ? scores.reduce((sum, score) => sum + score, 0) / scores.length
                : 0;
            return { criterioId: criterio.id, media };
        });
    }

    const mediasPorCriterio = calcularMediasPorCriterio(listaAvaliacoes, criterios);
    return (
        <div className='sm:space-y-4 max-sm:px-5 md:h-full max-sm:flex max-sm:gap-4 overflow-y-auto [&::-webkit-scrollbar]:hidden'>
            {mediasPorCriterio.map((criterio, i) => (
                <div key={criterio.criterioId} className="w-full max-sm:min-w-[90vw]">
                    <CardCompetencia criterio={criterio} criterios={criterios} />
                </div>
            ))}
        </div>
    )
}