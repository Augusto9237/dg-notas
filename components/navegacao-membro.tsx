import Link from "next/link"
import {
  BookOpen,
  FileText,
  Headphones,
  Layers3,
  Video,
} from "lucide-react"

const itens = [
  { label: "Início", href: "/membro", icon: Layers3, page: "inicio" },
  { label: "Meu curso", href: "/aluno/aulas/1", icon: BookOpen },
  { label: "Aulas", href: "/membro/aulas", icon: Video, page: "aulas" },
  { label: "Materiais", href: "/membro#materiais", icon: FileText },
  { label: "Suporte", href: "/aluno/mentorias", icon: Headphones },
] as const

interface NavegacaoMembroProps {
  paginaAtiva: "inicio" | "aulas"
}

export function NavegacaoMembro({ paginaAtiva }: NavegacaoMembroProps) {
  return (
    <nav
      aria-label="Navegação principal"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-background/95 px-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2 shadow-[0_-8px_24px_-18px_var(--primary)] backdrop-blur-xl sm:hidden"
    >
      <ul className="mx-auto flex max-w-lg items-center justify-around">
        {itens.map((item) => {
          const Icon = item.icon
          const ativo = "page" in item && item.page === paginaAtiva

          return (
            <li key={item.label}>
              <Link
                href={item.href}
                aria-current={ativo ? "page" : undefined}
                className={`flex min-w-14 flex-col items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-medium transition-colors ${
                  ativo
                    ? "text-primary"
                    : "text-muted-foreground hover:text-primary"
                }`}
              >
                <Icon className="size-5" />
                {item.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
