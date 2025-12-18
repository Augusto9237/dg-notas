import { obterProfessorPorId } from "@/actions/admin";
import { FormularioConta } from "@/components/formulario-conta";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { auth } from "@/lib/auth";
import { obterUrlImagem } from "@/lib/obter-imagem";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import Loading from "../(dashboard)/loading";
import { HeaderProfessor } from "@/components/header-professor";

export default async function Page() {
    const session = await auth.api.getSession({
        headers: await headers() // you need to pass the headers object.
    })

    if (!session?.user) {
        return redirect('/login')
    }

    const professor = await obterProfessorPorId(session.user.id)

    const fotoPerfil = professor?.image ? await obterUrlImagem(professor.image) : null

    return (
        <Suspense fallback={<Loading />}>
            <div className="w-full h-full min-h-screen relative pt-14 overflow-y-auto">
                <HeaderProfessor>
                    <div className="max-[1025px]:pl-10">
                        <h1 className="text-xl font-bold">Sua Conta</h1>
                        <p className="text-xs text-muted-foreground max-sm:leading-none max-sm:truncate">Gerencie suas informações</p>
                    </div>
                    <FormularioConta professor={professor!} />
                </HeaderProfessor>

                <main className="grid grid-cols-3 max-[1025px]:grid-rows-2 max-[1025px]:grid-cols-1 p-5 max-[1025px]:gap-y-5 min-[1025px]:gap-x-5 w-full h-full">
                    <Card className="w-full items-center">
                        <div className="flex flex-col items-center gap-4 justify-center  flex-1">
                            <Avatar className="size-56 border-2 border-primary">
                                <AvatarImage
                                    src={fotoPerfil || ''}
                                    alt={professor?.name || 'Avatar'}
                                    className="object-cover"
                                />
                                <AvatarFallback className='text-xs'>
                                    {professor?.name
                                        .split(" ")
                                        .map(word => word.charAt(0))
                                        .join("")
                                        .toUpperCase()
                                        .slice(0, 2)}
                                </AvatarFallback>
                            </Avatar>

                            <div className="text-center space-y-2">
                                <CardTitle className="text-primary">
                                    {professor?.name}
                                </CardTitle>
                                <Badge variant={'secondary'}>
                                    {professor?.especialidade}
                                </Badge>
                            </div>
                        </div>
                    </Card>

                    <Card className="col-span-2 max-sm:gap-4">
                        <CardHeader>
                            <CardTitle>Informações Pessoais</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 max-sm:grid-cols-1 gap-4">
                                <div>
                                    <Label>Nome completo</Label>
                                    <p className="text-muted-foreground max-sm:text-sm">{professor?.name}</p>
                                </div>
                                <div>
                                    <Label>Especialidade</Label>
                                    <p className="text-muted-foreground max-sm:text-sm">{professor?.especialidade}</p>
                                </div>
                                <div>
                                    <Label>E-mail</Label>
                                    <p className="text-muted-foreground max-sm:text-sm">{professor?.email}</p>
                                </div>
                                <div>
                                    <Label>Telefone</Label>
                                    <p className="text-muted-foreground max-sm:text-sm">{professor?.telefone}</p>
                                </div>
                            </div>

                            <div className="mt-4">
                                <Label>Bio</Label>
                                <p className="text-muted-foreground max-sm:text-sm">{professor?.bio}</p>
                            </div>
                        </CardContent>
                    </Card>
                </main>
            </div>
        </Suspense>
    )
}

