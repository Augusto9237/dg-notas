'use client'

import { Avaliacao, Criterio, CriterioAvaliacao, Tema } from "@/app/generated/prisma";
import { useEffect, useState } from "react";
import { CardAvaliacao } from "./card-avaliacao";

interface ListaAvaliacoesProps {
    avaliacoesIniciais: (Avaliacao & {
        tema: Tema;
        criterios: CriterioAvaliacao[];
    })[];
    criteriosIniciais: Criterio[];
}

export function ListaAvaliacoes({ avaliacoesIniciais, criteriosIniciais }: ListaAvaliacoesProps) {
    const [avaliacoes, setAvaliacoes] = useState<ListaAvaliacoesProps['avaliacoesIniciais']>([]);
    const [criterios, setCriterios] = useState<Criterio[]>([]);
    const [carregando, setCarregando] = useState(false);

    useEffect(() => {
        setAvaliacoes(avaliacoesIniciais);
        setCriterios(criteriosIniciais);
    }, [avaliacoesIniciais, criteriosIniciais]);

    return (
        <div>
            {avaliacoes.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                    Nenhuma avaliação encontrada
                </div>
            ) : (
                avaliacoes.map((avaliacao) => (
                    <CardAvaliacao key={avaliacao.id} avaliacao={avaliacao} criterios={criterios} />
                ))
            )}
        </div>
    )
}