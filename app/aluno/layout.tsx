import { ReactNode } from 'react'
import type { Metadata } from "next";
import { Poppins } from 'next/font/google';

import "../globals.css";
import { FooterAluno } from '@/components/ui/footer-aluno';
import Header from '@/components/ui/header';
import { Toaster } from "@/components/ui/sonner"
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { ProvedorAluno } from '@/context/provedor-aluno';
import { FormularioTelefone } from '@/components/formulario-telefone';
import { IncializarNotificacoes } from '@/components/inicializar-notificacoes';
import { EdgePollingProvider } from '@/components/edge-polling-provider';

const poppins = Poppins({
    weight: ['200', '300', '400', '500', '600', '700', '800', '900'], // Specify the weights you need
    subsets: ['latin'],
    display: 'swap', // Or 'fallback' or 'optional'
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
        headers: await headers() // you need to pass the headers object.
    })

    if (!session?.user) {
        redirect('/')
    }

    if (session.user.role !== 'user') {
        await auth.api.signOut({
            headers: await headers()
        })
        redirect('/')
    }

    const userId = session.user.id;

    return (
        <html lang="pt-BR">
            <body
                className={`${poppins.className} antialiased`}
            >
                <IncializarNotificacoes userId={userId} />
                <EdgePollingProvider userId={userId} />
                <ProvedorAluno>
                    <FormularioTelefone user={session.user} />
                    <main>{children}</main>
                    <FooterAluno />
                    <Toaster richColors theme="light" />
                </ProvedorAluno>
            </body>
        </html>
    )
}