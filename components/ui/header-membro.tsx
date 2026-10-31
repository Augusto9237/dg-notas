'use client'
import { Input } from "@/components/ui/input"
import { Menu, Search, SidebarIcon } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { PerfilAluno } from "@/components/perfil-aluno"
import { Bell } from "lucide-react"
import { Button } from "./button"
import { useSidebar } from "./sidebar"

export function HeaderMembro() {
  const { toggleSidebar } = useSidebar()
  return (
    <header className="fixed left-0 right-0 top-0 z-30 h-[70px]  backdrop-blur-2xl">
      <div className="mx-auto flex max-w-screen-xl flex-wrap items-center justify-between gap-3 py-3  lg:flex-nowrap lg:py-4">
        <div className="flex items-center">
          <Button
            className="h-8 w-8 text-primary bg-transparent max-md:hidden"
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
          >
            <Menu />
          </Button>

          <Link href="/membro" aria-label="DG Redação - início" className="flex h-10 w-26 md:w-44 shrink-0 items-center justify-center overflow-hidden">
            <Image
              src="/Logo1.svg"
              alt="DG Redação"
              width={0}
              height={0}
              sizes="100vw"
              className="h-26 w-auto object-center md:hidden"
            />
            <Image
              src="/Sublogo1.svg"
              alt="DG Redação"
              width={0}
              height={0}
              sizes="100vw"
              className="h-auto w-44 object-center max-md:hidden"
            />
          </Link>
        </div>

        <label className="relative order-3 w-full lg:order-none lg:mx-8 lg:max-w-xl">
          <span className="sr-only">Buscar aulas, materiais ou dúvidas</span>
          <Search
            aria-hidden="true"
            className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-primary"
          />
          <Input
            type="search"
            placeholder="Buscar aulas, materiais ou dúvidas..."
            className="border-primary/10 bg-card pl-10 shadow-none placeholder:text-muted-foreground/80"
          />
        </label>

        <div className="flex items-center gap-3">
          <div
            aria-hidden="true"
            className="relative grid size-10 place-items-center rounded-full text-primary"
          >
            <Bell className="size-5" />
            <span className="absolute right-2 top-2 size-2 rounded-full bg-secondary ring-2 ring-background" />
          </div>
          <PerfilAluno orientacao="right" />
        </div>
      </div>
    </header>
  )
}