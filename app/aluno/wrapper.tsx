
import { ListarCriterios } from "@/actions/avaliacao";
import { avisoNovoAcesso, enviarNotificacaoParaTodos } from "@/actions/notificacoes";
import { AppSidebarAluno } from "@/components/app-sidebar-aluno";
import { FormularioTelefone } from "@/components/formulario-telefone";
import { InicializarNotificacoes } from "@/components/inicializar-notificacoes";
import { PwaInstallPrompt } from "@/components/pwa-install-prompt";
import { FooterAluno } from "@/components/ui/footer-aluno";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { ProvedorAluno } from "@/context/provedor-aluno";
import { ProvedorTemas } from "@/context/provedor-temas";
import { InstalarIos } from "@/hooks/instalar-ios";
import { auth } from "@/lib/auth";
import { Clock } from "lucide-react";
import { cacheLife, updateTag } from "next/cache";
import { headers, cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ReactNode } from "react";
import { Toaster } from "sonner";
import { Prisma, User } from "../generated/prisma";
import { atualizarCache } from "@/actions/cache";

type ConfiguracaoComCores = Prisma.ConfiguracaoGetPayload<{
    include: { coresSistema: true };
}>;

interface RootLayoutProps {
    children: ReactNode
    configuracoes: ConfiguracaoComCores | null;
    user: User
}


export default async function AlunoWrapper({ children, configuracoes, user }: RootLayoutProps) {

    if (user.matriculado === false) {
        await avisoNovoAcesso(user.name)


        return (
            <>
                <InstalarIos />
                <PwaInstallPrompt />
                <InicializarNotificacoes userId={user.id} />
                <FormularioTelefone user={user} />
                <main className='flex flex-col w-full h-screen justify-center items-center gap-2 p-5'>
                    <Clock className='stroke-primary' />
                    <h1 className="text-xl text-primary font-semibold">
                        Quase lá!
                    </h1>
                    <p className="text-muted-foreground">
                        Seu acesso ainda não foi liberado, mas estamos cuidando disso. Avisaremos você assim que for liberado.
                    </p>
                </main>
            </>
        )
    } else if (user.matriculado === true) {
        const userId = user.id;

        return (
            <>
                <ProvedorTemas
                    attribute="class"
                    defaultTheme="light"
                    enableSystem
                    disableTransitionOnChange
                >
                    <InstalarIos />
                    <PwaInstallPrompt />
                    <InicializarNotificacoes userId={userId} />
                    <ProvedorAluno
                        userId={userId}
                    >
                        <SidebarProvider>
                            <AppSidebarAluno logo={configuracoes?.logoSistema!} />
                            <SidebarInset className="relative">
                                <FormularioTelefone user={user} />
                                <main>
                                    {children}
                                </main>
                                <FooterAluno logo={configuracoes?.logoAplicativo!} />
                            </SidebarInset>
                        </SidebarProvider>
                        <Toaster richColors theme="light" />
                    </ProvedorAluno>
                </ProvedorTemas>
            </>
        )
    }
}