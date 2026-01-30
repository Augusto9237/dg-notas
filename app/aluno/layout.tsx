import { ReactNode } from 'react';
import type { Metadata } from "next";
import { Poppins } from 'next/font/google';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { SpeedInsights } from '@vercel/speed-insights/next';

import "../globals.css";

import { FooterAluno } from '@/components/ui/footer-aluno';
import { Toaster } from "@/components/ui/sonner";
import { FormularioTelefone } from '@/components/formulario-telefone';
import { InicializarNotificacoes } from '@/components/inicializar-notificacoes';
import { PwaInstallPrompt } from '@/components/pwa-install-prompt';
import { InstalarIos } from '@/hooks/instalar-ios';

import { auth } from '@/lib/auth';
import { ListarAvaliacoesAlunoId, ListarCriterios, ListarTemasDisponiveis } from '@/actions/avaliacao';
import { listarMentoriasAluno } from '@/actions/mentoria';
import { ProvedorAluno } from '@/context/provedor-aluno';
import { ProvedorTemas } from '@/context/provedor-temas';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebarAluno } from '@/components/app-sidebar-aluno';
import { Clock } from 'lucide-react';
import { enviarNotificacaoParaTodos } from '@/actions/notificacoes';

const poppins = Poppins({
    weight: ['400', '500', '600', '700'],
    subsets: ['latin'],
    display: 'swap',
});

export const metadata: Metadata = {
    title: 'DG - Curso de Redação - Aluno',
    description: 'Plataforma de correção de redações e agendamento de mentorias',
    appleWebApp: {
        capable: true,
        statusBarStyle: 'default',
        title: 'DG - Redação',
    },
    icons: {
        apple: '/ios/180.png',
    },
};

interface RootLayoutProps {
    children: ReactNode
}

export default async function RootLayout({ children }: RootLayoutProps) {
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
            <html lang="pt-BR" suppressHydrationWarning>
                <head>
                    <meta name="apple-mobile-web-app-capable" content="yes" />
                    <meta name="apple-mobile-web-app-status-bar-style" content="default" />
                    <meta name="apple-mobile-web-app-title" content="DG - Redação" />
                    <link rel="apple-touch-icon" href="/ios/180.png" />
                    <meta
                        name="viewport"
                        content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover"
                    />
                </head>
                <body className={`${poppins.className} antialiased`}>
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
                </body>
            </html>
        )
    } else if (session.user.matriculado === true) {

        const userId = session.user.id;

        // Parallel data fetching for performance
        const [avaliacoes, mentorias, temas, criterios] = await Promise.all([
            ListarAvaliacoesAlunoId(userId),
            listarMentoriasAluno(userId),
            ListarTemasDisponiveis(userId),
            ListarCriterios()
        ]);

        return (
            <html lang="pt-BR" suppressHydrationWarning>
                <head>
                    <meta name="apple-mobile-web-app-capable" content="yes" />
                    <meta name="apple-mobile-web-app-status-bar-style" content="default" />
                    <meta name="apple-mobile-web-app-title" content="DG - Redação" />
                    <link rel="apple-touch-icon" href="/ios/180.png" />
                    <meta
                        name="viewport"
                        content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover"
                    />
                </head>
                <body className={`${poppins.className} antialiased`}>
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
                            avaliacoes={avaliacoes}
                            mentorias={mentorias}
                            temas={temas}
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
                    <SpeedInsights />
                </body>
            </html>
        )
    }
}