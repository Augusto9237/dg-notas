import { Suspense } from "react"
import { redirect } from "next/navigation"

import { listarVideoaulas } from "@/actions/videoaulas"
import { CardVideoaulaSkeleton } from "@/components/card-videoaula"
import { ListaCardsVideoaulas } from "@/components/lista-cards-videoaulas"
import { NavegacaoMembro } from "@/components/navegacao-membro"
import { Skeleton } from "@/components/ui/skeleton"
import { getSessionCached } from "@/lib/session"

async function ConteudoAulas() {
  const session = await getSessionCached()

  if (!session?.user) {
    redirect("/")
  }

  const resultado = await listarVideoaulas(undefined, 1, 12)

  return (
    <div className="min-h-dvh bg-background pb-24 text-foreground">
      <ListaCardsVideoaulas
        initialVideoaulas={resultado.data}
        initialTotal={resultado.meta.total}
      />
      <NavegacaoMembro paginaAtiva="aulas" />
    </div>
  )
}

function CarregandoAulas() {
  return (
    <div className="min-h-dvh bg-background pb-24 text-foreground">
      <header className="bg-linear-to-b from-primary/20 via-primary/10 to-transparent px-5 pb-12 pt-[70px] text-primary sm:px-8">
        <div className="mx-auto max-w-screen-xl pt-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col">
              <h2 className="text-primary dark:text-primary-foreground font-semibold text-lg sm:text-xl">
                Aulas
              </h2>
              <p className="text-primary dark:text-primary-foreground text-xs">
                Aprenda com conteúdos exclusivos da DG
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto -mt-6 min-h-[60vh] max-w-7xl rounded-t-[2rem] pb-10 max-sm:px-4">
        <div
          aria-label="Carregando categorias"
          className="mb-6 flex gap-2 overflow-x-auto pb-1"
        >
          <Skeleton className="h-8 w-20 shrink-0 rounded-md" />
          <Skeleton className="h-8 w-24 shrink-0 rounded-md" />
          <Skeleton className="h-8 w-28 shrink-0 rounded-md" />
          <Skeleton className="h-8 w-24 shrink-0 rounded-md" />
          <Skeleton className="h-8 w-20 shrink-0 rounded-md" />
        </div>

        <div className="mb-4 flex min-h-6 items-center justify-between gap-3">
          <Skeleton className="h-4 w-32" />
        </div>

        <div className="flex flex-col gap-5">
          {Array.from({ length: 4 }, (_, index) => (
            <CardVideoaulaSkeleton key={index} />
          ))}
        </div>
      </main>

      <NavegacaoMembro paginaAtiva="aulas" />
    </div>
  )
}

export default function AulasPage() {
  return (
    <Suspense fallback={<CarregandoAulas />}>
      <ConteudoAulas />
    </Suspense>
  )
}