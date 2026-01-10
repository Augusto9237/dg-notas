'use client'
import { authClient } from "@/lib/auth-client";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { Card, CardDescription, CardTitle } from "./card";
import { Button } from "./button";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useContext } from "react";
import { ContextoAluno } from "@/context/contexto-aluno";

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
      <div className="bg-primary text-card px-5 py-4 rounded-b-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-12 w-12 border-2 border-secondary rounded-full bg-muted animate-pulse" />
          <div className="space-y-2">
            <div className="h-5 w-32 bg-muted animate-pulse rounded" />
            <div className="h-3 w-48 bg-muted animate-pulse rounded" />
          </div>
        </div>
        <Button className="absolute top-5 right-5" size="icon" variant="outline" disabled>
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
      <div className="bg-primary text-card dark:text-card-foreground px-5 py-4 h-[159px] overflow-hidden rounded-b-2xl">
        <div className="flex items-center gap-3 mb-4">
          <Avatar className="h-12 w-12 border-2 border-secondary">
            <AvatarImage
              src={session?.user.image || "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541"}
            />
            <AvatarFallback className="bg-background text-primary font-medium">
              DG
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-lg max-sm:text-base">Olá, {session ? session.user.name : "Usuário"}!</h1>
            <p className="text-xs opacity-90">
              {session ? session.user.email : "carregando..."}
            </p>
          </div>
        </div>

        <Button className="absolute top-5 right-5" size="icon" variant="outline" onClick={sair}>
          <LogOut />
        </Button>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="text-center bg-card/10 rounded-lg backdrop-blur-sm border-none gap-0 p-2">
            <CardTitle className="text-lg font-bold text-secondary">
              {mediaGeral.toFixed(2).replace('.', ',')}
            </CardTitle>
            <CardDescription className="text-xs opacity-90 text-card dark:text-muted-foreground">Média Geral</CardDescription>
          </Card>

          <Card className="text-center bg-card/10 rounded-lg backdrop-blur-sm border-none gap-0 p-2">
            <CardTitle className="text-lg font-bold text-secondary">
              {totalRedacoes}
            </CardTitle>
            <CardDescription className="text-xs opacity-90 text-card dark:text-muted-foreground">Redações</CardDescription>
          </Card>

          <Card className="text-center bg-card/10 rounded-lg backdrop-blur-sm border-none gap-0 p-2">
            <CardTitle className="text-lg font-bold text-secondary">
              {totalMentorias}
            </CardTitle>
            <CardDescription className="text-xs opacity-90 text-card dark:text-muted-foreground">Mentorias</CardDescription>
          </Card>
        </div>
      </div>
    );
  }
}
