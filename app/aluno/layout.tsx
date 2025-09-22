import { ReactNode } from 'react'
import type { Metadata } from "next";
import { Poppins } from 'next/font/google';

import "../globals.css";
import { FooterAluno } from '@/components/ui/footer-aluno';
import Header from '@/components/ui/header';
import { Toaster } from "@/components/ui/sonner"

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

export default function RootLayout({ children }: RootLayoutProps) {
    return (
        <html lang="pt-BR">
            <body
                className={`${poppins.className} antialiased`}
            >
                <Header />
                <main>{children}</main>
                <FooterAluno />
                <Toaster richColors theme="light" />
            </body>
        </html>
    )
}