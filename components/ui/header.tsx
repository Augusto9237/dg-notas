'use client'
import { authClient } from "@/lib/auth-client";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { Card, CardDescription, CardTitle } from "./card";
import { Button } from "./button";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useContext } from "react";
import { ContextoAluno } from "@/context/contexto-aluno";
import { PerfilAluno } from "../perfil-aluno";

export default function Header() {
  const { data: session } = authClient.useSession();
  const router = useRouter();
  const { mediaGeral, totalRedacoes, totalMentorias, isLoading } = useContext(ContextoAluno);

  async function sair() {
    await authClient.signOut();
    router.push("/");
  }


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
        <Button className="absolute top-5 right-5 min-[1025px]:hidden" size="icon" variant="outline" disabled>
          <LogOut />
        </Button>
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

        <Button className="absolute top-5 right-5 min-[1025px]:hidden" size="icon" variant="outline" onClick={sair}>
          <LogOut />
        </Button>

        {/* Stats */}
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
              {totalMentorias}
            </CardTitle>
            <CardDescription className="text-xs opacity-90 text-card min-[1025px]:text-muted-foreground dark:text-muted-foreground">Mentorias</CardDescription>
          </Card>
        </div>
      </div>
    );
  }
}
