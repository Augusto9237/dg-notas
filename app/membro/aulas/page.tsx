import { Suspense } from "react"
import { redirect } from "next/navigation"

import { listarVideoaulas } from "@/actions/videoaulas"
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
    <main className="min-h-dvh bg-background">
      <div className="h-52 bg-linear-to-br from-primary/70 via-primary/25 to-primary/0 px-5 pt-8 sm:h-60 sm:px-8">
        <Skeleton className="h-8 w-32 bg-white/20" />
        <Skeleton className="mt-2 h-5 w-56 bg-white/20" />
        <Skeleton className="mt-5 h-11 w-full max-w-xl bg-white/20" />
      </div>
      <div className="mx-auto -mt-6 min-h-[60vh] max-w-7xl rounded-t-[2rem] bg-background px-4 pt-5 sm:px-8">
        <div className="mb-6 flex gap-2">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-9 w-24 rounded-full" />
          ))}
        </div>
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton key={index} className="aspect-[0.78] rounded-3xl" />
          ))}
        </div>
      </div>
    </main>
  )
}

export default function AulasPage() {
  return (
    <Suspense fallback={<CarregandoAulas />}>
      <ConteudoAulas />
    </Suspense>
  )
}