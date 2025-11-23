import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function Page() {
    const session = await auth.api.getSession({
        headers: await headers() // you need to pass the headers object.
    })

    return (
        <div className="w-full h-full">
            <div className='flex justify-between items-center h-14 p-5 mt-3 relative'>
                <SidebarTrigger className='absolute' />
                <div className="max-[1025px]:pl-10">
                    <h1 className="text-xl font-bold">Sua Conta</h1>
                    <p className="text-xs text-muted-foreground">Gerencie suas informações pessoais e profissionais</p>
                </div>
            </div>

            <main className="grid grid-cols-3 p-5 gap-5  w-full">
                <Card className="w-full items-center">
                    <div className="flex flex-col items-center gap-4 justify-center  flex-1">
                        <Avatar className="size-52 border-2 border-primary">
                            <AvatarImage
                                src={session?.user?.image || 'https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541'}
                                alt={session?.user?.name || 'Avatar'}
                                className="object-cover"
                            />
                            <AvatarFallback className='text-xs'>
                                {session?.user?.name
                                    .split(" ")
                                    .map(word => word.charAt(0))
                                    .join("")
                                    .toUpperCase()
                                    .slice(0, 2)}
                            </AvatarFallback>
                        </Avatar>

                        <div className="text-center space-y-2">
                            <CardTitle className="text-primary">
                                Profª {session?.user.name}
                            </CardTitle>
                            <Badge variant={'secondary'}>
                                Redação ENEM
                            </Badge>
                        </div>
                    </div>
                </Card>

                <Card className="col-span-2">
                    <CardHeader>
                        <CardTitle>Informações Pessoais</CardTitle>
                        <CardDescription>
                            Atualize suas informações de perfil e configurações
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Nome completo</Label>
                                <p className="text-muted-foreground">{session?.user.name}</p>
                            </div>
                            <div>
                                <Label>Especialidade</Label>
                                <p className="text-muted-foreground">{session?.user.name}</p>
                            </div>
                            <div>
                                <Label>E-mail</Label>
                                <p className="text-muted-foreground">{session?.user.name}</p>
                            </div>
                            <div>
                                <Label>Telefone</Label>
                                <p className="text-muted-foreground">{session?.user.name}</p>
                            </div>
                        </div>

                        <div className="mt-4">
                            <Label>Bio</Label>
                            <p className="text-muted-foreground">A professora Adriana Figueiredo é mestre em Letras pela Universidade Mackenzie e graduada em Letras (Português-Inglês) pela Universidade Federal do Rio de Janeiro, com especialização em Leitura e Produção Textual.

                                Leciona há mais de 25 anos na preparação de alunos para concursos públicos.

                                Hoje, a Professora Adriana conta com 240 mil seguidores no Instagram, mais de 70 mil seguidores no Facebook e possui mais de 50 mil membros em seu grupo do Telegram.

                                No YouTube, a Professora Adriana é dona de um dos maiores canais de Língua Portuguesa do país, com mais de 100 mil inscritos.

                                Estes números colocam a professora como uma educadora de referência no ambiente digital, principalmente no segmento de ensino de português para concursos públicos.</p>
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    )
}