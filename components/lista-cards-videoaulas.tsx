"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Filter, Search, VideoOff } from "lucide-react"

import { listarVideoaulas } from "@/actions/videoaulas"
import { CardVideoaula } from "@/components/card-videoaula"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import type { User, Videoaula } from "@/app/generated/prisma"
import {
  VIDEOAULA_CATEGORIAS,
  type VideoaulaCategoria,
} from "@/lib/videoaula-categorias"

const PAGE_SIZE = 12

type VideoaulaListItem = Videoaula & {
  professor: Pick<User, "name" | "image" | "especialidade"> | null
}

interface ListaCardsVideoaulasProps {
  initialVideoaulas: VideoaulaListItem[]
  initialTotal: number
}

export function ListaCardsVideoaulas({
  initialVideoaulas,
  initialTotal,
}: ListaCardsVideoaulasProps) {
  const [videoaulas, setVideoaulas] = useState(initialVideoaulas)
  const [total, setTotal] = useState(initialTotal)
  const [busca, setBusca] = useState("")
  const [categoria, setCategoria] = useState<VideoaulaCategoria>("todas")
  const [filtrosVisiveis, setFiltrosVisiveis] = useState(true)
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [pagina, setPagina] = useState(1)
  const requestId = useRef(0)
  const skipInitialRequest = useRef(true)

  const carregarAulas = useCallback(
    async (
      termo: string,
      filtro: VideoaulaCategoria,
      paginaSolicitada: number,
      anexar: boolean
    ) => {
      const currentRequestId = ++requestId.current
      setCarregando(true)
      setErro(null)

      try {
        const resultado = await listarVideoaulas(
          termo || undefined,
          paginaSolicitada,
          PAGE_SIZE,
          filtro === "todas" ? undefined : filtro
        )

        if (currentRequestId !== requestId.current) return

        setVideoaulas((atuais) =>
          anexar ? [...atuais, ...resultado.data] : resultado.data
        )
        setTotal(resultado.meta.total)
        setPagina(paginaSolicitada)
      } catch (error) {
        console.error("Erro ao carregar videoaulas:", error)
        if (currentRequestId === requestId.current) {
          setErro("Não foi possível carregar as aulas. Tente novamente.")
        }
      } finally {
        if (currentRequestId === requestId.current) {
          setCarregando(false)
        }
      }
    },
    []
  )

  useEffect(() => {
    if (skipInitialRequest.current) {
      skipInitialRequest.current = false
      return
    }

    const timeout = window.setTimeout(() => {
      void carregarAulas(busca.trim(), categoria, 1, false)
    }, 300)

    return () => {
      window.clearTimeout(timeout)
      requestId.current += 1
    }
  }, [busca, categoria, carregarAulas])

  function carregarMaisAulas() {
    void carregarAulas(busca.trim(), categoria, pagina + 1, true)
  }

  function tentarNovamente() {
    void carregarAulas(busca.trim(), categoria, 1, false)
  }

  return (
    <>
      <header className="bg-linear-to-b from-primary/20 via-primary/10 to-transparent px-5 pb-12 pt-5 text-primary sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="max-sm:text-xl text-3xl font-bold tracking-tight sm:text-3xl">
                Aulas
              </h1>
              <p className="mt-1 max-w-xs text-sm max-sm:text-xs text-primary sm:max-w-none">
                Aprenda com conteúdos exclusivos da DG
              </p>
            </div>
          
          </div>

          <label className="relative mt-5 flex items-center">
            <span className="sr-only">Buscar aulas</span>
            <Search
              aria-hidden="true"
              className="absolute left-3.5 size-4 text-primary/70"
            />
            <Input
              type="search"
              value={busca}
              onChange={(event) => setBusca(event.target.value)}
              placeholder="Buscar aulas..."
              className="relative bg-card"
            />
          </label>
        </div>
      </header>

      <main className="relative z-10 mx-auto -mt-6 min-h-[60vh] max-w-7xl rounded-t-[2rem] pb-10 max-sm:px-4">
        {filtrosVisiveis ? (
          <div
            aria-label="Filtrar aulas por categoria"
            className="mb-6 flex gap-2 overflow-x-auto pb-1"
          >
            {VIDEOAULA_CATEGORIAS.map((item) => {
              const selecionada = categoria === item.value

              return (
                <Button
                  key={item.value}
                  type="button"
                  variant="ghost"
                  size="sm"
                  aria-pressed={selecionada}
                  onClick={() => setCategoria(item.value)}
                  className={`${
                    selecionada
                      ? "border-primary bg-primary text-card hover:border-primary/40 hover:text-primary"
                      : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-primary"
                  }`}
                >
                  {item.label}
                </Button>
              )
            })}
          </div>
        ) : null}

        <div className="mb-4 flex min-h-6 items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground" aria-live="polite">
            {total === 1 ? "1 aula disponível" : `${total} aulas disponíveis`}
          </p>
          {carregando ? (
            <span className="text-xs text-muted-foreground">Atualizando...</span>
          ) : null}
        </div>

        {erro ? (
          <div
            role="alert"
            className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive"
          >
            <p>{erro}</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={tentarNovamente}
            >
              Tentar novamente
            </Button>
          </div>
        ) : null}

        {carregando && videoaulas.length === 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }, (_, index) => (
              <Skeleton key={index} className="aspect-[0.78] rounded-3xl" />
            ))}
          </div>
        ) : videoaulas.length > 0 ? (
          <div
            className={`grid gap-5 sm:grid-cols-2 xl:grid-cols-3 ${
              carregando ? "opacity-60" : ""
            }`}
          >
            {videoaulas.map((videoaula) => (
              <CardVideoaula
                key={videoaula.id}
                href={`/aluno/aulas/${videoaula.id}`}
                lessonLabel={`Aula ${videoaula.id}`}
                title={videoaula.titulo}
                description={videoaula.descricao}
                instructorName={videoaula.professor?.name ?? "Profª Dani Guedes"}
                instructorRole={
                  videoaula.professor?.especialidade ?? "Redação - Linguagens"
                }
                instructorImage={
                  videoaula.professor?.image ?? "/avatar-placeholder.png"
                }
                status="Disponível"
              />
            ))}
          </div>
        ) : (
          <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-primary/20 bg-primary/[0.025] px-5 text-center">
            <span className="grid size-14 place-items-center rounded-full bg-primary/10 text-primary">
              <VideoOff aria-hidden="true" className="size-6" />
            </span>
            <h2 className="mt-4 font-semibold">Nenhuma aula encontrada</h2>
            <p className="mt-1 max-w-sm text-sm leading-6 text-muted-foreground">
              Tente outro termo de busca ou selecione uma categoria diferente.
            </p>
          </div>
        )}

        {videoaulas.length > 0 && videoaulas.length < total ? (
          <div className="mt-8 flex justify-center">
            <Button
              type="button"
              variant="outline"
              disabled={carregando}
              onClick={carregarMaisAulas}
              className="rounded-xl"
            >
              {carregando ? "Carregando..." : "Carregar mais aulas"}
            </Button>
          </div>
        ) : null}
      </main>
    </>
  )
}
