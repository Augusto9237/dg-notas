'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileX } from 'lucide-react';
import { ListaAvaliacoes } from '@/components/lista-avaliacoes';
import { CardNovoTema } from '@/components/card-novotema';
import { ContextoAluno } from '@/context/contexto-aluno';
import { useContext, useEffect, useState } from 'react';
import { Criterio, Prisma } from '@/app/generated/prisma';
import InfiniteScroll from './ui/infinite-scroll';
import { Spinner } from './ui/spinner';
import { ListarAvaliacoesAlunoId, ListarTemasDisponiveis } from '@/actions/avaliacao';
import { authClient } from '@/lib/auth-client';
import { Badge } from './ui/badge';

type Tema = Prisma.TemaGetPayload<{
    include: {
        professor: true
    }
}>

type AvaliacaoTema = Prisma.AvaliacaoGetPayload<{
    include: {
        aluno: true,
        criterios: true,
        tema: true,
    }
}>

interface ListaTemas {
    data: Tema[]
    meta: {
        total: number;
        pagina: number;
        limite: number;
        totalPaginas: number;
    };
}

interface ListaAvaliacoes {
    data: AvaliacaoTema[]
    meta: {
        total: number,
        page: number,
        limit: number,
        totalPages: number,
    }
}

export function TabelaAvaliacoesAluno() {
    const { listaAvaliacoes, listaTemas, criterios } = useContext(ContextoAluno);
    const [temas, setTemas] = useState<ListaTemas>({ data: [], meta: { total: 0, pagina: 1, limite: 10, totalPaginas: 0 } });
    const [avaliacoes, setAvaliacoes] = useState<ListaAvaliacoes>({ data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } });
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [hasMoreAvaliacoes, setHasMoreAvaliacoes] = useState(true);

    const { data: session } = authClient.useSession();
    const userId = session?.user.id;

   
    useEffect(() => {
        setTemas(listaTemas);
        setAvaliacoes(listaAvaliacoes);
        setHasMore(listaTemas.meta.total > listaTemas.data.length);
        setHasMoreAvaliacoes(listaAvaliacoes.meta.total > listaAvaliacoes.data.length);
    }, [listaTemas, listaAvaliacoes]);

    const pendingAvaliacoes = avaliacoes.data.filter((avaliacao) => avaliacao.status === "ENVIADA");

    const novosTemas = async () => {
        if (loading || !hasMore) return;

        // Verificar se ainda há mais temas para carregar
        if (temas.data.length >= temas.meta.total) {
            setHasMore(false);
            return;
        }

        setLoading(true);

        try {
            // Calcular a próxima página baseada no número atual de temas
            const temasCarregados = temas.data.length;
            const proximaPagina = Math.floor(temasCarregados / temas.meta.limite) + 1;
            
            const temasNovos = await ListarTemasDisponiveis(userId!, proximaPagina, temas.meta.limite);
            
            // Adicionar novos temas aos existentes
            setTemas(prev => {
                const novosData = [...prev.data, ...temasNovos.data];
                const totalCarregado = novosData.length;
                
                // Verificar se ainda há mais temas para carregar
                if (totalCarregado >= prev.meta.total || temasNovos.data.length < prev.meta.limite) {
                    setHasMore(false);
                }
                
                return {
                    ...temasNovos,
                    data: novosData,
                    meta: {
                        ...temasNovos.meta,
                        // Manter o total original do primeiro carregamento
                        total: prev.meta.total
                    }
                };
            });
        } catch (error) {
            console.error('Erro ao carregar mais temas:', error);
        } finally {
            setLoading(false);
        }
    };

    const nextAvaliacoes = async () => {
        if (loading || !hasMoreAvaliacoes) return;

        // Verificar se ainda há mais avaliações para carregar
        if (avaliacoes.data.length >= avaliacoes.meta.total) {
            setHasMoreAvaliacoes(false);
            return;
        }

        setLoading(true);

        try {
            // Calcular a próxima página baseada no número atual de avaliações
            const avaliacoesCarregadas = avaliacoes.data.length;
            const proximaPagina = Math.floor(avaliacoesCarregadas / avaliacoes.meta.limit) + 1;
            
            const avaliacoesNovas = await ListarAvaliacoesAlunoId(userId!, '', avaliacoes.meta.limit, proximaPagina);
            
            // Adicionar novas avaliações às existentes
            setAvaliacoes(prev => {
                const novosData = [...prev.data, ...avaliacoesNovas.data];
                const totalCarregado = novosData.length;
                
                // Verificar se ainda há mais avaliações para carregar
                if (totalCarregado >= prev.meta.total || avaliacoesNovas.data.length < prev.meta.limit) {
                    setHasMoreAvaliacoes(false);
                }
                
                return {
                    ...avaliacoesNovas,
                    data: novosData,
                    meta: {
                        ...avaliacoesNovas.meta,
                        // Manter o total original do primeiro carregamento
                        total: prev.meta.total
                    }
                };
            });
        } catch (error) {
            console.error('Erro ao carregar mais avaliações:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Tabs defaultValue="pendentes" className='h-full'>
            <TabsList>
                <TabsTrigger value="pendentes" className="text-foreground max-sm:text-xs">
                    Pendentes
                </TabsTrigger>
                <TabsTrigger value="enviadas" className="text-foreground max-sm:text-xs">Enviadas</TabsTrigger>
                <TabsTrigger value="corrigidas" className="text-foreground max-sm:text-xs">Corrigidas</TabsTrigger>
            </TabsList>
            <TabsContent value='pendentes' className="flex flex-col flex-1 h-full overflow-y-auto max-sm:pb-20">
                {temas.meta.total > 0 && (
                    <div className="gap-4 max-[1025px]:flex flex-col min-[1025px]:grid min-[1025px]:grid-cols-3">
                        {temas.data.map((tema) => (
                            <CardNovoTema key={tema.id} tema={tema} />
                        ))}
                        <div className="flex items-center justify-center col-span-full max-md:hidden">
                            <InfiniteScroll hasMore={hasMore} isLoading={loading} next={novosTemas} threshold={1} >
                                {hasMore && <Spinner />}
                            </InfiniteScroll>
                        </div>
                        <div className="flex items-center justify-center col-span-full min-md:hidden">
                            <InfiniteScroll hasMore={hasMore} isLoading={loading} next={novosTemas} threshold={0.1} rootMargin="100px">
                                {hasMore && <Spinner />}
                            </InfiniteScroll>
                        </div>
                    </div>
                )}
            </TabsContent>
            <TabsContent value='enviadas' className="flex flex-col gap-4 flex-1 h-full overflow-y-auto max-sm:pb-20">
                {pendingAvaliacoes.length > 0 || listaTemas.meta.total > 0 ? (
                    <ListaAvaliacoes avaliacoesIniciais={pendingAvaliacoes} criteriosIniciais={criterios} hasMore={hasMoreAvaliacoes} loading={loading} nextAvaliacoes={nextAvaliacoes} />
                ) : (
                    <div className="w-full h-full flex flex-col flex-1 items-center justify-center gap-2 text-muted-foreground pt-5">
                        <FileX className="size-10" />
                        <span className="text-foreground font-semibold">Nenhuma avaliação pendente</span>
                    </div>
                )}
            </TabsContent>
            <TabsContent value='corrigidas' className="flex flex-col flex-1 h-full overflow-y-auto max-sm:pb-20">
                <ListaAvaliacoes avaliacoesIniciais={listaAvaliacoes.data.filter((avaliacao) => avaliacao.status === "CORRIGIDA")} criteriosIniciais={criterios} hasMore={hasMoreAvaliacoes} loading={loading} nextAvaliacoes={nextAvaliacoes} />
            </TabsContent>
        </Tabs>
    )
}