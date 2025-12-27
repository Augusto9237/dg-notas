import { ReactNode } from 'react';
import type { Metadata } from "next";
import { Poppins } from 'next/font/google';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import "../globals.css";

import { FooterAluno } from '@/components/ui/footer-aluno';
import { Toaster } from "@/components/ui/sonner";
import { FormularioTelefone } from '@/components/formulario-telefone';
import { InicializarNotificacoes } from '@/components/inicializar-notificacoes';
import { EdgePollingProvider } from '@/components/edge-polling-provider';

import { auth } from '@/lib/auth';
import { ListarAvaliacoesAlunoId, ListarTemasDisponiveis } from '@/actions/avaliacao';
import { listarMentoriasAluno } from '@/actions/mentoria';
import { ProvedorAluno } from '@/context/provedor-aluno';

const poppins = Poppins({
    weight: ['200', '300', '400', '500', '600', '700', '800', '900'],
    subsets: ['latin'],
    display: 'swap',
});

export const metadata: Metadata = {
    title: 'DG - Curso de Redação - Aluno',
    description: 'Plataforma de correção de redações e agendamento de mentorias',
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

    const userId = session.user.id;

    // Parallel data fetching for performance
    const [avaliacoes, mentorias, temas] = await Promise.all([
        ListarAvaliacoesAlunoId(userId),
        listarMentoriasAluno(userId),
        ListarTemasDisponiveis(userId),
    ]);

    return (
        <html lang="pt-BR">
            <body className={`${poppins.className} antialiased`}>
                <InicializarNotificacoes userId={userId} />
                <EdgePollingProvider userId={userId} />
                <ProvedorAluno
                    userId={userId}
                    avaliacoes={avaliacoes}
                    mentorias={mentorias}
                    temas={temas}
                >
                    <FormularioTelefone user={session.user} />
                    <main>{children}</main>
                    <FooterAluno />
                    <Toaster richColors theme="light" />
                </ProvedorAluno>
            </body>
        </html>
    )
}