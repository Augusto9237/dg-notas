'use client'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileX } from 'lucide-react';
import { ListaAvaliacoes } from '@/components/lista-avaliacoes';
import { CardNovoTema } from '@/components/card-novotema';
import { ContextoAluno } from '@/context/contexto-aluno';
import { useContext } from 'react';
import { Criterio, Prisma } from '@/app/generated/prisma';

interface TabelaAvaliacoesAlunoProps {
    criterios: Criterio[]
}

export function TabelaAvaliacoesAluno({ criterios }: TabelaAvaliacoesAlunoProps) {
    const { listaAvaliacoes, listaTemas, } = useContext(ContextoAluno);
    const pendingAvaliacoes = listaAvaliacoes.filter((avaliacao) => avaliacao.status === "ENVIADA");
    return (
        <Tabs defaultValue="pendentes">
            <TabsList>
                <TabsTrigger value="pendentes" className="text-foreground max-sm:text-xs">Pendentes</TabsTrigger>
                <TabsTrigger value="corrigidas" className="text-foreground max-sm:text-xs">Corrigidas</TabsTrigger>
            </TabsList>
            <TabsContent value='pendentes' className="flex flex-col gap-4">
                {listaTemas.length > 0 && (
                    <>
                        {listaTemas.map((tema) => (
                            <CardNovoTema key={tema.id} tema={tema} />
                        ))}
                    </>
                )}

                {pendingAvaliacoes.length > 0 || listaTemas.length > 0 ? (
                    <ListaAvaliacoes avaliacoesIniciais={pendingAvaliacoes} criteriosIniciais={criterios} />
                ) : (
                    <div className="w-full h-full flex flex-col flex-1 items-center justify-center gap-2 text-muted-foreground pt-5">
                        <FileX className="size-10" />
                        <span className="text-foreground font-semibold">Nenhuma avaliação pendente</span>
                    </div>
                )}
            </TabsContent>
            <TabsContent value='corrigidas' className="flex flex-col gap-4">
                <ListaAvaliacoes avaliacoesIniciais={listaAvaliacoes.filter((avaliacao) => avaliacao.status === "CORRIGIDA")} criteriosIniciais={criterios} />
            </TabsContent>
        </Tabs>
    )
}