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

    const { data: session } = authClient.useSession();
    const userId = session?.user.id;

    useEffect(() => {
        setTemas(listaTemas);
        setAvaliacoes(listaAvaliacoes);
    }, [listaTemas, listaAvaliacoes]);

    const pendingAvaliacoes = avaliacoes.data.filter((avaliacao) => avaliacao.status === "ENVIADA");

    const nextNewThemes = () => {
        if (temas.meta.total > temas.data.length) {
            setTimeout(async () => {
                const temasNovos = await ListarTemasDisponiveis(userId!, 1, temas.meta.limite + 10);
                setTemas(temasNovos);

                if (temasNovos.meta.total <= temasNovos.data.length) {
                    setHasMore(false);
                }

                setLoading(false);
            }, 800);
        }
    };

    const nextAvaliacoes = () => {
        if (pendingAvaliacoes.length > temas.data.length) {
            setTimeout(async () => {
                const avaliacoesNovas = await ListarAvaliacoesAlunoId(userId!, '', temas.meta.limite + 10, 1);
                setAvaliacoes(avaliacoesNovas);

                if (avaliacoesNovas.meta.total <= avaliacoesNovas.data.length) {
                    setHasMore(false);
                }

                setLoading(false);
            }, 800);
        }
    };

    return (
        <Tabs defaultValue="pendentes" className='h-full'>
            <TabsList>
                <TabsTrigger value="temas" className="text-foreground max-sm:text-xs">Novos Temas</TabsTrigger>
                <TabsTrigger value="pendentes" className="text-foreground max-sm:text-xs">Pendentes</TabsTrigger>
                <TabsTrigger value="corrigidas" className="text-foreground max-sm:text-xs">Corrigidas</TabsTrigger>
            </TabsList>
            <TabsContent value='temas' className="flex flex-col flex-1 h-full overflow-y-auto max-sm:pb-24">
                {temas.meta.total > 0 && (
                    <div className="gap-4 max-[1025px]:flex flex-col min-[1025px]:grid min-[1025px]:grid-cols-3">
                        {temas.data.map((tema) => (
                            <CardNovoTema key={tema.id} tema={tema} />
                        ))}
                        <div className="flex items-center justify-center col-span-full max-md:hidden">
                            <InfiniteScroll hasMore={hasMore} isLoading={loading} next={nextNewThemes} threshold={1} >
                                {hasMore && <Spinner />}
                            </InfiniteScroll>
                        </div>
                        <div className="flex items-center justify-center col-span-full min-md:hidden">
                            <InfiniteScroll hasMore={hasMore} isLoading={loading} next={nextNewThemes} threshold={0.1} rootMargin="100px">
                                {hasMore && <Spinner />}
                            </InfiniteScroll>
                        </div>
                    </div>
                )}
            </TabsContent>
            <TabsContent value='pendentes' className="flex flex-col gap-4 flex-1 h-full overflow-y-auto max-sm:pb-24">
                {pendingAvaliacoes.length > 0 || listaTemas.meta.total > 0 ? (
                    <ListaAvaliacoes avaliacoesIniciais={pendingAvaliacoes} criteriosIniciais={criterios} hasMore={hasMore} loading={loading} nextAvaliacoes={nextAvaliacoes} />
                ) : (
                    <div className="w-full h-full flex flex-col flex-1 items-center justify-center gap-2 text-muted-foreground pt-5">
                        <FileX className="size-10" />
                        <span className="text-foreground font-semibold">Nenhuma avaliação pendente</span>
                    </div>
                )}
            </TabsContent>
            <TabsContent value='corrigidas' className="flex flex-col flex-1 h-full overflow-y-auto max-sm:pb-24">
                <ListaAvaliacoes avaliacoesIniciais={listaAvaliacoes.data.filter((avaliacao) => avaliacao.status === "CORRIGIDA")} criteriosIniciais={criterios} hasMore={hasMore} loading={loading} nextAvaliacoes={nextAvaliacoes} />
            </TabsContent>
        </Tabs>
    )
}