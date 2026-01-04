import { ReactNode, Suspense } from 'react'
import type { Metadata } from "next";
import { Poppins } from 'next/font/google';

import "../globals.css";
import Image from 'next/image';
import { Toaster } from 'sonner';
import Loading from './loading';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { InstalarIos } from '@/hooks/instalar-ios';

const poppins = Poppins({
    weight: ['200', '300', '400', '500', '600', '700', '800', '900'], // Specify the weights you need
    subsets: ['latin'],
    display: 'swap', // Or 'fallback' or 'optional'
});

export const metadata: Metadata = {
    title: "DG - Curso de Redação",
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
        <html lang="pt-BR">
            <head>
                {/* ↓↓↓ ADICIONE ISTO ↓↓↓ */}
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-status-bar-style" content="default" />
                <meta name="apple-mobile-web-app-title" content="DG - Redação" />
                <link rel="apple-touch-icon" href="/ios/180.png" />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover"
                />
            </head>
            <body
                className={`${poppins.className} antialiased`}
            >
                <InstalarIos />
                <Suspense fallback={<Loading />}>
                    <div className="grid min-h-svh lg:grid-cols-2">
                        <div className="flex items-center justify-center bg-primary">
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
                        </div>
                        <div className="bg-muted relative hidden lg:block">
                            <Image
                                src="/foto-1.jpeg"
                                alt="Image"
                                fill
                                className="object-cover dark:brightness-[0.2] dark:grayscale"
                            />
                        </div>
                    </div>
                </Suspense>
                <Toaster richColors theme="light" />
            </body>
        </html >
    )
}