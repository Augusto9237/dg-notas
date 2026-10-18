import Link from "next/link"
import {
  ArrowRight,
  Bell,
  BookOpen,
  CalendarDays,
  Check,
  ChevronRight,
  CirclePlay,
  Clock3,
  FileText,
  Headphones,
  Layers3,
  Search,
  Sparkles,
  UsersRound,
  Video,
} from "lucide-react"
import Image from "next/image"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Logo } from "@/components/ui/logo"
import { Progress } from "@/components/ui/progress"

const modules = [
  {
    number: "01",
    title: "Estrutura da redação",
    detail: "5 aulas",
    progress: 40,
    completed: "2/5 aulas concluídas",
    icon: FileText,
  },
  {
    number: "02",
    title: "Tipos de erros e como evitá-los",
    detail: "4 aulas",
    progress: 0,
    completed: "0/4 aulas concluídas",
    icon: CirclePlay,
  },
  {
    number: "03",
    title: "Argumentação e repertório",
    detail: "6 aulas",
    progress: 0,
    completed: "0/6 aulas concluídas",
    icon: BookOpen,
  },
  {
    number: "04",
    title: "Simulados e correções",
    detail: "3 simulados",
    progress: 0,
    completed: "0/3 simulados",
    icon: CalendarDays,
  },
]

const benefits = [
  { icon: CirclePlay, title: "Acesso imediato", description: "Estude no seu ritmo" },
  { icon: Headphones, title: "Suporte da prof. Dani", description: "Tire suas dúvidas" },
  { icon: Check, title: "Certificado", description: "Acompanhe seu progresso" },
  { icon: UsersRound, title: "Comunidade DG", description: "Aprenda com outros alunos" },
]

const navigation = [
  { label: "Início", href: "/membro", icon: Layers3, active: true },
  { label: "Meu curso", href: "/aluno/aulas/1", icon: BookOpen },
  { label: "Aulas", href: "/aluno/aulas/1", icon: Video },
  { label: "Materiais", href: "#materiais", icon: FileText },
  { label: "Suporte", href: "/aluno/mentorias", icon: Headphones },
]

export default function MemberHomePage() {
  return (
    <div className="min-h-dvh bg-linear-to-t from-background  to-primary/5 to-15% pb-24 text-foreground bg">
      <header className="sticky top-0 z-30  backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-5 py-3 sm:px-6 lg:flex-nowrap lg:py-4">
          <Link href="/membro" aria-label="DG Redação - início" className="flex h-10 w-26 shrink-0 items-center justify-center overflow-hidden">
            <Image
              src="/Logo1.svg"
              alt="DG Redação"
              width={0}
              height={0}
              sizes="100vw"
              className="h-26 w-auto object-center"
            />
          </Link>

          <label className="relative order-3 w-full lg:order-none lg:mx-8 lg:max-w-xl">
            <span className="sr-only">Buscar aulas, materiais ou dúvidas</span>
            <Search
              aria-hidden="true"
              className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-primary"
            />
            <Input
              type="search"
              placeholder="Buscar aulas, materiais ou dúvidas..."
              className="h-11 rounded-xl border-primary/10 bg-card pl-10 shadow-none placeholder:text-muted-foreground/80"
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
            <Avatar className="size-10 border-2 border-primary/15 bg-primary/10">
              <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
                DG
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-5 py-6 sm:gap-10 sm:px-6 sm:py-8">
        <Card className="p-0">
          <div className="grid items-center gap-6 p-5 sm:p-8 lg:grid-cols-[1.2fr_0.8fr] lg:p-10">
            <div className="flex flex-col items-start">
              <Badge className="mb-4 rounded-full border-0 bg-primary/10 px-3 py-1 text-primary hover:bg-primary/10">
                Seu curso
              </Badge>
              <p className="mb-1 text-sm font-medium text-muted-foreground">
                Olá, que bom ter você por aqui!
              </p>
              <h1
                id="welcome-title"
                className="max-w-2xl text-3xl font-bold tracking-tight text-primary sm:text-4xl"
              >
                DG — Dani Guedes Redação
              </h1>
              <p className="mt-2 text-lg font-medium text-foreground/80">
                Preparatório para o ENEM
              </p>
              <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
                Aulas, materiais e suporte para você evoluir na redação e
                conquistar a sua melhor versão no ENEM.
              </p>

              <div className="mt-6 w-full max-w-xl">
                <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                  <span className="font-semibold text-primary">Seu progresso no curso</span>
                  <span className="shrink-0 text-muted-foreground">32% concluído</span>
                </div>
                <Progress
                  value={32}
                  aria-label="Progresso do curso: 32 por cento"
                  className="h-3 bg-primary/10"
                />
              </div>

              <Button
                asChild
                size="lg"
                variant="secondary"
                className="w-full mt-5"
             >
                <Link href="/aluno/aulas/1">
                  <span className="flex items-center gap-2">
                    <CirclePlay className="size-5" />
                    Continuar meu curso
                  </span>
                  <ArrowRight className="size-4" />
                </Link>
              </Button>

              <div className="mt-7 flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-2">
                  <BookOpen className="size-4 text-primary" />
                  Aulas objetivas
                </span>
                <span className="inline-flex items-center gap-2">
                  <Headphones className="size-4 text-primary" />
                  Suporte próximo
                </span>
                <span className="inline-flex items-center gap-2">
                  <Clock3 className="size-4 text-primary" />
                  Acesso imediato
                </span>
              </div>
            </div>

            <div
              aria-hidden="true"
              className="relative hidden min-h-64 items-center justify-center overflow-hidden rounded-2xl border border-primary/10 bg-primary p-8 lg:flex"
            >
              <div className="absolute -right-8 -top-10 size-56 rounded-full bg-secondary/90 blur-[1px]" />
              <div className="absolute -bottom-24 -left-10 size-64 rounded-full bg-background/10" />
              <div className="relative flex aspect-square w-full max-w-72 flex-col justify-between rounded-2xl border border-white/20 bg-white/10 p-6 text-white shadow-xl backdrop-blur-sm">
                <div className="flex items-start justify-between">
                  <Sparkles className="size-7 text-secondary" />
                  <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium">
                    Redação ENEM
                  </span>
                </div>
                <div>
                  <p className="text-sm text-white/75">Escreva com confiança</p>
                  <p className="mt-1 text-3xl font-bold leading-tight">
                    Sua próxima
                    <br />
                    grande ideia.
                  </p>
                  <div className="mt-5 flex items-center gap-2 text-sm text-white/80">
                    <BookOpen className="size-4 text-secondary" />
                    Aprenda passo a passo
                  </div>
                </div>
                <div className="absolute -bottom-4 -right-4 grid size-16 place-items-center rounded-2xl bg-secondary text-primary shadow-lg">
                  <FileText className="size-8" />
                </div>
              </div>
            </div>
          </div>
        </Card>

        <section aria-labelledby="continue-title">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary/70">
                Continue aprendendo
              </p>
              <h2 id="continue-title" className="mt-1 text-xl font-bold sm:text-2xl">
                De onde você parou
              </h2>
            </div>
            <Button asChild variant="link" className="shrink-0 px-0 text-primary">
              <Link href="/aluno/aulas/1">
                Ver todas <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>


          <Card className="overflow-hidden p-0">
            <div className="grid md:grid-cols-[0.9fr_1.1fr]">
              <div className="relative flex min-h-52 items-center justify-center overflow-hidden bg-primary p-6 text-white">
                <div aria-hidden="true" className="absolute inset-0 bg-linear-to-br from-primary via-primary to-primary/75" />
                <div aria-hidden="true" className="absolute -right-8 -top-10 size-48 rounded-full border border-white/20" />
                <div aria-hidden="true" className="absolute -bottom-20 -left-8 size-52 rounded-full border border-white/15" />
                <div className="relative z-10 max-w-sm">
                  <Badge className="mb-4 border-white/20 bg-white/10 text-white hover:bg-white/10">
                    Módulo 1 · Aula 1
                  </Badge>
                  <p className="text-2xl font-bold leading-tight">
                    Estrutura da redação
                  </p>
                  <p className="mt-2 text-sm text-white/75">
                    Introdução, desenvolvimento e conclusão
                  </p>
                  <div className="mt-5 grid size-14 place-items-center rounded-full border border-white/30 bg-white/15 backdrop-blur">
                    <CirclePlay className="size-8" />
                  </div>
                </div>
                <span className="absolute bottom-4 right-4 rounded-lg bg-black/25 px-2.5 py-1 text-xs font-medium">
                  24 min
                </span>
              </div>

              <CardContent className="flex flex-col justify-center gap-4 p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="text-sm font-medium text-muted-foreground">
                    Sua última aula
                  </span>
                  <Badge className="gap-1 rounded-full border-0 bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/10 dark:text-emerald-300">
                    <Check className="size-3.5" /> Em andamento
                  </Badge>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-primary">
                    Estrutura da redação: introdução, desenvolvimento e conclusão
                  </h3>
                  <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                    Aprenda a organizar suas ideias e construir um texto coeso,
                    claro e com proposta de intervenção.
                  </p>
                </div>
                <Button asChild className="w-full">
                  <Link href="/aluno/aulas/1">
                    <CirclePlay className="size-4" />
                    Assistir aula
                  </Link>
                </Button>
              </CardContent>
            </div>
          </Card>
        </section>

        <section aria-labelledby="plan-title">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary/70">
                Um passo de cada vez
              </p>
              <h2 id="plan-title" className="mt-1 text-xl font-bold sm:text-2xl">
                Seu plano de estudos
              </h2>
            </div>
            <Button asChild variant="link" className="shrink-0 px-0 text-primary">
              <Link href="/aluno/aulas/1">
                Ver curso completo <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>

          <Card className="gap-0 overflow-hidden rounded-2xl border-primary/10 py-0 shadow-sm">
            {modules.map((module) => {
              const Icon = module.icon

              return (
                <Link
                  key={module.number}
                  href="/aluno/aulas/1"
                  className="group grid grid-cols-[auto_1fr_auto] items-center gap-3 border-b border-border/70 p-4 transition-colors last:border-b-0 hover:bg-primary/[0.03] sm:grid-cols-[auto_1.2fr_1fr_auto] sm:gap-5 sm:px-5"
                >
                  <span className="grid size-11 place-items-center rounded-xl bg-primary/8 text-primary transition-colors group-hover:bg-primary/12 sm:size-12">
                    <Icon className="size-5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Módulo {module.number}
                    </span>
                    <span className="mt-0.5 block font-semibold leading-snug text-foreground">
                      {module.title}
                    </span>
                    <span className="mt-1 block text-xs text-muted-foreground sm:hidden">
                      {module.detail}
                    </span>
                  </span>
                  <span className="hidden min-w-0 sm:block">
                    <span className="mb-2 flex items-center justify-between gap-3 text-xs text-muted-foreground">
                      <span>{module.completed}</span>
                      <span>{module.progress}%</span>
                    </span>
                    <Progress
                      value={module.progress}
                      aria-label={`Progresso do módulo ${module.number}: ${module.progress} por cento`}
                      className="h-2 bg-primary/10"
                    />
                  </span>
                  <ChevronRight className="size-5 text-primary/70 transition-transform group-hover:translate-x-0.5" />
                  <span className="col-span-2 -mt-1 pl-14 text-xs text-muted-foreground sm:hidden">
                    {module.completed}
                  </span>
                </Link>
              )
            })}
          </Card>
        </section>

        <section
          aria-label="Benefícios da sua área de membros"
          className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
        >
          {benefits.map((benefit) => {
            const Icon = benefit.icon

            return (
              <Card
                key={benefit.title}
                className="flex-row items-center gap-3 rounded-2xl border-primary/10 bg-primary/[0.035] p-4 shadow-none"
              >
                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-card text-primary shadow-sm">
                  <Icon className="size-5" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{benefit.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {benefit.description}
                  </p>
                </div>
              </Card>
            )
          })}
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <Card className="rounded-2xl border-primary/10 py-0 shadow-sm">
            <CardContent className="p-5 sm:p-6">
              <div className="flex items-center gap-3">
                <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Video className="size-5" />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-primary/70">
                    Ao vivo
                  </p>
                  <h2 className="text-lg font-bold">Próxima aula ao vivo</h2>
                </div>
              </div>
              <div className="mt-5 flex flex-wrap items-center justify-between gap-4 rounded-xl bg-muted/60 p-4">
                <div>
                  <p className="font-semibold">Correção de redações</p>
                  <p className="text-sm text-muted-foreground">com a professora Dani</p>
                  <p className="mt-2 text-sm font-medium text-primary">
                    Hoje, 19h
                  </p>
                </div>
                <Button asChild variant="secondary" className="rounded-xl font-semibold text-primary">
                  <Link href="/aluno/mentorias">
                    <CirclePlay className="size-4" />
                    Acessar aula
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </div>
              <Button asChild variant="link" className="mt-3 h-auto px-0 text-primary">
                <Link href="/aluno/mentorias">
                  Ver agenda de mentorias <ArrowRight className="size-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card id="materiais" className="scroll-mt-28 overflow-hidden rounded-2xl border-primary/10 py-0 shadow-sm">
            <CardContent className="flex h-full items-center justify-between gap-4 p-5 sm:p-6">
              <div className="max-w-md">
                <span className="grid size-11 place-items-center rounded-xl bg-secondary/20 text-primary">
                  <FileText className="size-5" />
                </span>
                <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-primary/70">
                  Para ir além
                </p>
                <h2 className="mt-1 text-lg font-bold">Materiais extras</h2>
                <p className="mt-1 text-sm leading-5 text-muted-foreground">
                  Acesse apostilas, mapas mentais e modelos para acompanhar as aulas.
                </p>
                <Button asChild variant="outline" className="mt-4 rounded-xl">
                  <Link href="/aluno/aulas/1">
                    Explorar materiais <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </div>
              <div aria-hidden="true" className="hidden shrink-0 sm:block">
                <div className="relative grid size-28 place-items-center rounded-3xl bg-primary/5">
                  <div className="absolute -right-2 -top-2 grid size-12 place-items-center rounded-xl bg-secondary text-primary shadow-sm">
                    <Sparkles className="size-5" />
                  </div>
                  <FileText className="size-14 text-primary/75" />
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section
          id="suporte"
          className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-primary/10 bg-primary/[0.04] p-5 sm:flex-row sm:items-center sm:p-6"
        >
          <div className="flex items-center gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-full bg-card text-primary shadow-sm">
              <Headphones className="size-5" />
            </span>
            <div>
              <h2 className="font-semibold">Precisa de uma mão?</h2>
              <p className="text-sm text-muted-foreground">
                Encontre orientação e acompanhe suas mentorias.
              </p>
            </div>
          </div>
          <Button asChild variant="outline" className="rounded-xl">
            <Link href="/aluno/mentorias">
              Acessar suporte <ArrowRight className="size-4" />
            </Link>
          </Button>
        </section>
      </main>

      <nav
        aria-label="Navegação principal"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-background/95 px-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2 shadow-[0_-8px_24px_-18px_var(--primary)] backdrop-blur-xl sm:hidden"
      >
        <ul className="mx-auto flex max-w-lg items-center justify-around">
          {navigation.map((item) => {
            const Icon = item.icon

            return (
              <li key={item.label}>
                <Link
                  href={item.href}
                  aria-current={item.active ? "page" : undefined}
                  className={`flex min-w-14 flex-col items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-medium transition-colors ${
                    item.active
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
    </div>
  )
}