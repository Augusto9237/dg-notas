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

type Avaliacao = Prisma.AvaliacaoGetPayload<{
  include: {
    aluno: true,
    criterios: true,
    tema: true,
  }
}>


interface HeaderProps {
  avaliacoes: Avaliacao[];
}

export default function Header({ avaliacoes }: HeaderProps) {
  const { notificacoes, listaMentorias } = useContext(ContextoAluno);
  const { data: session } = authClient.useSession();
  const [listaAvaliacoes, setListaAvaliacoes] = useState<Avaliacao[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { subscribe, permission } = useWebPush({ userId: session?.user.id! })

  useEffect(() => {
    setListaAvaliacoes(avaliacoes);
  }, [avaliacoes]);

  // Gerenciamento de Notificações
  useEffect(() => {
    const handleNotification = async () => {
      if (!notificacoes?.data?.url) return;

      const url = notificacoes.data.url;
      setIsLoading(true);

      try {
        if (url === '/aluno/avaliacoes') {
          const novasAvaliacoes = await ListarAvaliacoesAlunoId(session?.user.id!, '', 10000, 1)
          setListaAvaliacoes(novasAvaliacoes.data);
        }
      } catch (error) {
        console.error("Erro ao atualizar dados via notificação:", error);
      } finally {
        setIsLoading(false);
      }
    };

    handleNotification();
  }, [notificacoes]);

  // Cálculos derivados otimizados
  const { mediaGeral, totalRedacoes } = useMemo(() => {
    const total = listaAvaliacoes.length;
    const soma = listaAvaliacoes.reduce((acc, curr) => acc + curr.notaFinal, 0);
    return {
      mediaGeral: total > 0 ? soma / total : 0,
      totalRedacoes: total
    };
  }, [listaAvaliacoes]);

  // Renderizar um placeholder durante a hidratação
  if (!isLoading && !session) {
    return (
      <div className="bg-primary text-card px-5 py-4 rounded-b-xl min-[1025px]:hidden">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-12 w-12 border-2 border-secondary rounded-full bg-muted animate-pulse" />
          <div className="space-y-2">
            <div className="h-5 w-32 bg-muted animate-pulse rounded" />
            <div className="h-3 w-48 bg-muted animate-pulse rounded" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="text-center bg-card/10 rounded-lg backdrop-blur-sm border-none gap-0 p-2">
              <div className="h-6 w-12 bg-muted animate-pulse rounded mx-auto mb-1" />
              <div className="h-3 w-16 bg-muted animate-pulse rounded mx-auto" />
            </Card>
          ))}
        </div>
      </div>
    );
  }
  else {
    return (
      <div className="bg-primary min-[1025px]:bg-transparent  p-5 h-[159px] overflow-hidden rounded-b-2xl">
        <div className="flex min-[1025px]:flex-row-reverse items-center gap-3 mb-4 min-[1025px]:justify-between">
          <PerfilAluno />
          <div>
            <p className="text-xs text-muted dark:text-foreground min-[1025px]:text-muted-foreground">
              Olá! Bem-vindo(a)👋
            </p>
            <h1 className="text-lg text-card dark:text-card-foreground max-sm:text-base min-[1025px]:text-foreground min-[1025px]:font-bold">{session ? session.user.name : "Usuário"}</h1>
          </div>
        </div>

        {(permission === 'default' || permission === 'denied' || permission === null) ? (
          <div className="absolute top-5 right-5 min-[1025px]:hidden">
            <Button size='icon'  onClick={subscribe}>
              <BellOff />
            </Button>
          </div>
        ) : (
          <div className="absolute top-5 right-5 min-[1025px]:hidden">
            <Button size='icon'  onClick={() => toast.success("Notificações já ativadas!")}>
              <Bell />
            </Button>
          </div>
        )}

        <div className="grid grid-cols-3 gap-4 min-[1025px]:gap-5">
          <Card className="text-center bg-card/10 min-[1025px]:bg-card/100 rounded-lg backdrop-blur-sm border-none min-[1025px]:border-border gap-0 p-2 min-[1025px]:p-4">
            <CardTitle className="text-lg font-bold text-secondary">
              {mediaGeral.toFixed(2).replace('.', ',')}
            </CardTitle>
            <CardDescription className="text-xs opacity-90 text-card min-[1025px]:text-muted-foreground dark:text-muted-foreground">Média Geral</CardDescription>
          </Card>

          <Card className="text-center bg-card/10 min-[1025px]:bg-card/100 rounded-lg backdrop-blur-sm border-none min-[1025px]:border-border gap-0 p-2 min-[1025px]:p-4">
            <CardTitle className="text-lg font-bold text-secondary">
              {totalRedacoes}
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
}
