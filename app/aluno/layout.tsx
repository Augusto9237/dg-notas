import { ReactNode, Suspense } from 'react';
import type { Metadata } from "next";
import { Poppins } from 'next/font/google';
import { SpeedInsights } from '@vercel/speed-insights/next';

import "../globals.css";
import AlunoWrapper from './wrapper';
import Loading from './loading';
import { Analytics } from '@vercel/analytics/next';
import { obterInformacoes } from '@/actions/configuracoes';

const poppins = Poppins({
    weight: ['400', '500', '600', '700'],
    subsets: ['latin'],
    display: 'swap',
});

export async function generateMetadata(): Promise<Metadata> {
    const informacoes = await obterInformacoes()

    const metadata: Metadata = {
        title: `${informacoes?.nomePlataforma} - Aluno` || "Plataforma Educacional",
        description: informacoes?.slogan || 'Plataforma educacional para aprimorar suas habilidades de redação.',
        appleWebApp: {
            capable: true,
            statusBarStyle: 'default',
            title: `${informacoes?.nomePlataforma} - Professor` || "Plataforma Educacional",
        },
        icons: {
            apple: '/ios/180.png',
        },
    };

    return metadata
}

interface RootLayoutProps {
    children: ReactNode
}

export default async function RootLayout({ children }: RootLayoutProps) {
    const configuracoes = await obterInformacoes();

    // Monta a string de variáveis apenas se houver cores salvas
    const themeStyle = configuracoes?.coresSistema
        ? `
      :root {
        --primary: ${configuracoes.coresSistema[0].valor};
        --primary-foreground: ${configuracoes.coresSistema[1].valor};
        --secondary: ${configuracoes.coresSistema[2].valor};
        --secondary-foreground: ${configuracoes.coresSistema[3].valor};
      }
    `: null

    return (
        <html lang="pt-BR" suppressHydrationWarning>
            <head>
                {themeStyle && <style>{themeStyle}</style>}
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-status-bar-style" content="default" />
                <meta name="apple-mobile-web-app-title" content={`${configuracoes?.nomePlataforma} - Aluno` || "Plataforma Educacional - Aluno"} />
                <link rel="apple-touch-icon" href="/ios/180.png" />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover"
                />
            </head>
            <body className={`${poppins.className} antialiased`}>
                <Suspense fallback={<Loading />}>
                    <AlunoWrapper configuracoes={configuracoes}>
                        {children}
                    </AlunoWrapper>
                </Suspense>
                <SpeedInsights />
                <Analytics />
            </body>
        </html>
    )
}