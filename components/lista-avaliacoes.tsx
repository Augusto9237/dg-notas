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

    if (carregando) {
        return (
            <div className="gap-4 min-[1025px]:grid min-[1025px]:grid-cols-3">
                {[1, 2, 3].map((index) => (
                    <Card
                        className="cursor-pointer hover:shadow-md transition-shadow p-0 min-h-[164px] h-full max-h-[164px] gap-0 relative"
                        key={index}
                    >
                        <CardContent className="p-4 relative h-full">
                            <div className="space-y-2.5">
                                <Skeleton className="w-[75%] h-[0.875rem]" />
                                <Skeleton className="w-[50%] h-[0.75rem]" />
                                <Skeleton className="w-[25%] h-[0.75rem]" />
                            </div>
                        </CardContent>
                        <CardFooter className="px-4 pb-4 absolute inset-x-0 bottom-0">
                            <Skeleton className="w-full h-8" />
                        </CardFooter>
                    </Card>
                ))}
            </div>
        );
    }

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