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
            <div className="flex items-center justify-center py-8">
                <div className="animate-pulse space-y-4">
                    {[1, 2, 3].map((index) => (
                        <div 
                            key={index}
                            className="h-[164px] w-full bg-muted rounded-lg"
                            style={{ minWidth: '300px' }}
                        />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {avaliacoes.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                    Nenhuma avaliação encontrada
                </div>
            ) : (
                avaliacoes.map((avaliacao) => (
                    <CardAvaliacao 
                        key={avaliacao.id} 
                        avaliacao={avaliacao} 
                        criterios={criterios} 
                    />
                ))
            )}
        </div>
    );
}