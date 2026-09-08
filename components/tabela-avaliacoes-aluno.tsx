'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileX } from 'lucide-react';
import { ListaAvaliacoes } from '@/components/lista-avaliacoes';
import { CardNovoTema } from '@/components/card-novotema';
import { useCallback, useMemo, useState } from 'react';
import { Criterio, Prisma } from '@/app/generated/prisma';
import InfiniteScroll from './ui/infinite-scroll';
import { Spinner } from './ui/spinner';
import { ListarAvaliacoesAlunoId, listarTemasDisponiveis } from '@/actions/avaliacao';

type Tema = Prisma.TemaGetPayload<{
  include: { professor: true }
}>

type AvaliacaoTema = Prisma.AvaliacaoGetPayload<{
  include: {
    aluno: true;
    criterios: true;
    tema: true;
    professor: {
      select: {
        name: true;
        email: true;
        image: true;
        id: true;
        especialidade: true;
      }
    }
  }
}>

interface ListaTemas {
  data: Tema[];
  meta: {
    total: number;
    pagina: number;
    limite: number;
    totalPaginas: number;
  };
}

interface ListaAvaliacoesPaginada {
  data: AvaliacaoTema[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }
}

interface TabelaAvaliacoesAlunoProps {
  avaliacoesIniciais: ListaAvaliacoesPaginada;
  temasIniciais: ListaTemas;
  criterios: Criterio[];
  userId: string; // ← NOVO: recebe da page (Server Component)
}

export function TabelaAvaliacoesAluno({
  avaliacoesIniciais,
  temasIniciais,
  criterios,
  userId,
}: TabelaAvaliacoesAlunoProps) {
  // Estado apenas para dados que crescem via infinite scroll
  const [temas, setTemas] = useState(temasIniciais);
  const [avaliacoes, setAvaliacoes] = useState(avaliacoesIniciais);

  // Loading SEPARADO: um não interfere no outro
  const [loadingTemas, setLoadingTemas] = useState(false);
  const [loadingAvaliacoes, setLoadingAvaliacoes] = useState(false);

  // hasMore derivado diretamente do estado (sem useState separado)
  const hasMoreTemas = temas.data.length < temas.meta.total;
  const hasMoreAvaliacoes = avaliacoes.data.length < avaliacoes.meta.total;

  // Filtros memoizados para evitar recriação a cada render
  const enviadas = useMemo(
    () => avaliacoes.data.filter((a) => a.status === 'ENVIADA'),
    [avaliacoes.data]
  );

  const corrigidas = useMemo(
    () => avaliacoes.data.filter((a) => a.status === 'CORRIGIDA'),
    [avaliacoes.data]
  );

  const carregarMaisTemas = useCallback(async () => {
    if (loadingTemas || !hasMoreTemas) return;

    setLoadingTemas(true);
    try {
      const proximaPagina = temas.meta.pagina + 1;
      const response = await listarTemasDisponiveis(userId, proximaPagina, temas.meta.limite);

      setTemas((prev) => ({
        ...response,
        data: [...prev.data, ...response.data],
      }));
    } catch (error) {
      console.error('Erro ao carregar mais temas:', error);
    } finally {
      setLoadingTemas(false);
    }
  }, [loadingTemas, hasMoreTemas, temas.meta.pagina, temas.meta.limite, userId]);

  const carregarMaisAvaliacoes = useCallback(async () => {
    if (loadingAvaliacoes || !hasMoreAvaliacoes) return;

    setLoadingAvaliacoes(true);
    try {
      const proximaPagina = avaliacoes.meta.page + 1;
      const response = await ListarAvaliacoesAlunoId(userId, '', avaliacoes.meta.limit, proximaPagina);

      setAvaliacoes((prev) => ({
        ...response,
        data: [...prev.data, ...response.data],
      }));
    } catch (error) {
      console.error('Erro ao carregar mais avaliações:', error);
    } finally {
      setLoadingAvaliacoes(false);
    }
  }, [loadingAvaliacoes, hasMoreAvaliacoes, avaliacoes.meta.page, avaliacoes.meta.limit, userId]);

  return (
    <Tabs defaultValue="pendentes" className="h-full">
      <TabsList>
        <TabsTrigger value="pendentes" className="text-foreground max-sm:text-xs">
          Pendentes
        </TabsTrigger>
        <TabsTrigger value="enviadas" className="text-foreground max-sm:text-xs">
          Enviadas
        </TabsTrigger>
        <TabsTrigger value="corrigidas" className="text-foreground max-sm:text-xs">
          Corrigidas
        </TabsTrigger>
      </TabsList>

      {/* ABA PENDENTES */}
      <TabsContent
        value="pendentes"
        className="flex flex-col flex-1 h-full overflow-y-auto max-sm:pb-20"
      >
        {temas.data.length > 0 ? (
          <div className="gap-4 max-[1025px]:flex flex-col min-[1025px]:grid min-[1025px]:grid-cols-3">
            {temas.data.map((tema) => (
              <CardNovoTema key={tema.id} tema={tema} />
            ))}

            <div className="flex items-center justify-center col-span-full">
              <InfiniteScroll
                hasMore={hasMoreTemas}
                isLoading={loadingTemas}
                next={carregarMaisTemas}
                threshold={0.5}
              >
                {hasMoreTemas && <Spinner />}
              </InfiniteScroll>
            </div>
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-muted-foreground">
            <FileX className="size-10" />
            <span className="text-foreground font-semibold">Nenhum tema pendente</span>
          </div>
        )}
      </TabsContent>

      {/* ABA ENVIADAS */}
      <TabsContent
        value="enviadas"
        className="flex flex-col gap-4 flex-1 h-full overflow-y-auto max-sm:pb-20"
      >
        {enviadas.length > 0 ? (
          <ListaAvaliacoes
            avaliacoesIniciais={enviadas}
            criteriosIniciais={criterios}
            hasMore={hasMoreAvaliacoes}
            loading={loadingAvaliacoes}
            nextAvaliacoes={carregarMaisAvaliacoes}
          />
        ) : (
          <div className="w-full h-full flex flex-col flex-1 items-center justify-center gap-2 text-muted-foreground pt-5">
            <FileX className="size-10" />
            <span className="text-foreground font-semibold">Nenhuma avaliação enviada</span>
          </div>
        )}
      </TabsContent>

      {/* ABA CORRIGIDAS */}
      <TabsContent
        value="corrigidas"
        className="flex flex-col flex-1 h-full overflow-y-auto max-sm:pb-20"
      >
        {corrigidas.length > 0 ? (
          <ListaAvaliacoes
            avaliacoesIniciais={corrigidas}
            criteriosIniciais={criterios}
            hasMore={hasMoreAvaliacoes}
            loading={loadingAvaliacoes}
            nextAvaliacoes={carregarMaisAvaliacoes}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-muted-foreground">
            <FileX className="size-10" />
            <span className="text-foreground font-semibold">Nenhuma avaliação corrigida</span>
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}