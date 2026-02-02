'use client'

import { Avaliacao, Criterio, CriterioAvaliacao, Tema } from "@/app/generated/prisma";
import { useEffect, useState } from "react";
import { CardAvaliacao } from "./card-avaliacao";
import { Spinner } from "./ui/spinner";
import InfiniteScroll from "./ui/infinite-scroll";

interface ListaAvaliacoesProps {
    avaliacoesIniciais: (Avaliacao & {
        tema: Tema;
        criterios: CriterioAvaliacao[];
    })[];
    criteriosIniciais: Criterio[];
    hasMore: boolean;
    loading: boolean;
    nextAvaliacoes: () => void;
}

export function ListaAvaliacoes({ avaliacoesIniciais, criteriosIniciais, hasMore, loading, nextAvaliacoes }: ListaAvaliacoesProps) {
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
        <div className="flex flex-col gap-4 min-[1025px]:grid min-[1025px]:grid-cols-3">
            {avaliacoes.map((avaliacao) => (
                <CardAvaliacao
                    key={avaliacao.id}
                    avaliacao={avaliacao}
                    criterios={criterios}
                />
            ))}
            <div className="flex items-center justify-center col-span-full max-md:hidden">
                <InfiniteScroll hasMore={hasMore} isLoading={loading} next={nextAvaliacoes} threshold={1} >
                    {hasMore && <Spinner />}
                </InfiniteScroll>
            </div>
            <div className="flex items-center justify-center col-span-full min-md:hidden">
                <InfiniteScroll hasMore={hasMore} isLoading={loading} next={nextAvaliacoes} threshold={0.1} rootMargin="100px">
                    {hasMore && <Spinner />}
                </InfiniteScroll>
            </div>
        </div>
    )
}