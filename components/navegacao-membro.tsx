import Link from "next/link"
import {
  BookOpen,
  FileText,
  Headphones,
  Layers3,
  Video,
} from "lucide-react"
import { Card } from "./ui/card"

const itens = [
  { label: "Início", href: "/membro", icon: Layers3, page: "inicio" },
  { label: "Meu curso", href: "/aluno/aulas/1", icon: BookOpen },
  { label: "Aulas", href: "/membro/aulas", icon: Video, page: "aulas" },
  { label: "Materiais", href: "/membro#materiais", icon: FileText },
] as const

interface NavegacaoMembroProps {
  paginaAtiva: "inicio" | "aulas"
}

export function NavegacaoMembro({ paginaAtiva }: NavegacaoMembroProps) {
  return (
    <nav
      aria-label="Navegação principal"
      className="fixed inset-x-0 bottom-0 min-[1025px]:hidden px-5 pb-2"
    >
      <Card className="p-0 bg-card rounded-xl border-none relative">
      <ul className="mx-auto flex max-w-lg items-center justify-between">
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
      </Card>
    </nav>
  )
}
