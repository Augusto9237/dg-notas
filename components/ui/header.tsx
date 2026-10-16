'use client'

import { Card, CardDescription, CardTitle } from "./card";
import { Button } from "./button";
import { Bell, BellOff, FileText, TrendingUp, UsersRound, UserStar } from "lucide-react";
import { PerfilAluno } from "../perfil-aluno";
import { Prisma } from "@/app/generated/prisma/wasm";
import useWebPush from "@/hooks/useWebPush";
import { toast } from "sonner";
import { User } from "better-auth";
import { Skeleton } from "./skeleton";

type Avaliacao = Prisma.AvaliacaoGetPayload<{
  include: {
    aluno: true,
    criterios: true,
    tema: true,
  }
}>


export type Mentoria = Prisma.MentoriaGetPayload<{
  include: {
    aluno: true,
    professor: true,
    horario: {
      include: {
        slot: true
      }
    }
  }
}>


interface HeaderProps {
  avaliacoes: {
    data: Avaliacao[],
    meta: {
      total: number,
      totalPages: number,
      mediaGeral: number
    }
  }
  mentorias: number
  user: User
}

export function HeaderSkeleton() {
  return (
    <div className="max-[1024px]:bg-linear-to-b from-primary via-primary/75 to-primary/0 min-[1025px]:bg-transparent p-5 h-[159px] overflow-hidden rounded-b-2xl">
      <div className="flex min-[1025px]:flex-row-reverse items-center gap-3 mb-4 min-[1025px]:justify-between">
        <Skeleton className="w-10 h-10 rounded-full" />
        <div>
          <Skeleton className="w-20 h-5" />
          <Skeleton className="w-32 h-6" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 min-[1025px]:gap-5">
        <Skeleton className="w-full h-24 rounded-lg" />
        <Skeleton className="w-full h-24 rounded-lg" />
        <Skeleton className="w-full h-24 rounded-lg" />
      </div>
    </div>
  )
}

export default function Header({ avaliacoes, mentorias, user }: HeaderProps) {
  const { subscribe, permission } = useWebPush({ userId: user.id })

  return (
    <div className="max-[1024px]:bg-linear-to-b from-primary via-primary/75 to-primary/0 min-[1025px]:bg-transparent  p-5  overflow-hidden">
      <div className="flex min-[1025px]:flex-row-reverse items-center gap-3 mb-4 min-[1025px]:justify-between">
        <PerfilAluno />
        <div>
          <p className="text-xs text-muted min-[1025px]:text-primary min-[1025px]:dark:text-primary-foreground dark:text-foreground">
            Olá! Bem-vindo(a)👋
          </p>
          <h1 className="text-lg text-card dark:text-card-foreground max-sm:text-base min-[1025px]:text-primary min-[1025px]:dark:text-primary-foreground min-[1025px]:font-bold">{user.name}</h1>
        </div>
      </div>

      {(permission === 'default' || permission === 'denied' || permission === null) ? (
        <div className="absolute top-5 right-5 min-[1025px]:hidden">
          <Button size='icon' variant="ghost" className="bg-card/5 hover:bg-card/10 text-muted hover:text-muted" onClick={subscribe}>
            <BellOff />
          </Button>
        </div>
      ) : (
        <div className="absolute top-5 right-5 min-[1025px]:hidden">
          <Button size='icon' variant="ghost" className="bg-transparent text-muted" onClick={() => toast.success("Notificações já ativadas!")}>
            <Bell />
          </Button>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4 min-[1025px]:gap-5">
        <Card className="text-left bg-card/75 min-[1025px]:bg-card/100 rounded-lg backdrop-blur-sm border-none min-[1025px]:border-border gap-0 p-4 min-[1025px]:p-4">
          <span className="size-5 rounded-sm bg-primary/20 dark:bg-foreground/50 absolute right-4 text-primary flex justify-center items-center p-[1px]">
            <TrendingUp className="size-3.5" />
          </span>
          <CardTitle className="text-lg font-bold text-primary dark:text-foreground">

            {avaliacoes.meta.mediaGeral.toFixed(2).replace('.', ',')}
          </CardTitle>
          <CardDescription className="text-xs opacity-90 text-primary min-[1025px]:text-muted-foreground dark:text-muted-foreground">Média Geral</CardDescription>
        </Card>

        <Card className="text-left bg-card/75 min-[1025px]:bg-card/100 rounded-lg backdrop-blur-sm border-none min-[1025px]:border-border gap-0 p-4 min-[1025px]:p-4">
          <span className="size-5 rounded-sm bg-primary/20 dark:bg-foreground/50 absolute right-4 text-primary items-center flex justify-center p-[1px]">
            <FileText className="size-3.5" />
          </span>

          <CardTitle className="text-lg font-bold text-primary dark:text-foreground">
            {avaliacoes.meta.total}
          </CardTitle>
          <CardDescription className="text-xs opacity-90 text-primary min-[1025px]:text-muted-foreground dark:text-muted-foreground">Redações</CardDescription>
        </Card>

        <Card className="text-left bg-card/75 min-[1025px]:bg-card/100 rounded-lg backdrop-blur-sm border-none min-[1025px]:border-border gap-0 p-4 min-[1025px]:p-4">
          <span className="size-5 rounded-md bg-primary/20 dark:bg-foreground/50 absolute right-4 text-primary items-center flex justify-center p-[1px]">
            <UsersRound className="size-3.5" />
          </span>
          <CardTitle className="text-lg font-bold text-primary dark:text-foreground">
            {mentorias}
          </CardTitle>
          <CardDescription className="text-xs opacity-90 text-primary min-[1025px]:text-muted-foreground dark:text-muted-foreground">Mentorias</CardDescription>
        </Card>
      </div>
    </div>
  );
}

