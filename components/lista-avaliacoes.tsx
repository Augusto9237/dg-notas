'use client'

import { Criterio } from "@/app/generated/prisma";
import { CardAvaliacao, AvaliacaoCardProp } from "./card-avaliacao";
import { Spinner } from "./ui/spinner";
import InfiniteScroll from "./ui/infinite-scroll";

interface ListaAvaliacoesProps {
    avaliacoesIniciais: AvaliacaoCardProp[];
    criteriosIniciais: Criterio[];
    hasMore: boolean;
    loading: boolean;
    nextAvaliacoes: () => void;
}

export function ListaAvaliacoes({ 
    avaliacoesIniciais, 
    criteriosIniciais, 
    hasMore, 
    loading, 
    nextAvaliacoes 
}: ListaAvaliacoesProps) {
    return (
        <div className="flex flex-col gap-4 min-[1025px]:grid min-[1025px]:grid-cols-3">
            {avaliacoesIniciais.map((avaliacao) => (
                <CardAvaliacao
                    key={avaliacao.id}
                    avaliacao={avaliacao}
                    criterios={criteriosIniciais}
                />
            ))}
            
            <div className="flex items-center justify-center col-span-full">
                <InfiniteScroll 
                    hasMore={hasMore} 
                    isLoading={loading} 
                    next={nextAvaliacoes} 
                    threshold={0.5}
                >
                    {hasMore && <Spinner />}
                </InfiniteScroll>
            </div>
        </div>
    )
}