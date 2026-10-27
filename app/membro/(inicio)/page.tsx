import Link from "next/link"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  ArrowRight,
  Bell,
  BookOpen,
  CalendarDays,
  Check,
  ChevronRight,
  CirclePlay,
  FilePenLine,
  FileText,
  Headphones,
  Play,
  Search,
  Sparkles,
  SquareUserRound,
  UsersRound,
  Video,
} from "lucide-react"
import Image from "next/image"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Logo } from "@/components/ui/logo"
import { Progress } from "@/components/ui/progress"
import { CardVideoaula } from "@/components/card-videoaula"
import { NavegacaoMembro } from "@/components/navegacao-membro"
import { getSessionCached } from "@/lib/session"
import { redirect } from "next/navigation"

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
  { icon: CirclePlay, title: "Aulas gravadas", description: "Estude no seu ritmo" },
  { icon: SquareUserRound, title: "Aulas ao vivo", description: "Aulas ao vivo" },
  { icon: FilePenLine, title: "Avaliações", description: "Correção de redações" },
  { icon: Headphones, title: "Suporte da prof. Dani", description: "Tire suas dúvidas" },
]

export default async function MemberHomePage() {
  const session = await getSessionCached()

  if (!session?.user) {
    redirect('/');
  }

  const user = session.user

  return (
    <div className="min-h-dvh bg-linear-to-t from-background  to-primary/5 to-15% pb-16 text-foreground">
      <header className="sticky top-0 z-30  backdrop-blur-2xl">
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
              <Image
                alt={session?.user.name || "Usuário"}
                priority={true}
                width={40}
                height={40}
                src={session?.user.image || "/avatar-placeholder.png"}
              />
              <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
                DG
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-5 py-6 sm:gap-10 sm:px-6 sm:py-8">
        <Card className="p-0 gap-0 overflow-hidden max-h-[460px] bg-linear-to-bl from-primary/25 via-primary/5 to-primary/0">
          <div className="grid grid-cols-2">
            <div className="flex flex-col p-4 md:p-5">
              <Badge className="mb-4 rounded-full border-0 bg-primary/10 px-3 py-1 text-primary hover:bg-primary/10">
                Seu curso
              </Badge>
              <h1
                id="welcome-title"
                className="max-w-2xl max-sm:text-xl text-3xl font-bold tracking-tight text-primary sm:text-4xl"
              >
                Dani Guedes Redação
              </h1>
              <p className="mt-2 text-lg max-sm:text-sm font-medium text-foreground/80">
                Preparatório para o ENEM
              </p>
              <p className="mt-3 max-w-xl text-xs leading-6 text-muted-foreground sm:text-base">
                Aulas, materiais e suporte para você evoluir na redação e
                conquistar a sua melhor versão no ENEM.
              </p>

              <div className='max-md:hidden'>
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
              </div>
            </div>

            <div
              className="h-full overflow-hidden flex"
            >
              <Image src="/hero-card-img(2).png" alt="Hero" height={0} width={0} sizes="100vw" className="w-full h-auto object-cover md:object-center" />
            </div>
          </div>
          <CardFooter className="flex-col pb-4 max-sm:px-4 md:hidden">
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
          </CardFooter>
        </Card>

        <section aria-labelledby="continue-title">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold tracking-[0.16em] text-primary/70">
                Continue aprendendo
              </p>
              <h2 id="continue-title" className="mt-1 text-xl font-bold sm:text-2xl">
                De onde você parou
              </h2>
            </div>
          </div>
          <CardVideoaula
            href="/aluno/aulas/1"
            lessonLabel="Módulo 1 · Aula 1"
            title="Estrutura da redação"
            description="Introdução, desenvolvimento e conclusão"
            duration="24 min"
            instructorName="Profª Dani Guedes"
            instructorRole="Redação - Linguagens"
            level="Intermediário"
            progress={32}
          />
        </section>

        <section aria-labelledby="plan-title">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h2 id="plan-title" className="text-xl font-bold sm:text-2xl">
                Ultimas aulas
              </h2>
            </div>
            <Button asChild variant="link" className="shrink-0 px-0 text-primary">
              <Link href="/aluno/aulas/1">
                Todas as aulas <ChevronRight className="size-4" />
              </Link>
            </Button>
          </div>

          <Card className="py-0">
            <Accordion type="multiple" defaultValue={["item-1"]} className="px-5">
              {modules.map((module) => (
                <AccordionItem key={module.number} value={`item-${module.number}`}>
                  <AccordionTrigger>
                    <div className="flex items-center gap-4 w-full">
                      <span className="flex size-12 justify-center items-center rounded-md bg-primary/8 text-primary transition-colors group-hover:bg-primary/12">
                        {module.icon && <module.icon className="size-5" />}
                      </span>

                      <span className="min-w-0 flex max-md:flex-col md:items-center w-full md:justify-between">
                        <span className="block font-semibold leading-snug text-foreground max-sm:text-sm">
                          Módulo {module.number} - {module.title}
                        </span>
                        <span className="min-w-0 w-full max-w-sm">
                          <span className="mb-1 flex items-center justify-between gap-3 text-xs text-muted-foreground">
                            <span>{module.completed}</span>
                            <span>{module.progress}%</span>
                          </span>
                          <Progress
                            value={module.progress}
                            aria-label={`Progresso do módulo ${module.number}: ${module.progress} por cento`}
                            className="h-2 bg-primary/10"
                          />
                        </span>
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="flex gap-4">
                      <span className="relative flex h-16 w-20 justify-center items-center rounded-md bg-primary/8 text-primary transition-colors group-hover:bg-primary/12">
                        <Play className="size-6 absolute fill-primary" />
                        <Image
                          src="/Sublogo1.svg"
                          alt="Thumbnail"
                          className="w-full h-auto object-cover rounded-md"
                          width={100}
                          height={50}
                        />
                      </span>
                      <span className="flex flex-col ">
                        <span className="text-sm font-semibold">{module.title}</span>
                        <span className="text-xs text-muted-foreground">{module.detail}</span>
                      </span>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
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
                <div className="flex gap-4">
                  <div className="bg-primary/5 rounded-md w-20 flex justify-center items-center">
                    <Play />
                  </div>
                  <div>
                    <p className="font-semibold max-sm:text-sm">Correção de redações</p>
                    <p className="text-sm max-sm:text-xs text-muted-foreground">Professora Dani</p>
                    <p className="mt-2 text-sm max-sm:text-xs font-medium text-primary">
                      Hoje, 19h
                    </p>
                  </div>
                </div>
                <Button asChild variant="secondary" className="w-full">
                  <Link href="/aluno/mentorias">
                    <CirclePlay className="size-4" />
                    Acessar aula
                    <ChevronRight className="size-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card id="materiais" className="scroll-mt-28 overflow-hidden rounded-2xl border-primary/10 py-0 shadow-sm">
            <CardContent className="flex h-full items-center justify-between gap-4 p-5 sm:p-6">
              <div className="max-w-md">
                <div className="flex items-center gap-4">
                  <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
                    <FileText className="size-5" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-primary/70">
                      Para ir além
                    </p>
                    <h2 className="text-lg font-bold">Materiais extras</h2>
                  </div>
                </div>
                <p className="mt-4 text-sm max-sm:text-xs leading-tight text-muted-foreground">
                  Acesse apostilas, mapas mentais e modelos para acompanhar as aulas.
                </p>
                <Button asChild variant="outline" className="mt-4 w-full">
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
      </main>

      {/* <NavegacaoMembro paginaAtiva="inicio" /> */}
    </div >
  )
}
