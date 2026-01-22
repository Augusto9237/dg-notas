'use client'

import { Avaliacao, Criterio, CriterioAvaliacao, Tema } from "@/app/generated/prisma";
import { useEffect, useState } from "react";
import { CardAvaliacao } from "./card-avaliacao";
import { Card, CardContent, CardFooter } from "./ui/card";
import { Skeleton } from "./ui/skeleton";

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
    const [carregando, setCarregando] = useState(true);

    useEffect(() => {
        const initializeData = async () => {
            try {
                setCarregando(true);
                // Simular um pequeno delay para evitar flickering na UI
                await new Promise(resolve => setTimeout(resolve, 100));

                setAvaliacoes(avaliacoesIniciais);
                setCriterios(criteriosIniciais);
            } catch (error) {
                console.error('Erro ao carregar dados:', error);
            } finally {
                setCarregando(false);
            }
        };

        initializeData();
    }, [avaliacoesIniciais, criteriosIniciais]);

    return (
        <div className="gap-4 min-[1025px]:grid min-[1025px]:grid-cols-3">
            {avaliacoes.map((avaliacao) => (
                <CardAvaliacao
                    key={avaliacao.id}
                    avaliacao={avaliacao}
                    criterios={criterios}
                />
            ))}
        </div>
    )
}