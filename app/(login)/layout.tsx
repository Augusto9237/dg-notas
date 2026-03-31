import { ReactNode, Suspense } from 'react'
import type { Metadata } from "next";
import { Poppins } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next'

import "../globals.css";
import { Toaster } from 'sonner';
import Loading from './loading';
import LoginWrapper from './wrapper';
import { obterInformacoes } from '@/actions/configuracoes';

const poppins = Poppins({
    weight: ['200', '300', '400', '500', '600', '700', '800', '900'], // Specify the weights you need
    subsets: ['latin'],
    display: 'swap', // Or 'fallback' or 'optional'
});

export async function generateMetadata(): Promise<Metadata> {
    const informacoes = await obterInformacoes()

    const metadata: Metadata = {
        title: `${informacoes?.nomePlataforma}` || "Plataforma Educacional",
        description: informacoes?.slogan || 'Plataforma educacional para aprimorar suas habilidades de redação.',
        appleWebApp: {
            capable: true,
            statusBarStyle: 'default',
            title: `${informacoes?.nomePlataforma}` || "Plataforma Educacional",
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
    const configuracoes = await obterInformacoes()

    return (
        <html lang="pt-BR" suppressHydrationWarning>
            <head>
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-status-bar-style" content="default" />
                <meta name="apple-mobile-web-app-title" content={configuracoes?.nomePlataforma || 'App Educacional'} />
                <link rel="apple-touch-icon" href="/ios/180.png" />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover"
                />
            </head>
            <body
                className={`${poppins.className} antialiased`}
            >
                <Suspense fallback={<Loading />}>
                    <LoginWrapper configuracoes={configuracoes!}>
                        {children}
                    </LoginWrapper>
                </Suspense>
                <Toaster richColors theme="light" />
                <Analytics />
            </body>
        </html >
    )
}