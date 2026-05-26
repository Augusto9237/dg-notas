'use client'
import { authClient } from "@/lib/auth-client";
import { Card, CardDescription, CardTitle } from "./card";
import { Button } from "./button";
import { Bell, BellOff } from "lucide-react";
import { useContext, useEffect, useMemo, useState } from "react";
import { ContextoAluno } from "@/context/contexto-aluno";
import { PerfilAluno } from "../perfil-aluno";
import { Prisma } from "@/app/generated/prisma/wasm";
import { ListarAvaliacoesAlunoId } from "@/actions/avaliacao";
import { listarMentoriasAluno } from "@/actions/mentoria";
import useWebPush from "@/hooks/useWebPush";
import { toast } from "sonner";
import { User } from "better-auth";

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
  mentorias: {
    data: Mentoria[],
    meta: {
      total: number,
      totalPages: number,
    }
  }
  user: User
}

export default function Header({ avaliacoes, mentorias, user }: HeaderProps) {
  const [listaAvaliacoes, setListaAvaliacoes] = useState<HeaderProps['avaliacoes']>({
    data: [],
    meta: {
      total: 0,
      totalPages: 0,
      mediaGeral: 0
    }
  });
  const [listaMentorias, setListaMentorias] = useState<HeaderProps['mentorias']>({
    data: [],
    meta: {
      total: 0,
      totalPages: 0,
    }
  });
  const [isLoading, setIsLoading] = useState(false);
  const { subscribe, permission } = useWebPush({ userId: user.id })

  useEffect(() => {
    setIsLoading(true)
    setListaAvaliacoes(avaliacoes);
    setListaMentorias(mentorias);
    setIsLoading(false)
  }, [avaliacoes, mentorias]);
  
  return (
    <div className="bg-primary min-[1025px]:bg-transparent  p-5 h-[159px] overflow-hidden rounded-b-2xl">
      <div className="flex min-[1025px]:flex-row-reverse items-center gap-3 mb-4 min-[1025px]:justify-between">
        <PerfilAluno />
        <div>
          <p className="text-xs text-muted dark:text-foreground min-[1025px]:text-muted-foreground">
            Olá! Bem-vindo(a)👋
          </p>
          <h1 className="text-lg text-card dark:text-card-foreground max-sm:text-base min-[1025px]:text-foreground min-[1025px]:font-bold">{user.name}</h1>
        </div>
      </div>

      {(permission === 'default' || permission === 'denied' || permission === null) ? (
        <div className="absolute top-5 right-5 min-[1025px]:hidden">
          <Button size='icon' onClick={subscribe}>
            <BellOff />
          </Button>
        </div>
      ) : (
        <div className="absolute top-5 right-5 min-[1025px]:hidden">
          <Button size='icon' onClick={() => toast.success("Notificações já ativadas!")}>
            <Bell />
          </Button>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4 min-[1025px]:gap-5">
        <Card className="text-center bg-card/10 min-[1025px]:bg-card/100 rounded-lg backdrop-blur-sm border-none min-[1025px]:border-border gap-0 p-2 min-[1025px]:p-4">
          <CardTitle className="text-lg font-bold text-secondary">
            {listaAvaliacoes.meta.mediaGeral.toFixed(2).replace('.', ',')}
          </CardTitle>
          <CardDescription className="text-xs opacity-90 text-card min-[1025px]:text-muted-foreground dark:text-muted-foreground">Média Geral</CardDescription>
        </Card>

        <Card className="text-center bg-card/10 min-[1025px]:bg-card/100 rounded-lg backdrop-blur-sm border-none min-[1025px]:border-border gap-0 p-2 min-[1025px]:p-4">
          <CardTitle className="text-lg font-bold text-secondary">
            {listaAvaliacoes.meta.total}
          </CardTitle>
          <CardDescription className="text-xs opacity-90 text-card min-[1025px]:text-muted-foreground dark:text-muted-foreground">Redações</CardDescription>
        </Card>

        <Card className="text-center bg-card/10 min-[1025px]:bg-card/100 rounded-lg backdrop-blur-sm border-none min-[1025px]:border-border gap-0 p-2 min-[1025px]:p-4">
          <CardTitle className="text-lg font-bold text-secondary">
            {listaMentorias.meta.total}
          </CardTitle>
          <CardDescription className="text-xs opacity-90 text-card min-[1025px]:text-muted-foreground dark:text-muted-foreground">Mentorias</CardDescription>
        </Card>
      </div>
    </div>
  );
}

