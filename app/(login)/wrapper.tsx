import { ListarAvaliacoesAlunoId, ListarCriterios, ListarTemasDisponiveis } from "@/actions/avaliacao";
import { listarMentoriasAluno } from "@/actions/mentoria";
import { enviarNotificacaoParaTodos } from "@/actions/notificacoes";
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
import { headers } from "next/headers";
import Image from "next/image";
import { redirect } from "next/navigation";
import { ReactNode } from "react";
import { Toaster } from "sonner";

interface RootLayoutProps {
    children: ReactNode
}


export default async function LoginWrapper({ children }: RootLayoutProps) {
    const session = await auth.api.getSession({
        headers: await headers() // you need to pass the headers object.
    })

    if (session?.user) {
        if (session.user.role === 'admin') {
            redirect('/professor')
        } else {
            redirect('/aluno')
        }
    }

    return (
        <>
            <InstalarIos />
            <PwaInstallPrompt />
            <div className="grid min-h-svh lg:grid-cols-2">
                <div className="relative flex items-center justify-center bg-primary">
                    <div className="w-full max-w-md flex flex-col items-center justify-items-center">
                        <Image
                            src="/Sublogo4.svg"
                            alt="Logo"
                            width={488}
                            height={400}
                            className="h-[80px] max-sm:h-[88px] w-[360px] max-sm:w-[280px] object-cover"
                        />
                        {children}
                    </div>
                    <p className='absolute bottom-2 right-0 left-0 text-xs text-center text-muted'>Desenvolvido por AS CODE©</p>
                </div>
                <div className="bg-muted relative hidden lg:block">
                    <Image
                        src="/foto-1.jpeg"
                        alt="Image"
                        fill
                        className="object-cover"
                    />
                </div>
            </div>
        </>
    )
}