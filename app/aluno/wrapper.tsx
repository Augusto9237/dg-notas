
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
import { cacheLife, cacheTag } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ReactNode } from "react";
import { Toaster } from "sonner";

interface RootLayoutProps {
    children: ReactNode
}


export default async function AlunoWrapper({ children }: RootLayoutProps) {

    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session?.user) {
        redirect('/');
    }

    if (session.user.role !== 'user') {
        await auth.api.signOut({
            headers: await headers()
        });
        redirect('/');
    }

    if (session.user.matriculado === false) {
        await enviarNotificacaoParaTodos(
            'admin',
            'Novo login com acesso pendente',
            `O aluno ${session.user.name} realizou login no aplicativo e solicita liberação de acesso`,
            '/professor/alunos'
        )
        return (
            <>
                <InstalarIos />
                <PwaInstallPrompt />
                <InicializarNotificacoes userId={session.user.id} />
                <FormularioTelefone user={session.user} />
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
    } else if (session.user.matriculado === true) {

        const userId = session.user.id;

        async function listarMentorias() {
            'use cache: private'
            cacheTag('listar-mentorias-aluno')

            cacheLife({ revalidate: 900 })

            const mentorias = await listarMentoriasAluno(userId)

            return mentorias
        }

        async function ListarAvaliacoes() {
            'use cache: private'
            cacheTag('listar-avaliacoes-aluno')

            cacheLife({ revalidate: 900 })

            const avaliacoes = await ListarAvaliacoesAlunoId(userId);
            return avaliacoes;
        }

        async function ListarTemas() {
            'use cache: private'
            cacheTag('listar-temas-aluno')

            cacheLife({ revalidate: 900 })

            const temas = await ListarTemasDisponiveis(userId)

            return temas
        }

        const criterios = await ListarCriterios();


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
                        avaliacoes={(await ListarAvaliacoes())}
                        mentorias={(await listarMentorias())}
                        temas={(await ListarTemas())}
                        criterios={criterios}
                    >
                        <SidebarProvider>
                            <AppSidebarAluno />
                            <SidebarInset className="relative">
                                <FormularioTelefone user={session.user} />
                                <main>
                                    {children}
                                </main>
                                <FooterAluno />
                            </SidebarInset>
                        </SidebarProvider>
                        <Toaster richColors theme="light" />
                    </ProvedorAluno>
                </ProvedorTemas>
            </>
        )
    }
}