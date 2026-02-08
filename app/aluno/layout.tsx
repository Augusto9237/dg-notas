import { ReactNode, Suspense } from 'react';
import type { Metadata } from "next";
import { Poppins } from 'next/font/google';
import { SpeedInsights } from '@vercel/speed-insights/next';

import "../globals.css";
import AlunoWrapper from './wrapper';
import Loading from './loading';

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
                <Suspense fallback={<Loading />}>
                    <AlunoWrapper>
                        {children}
                    </AlunoWrapper>
                </Suspense>
                <SpeedInsights />
            </body>
        </html>
    )
}