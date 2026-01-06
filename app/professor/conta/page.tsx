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
import InputFotoPerfil from "@/components/input-foto-perfil";

export default async function Page() {
    const session = await auth.api.getSession({
        headers: await headers() // you need to pass the headers object.
    })

    if (!session?.user) {
        await auth.api.signOut({
            headers: await headers()
        })
        return redirect('/login')
    }

    const professor = await obterProfessorPorId(session.user.id)

    const fotoPerfil = professor?.image ? await obterUrlImagem(professor.image) : null

    return (
        <Suspense fallback={<Loading />}>
            <div className="w-full h-full min-h-screen max-h-screen relative pt-14 overflow-hidden">
                <HeaderProfessor>
                    <div className="max-[1025px]:pl-10">
                        <h1 className="text-xl font-bold">Sua Conta</h1>
                        <p className="text-xs text-muted-foreground max-sm:leading-none max-sm:truncate">Gerencie suas informações</p>
                    </div>
                </HeaderProfessor>

                <main className="grid grid-cols-3 max-[1025px]:grid-rows-2 max-md:grid-cols-1 p-5 max-[1025px]:gap-y-5 min-md:gap-x-5 w-full h-full">
                    <InputFotoPerfil professor={professor!} fotoPerfil={fotoPerfil} />

                    <Card className="col-span-2 max-sm:gap-4">
                        <CardHeader className="flex justify-between items-center py-0">
                            <CardTitle>Informações Pessoais</CardTitle>
                            <FormularioConta professor={professor!} />
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

