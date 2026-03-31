import { PwaInstallPrompt } from "@/components/pwa-install-prompt";
import { InstalarIos } from "@/hooks/instalar-ios";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import Image from "next/image";
import { redirect } from "next/navigation";
import { ReactNode } from "react";
import { Configuracao } from "../generated/prisma";

interface RootLayoutProps {
    children: ReactNode
    configuracoes: Configuracao
}


export default async function LoginWrapper({ children, configuracoes }: RootLayoutProps) {
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
                            src={configuracoes?.logoSistema}
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
                        src={configuracoes?.fotoCapa || '/login-background.jpg'}
                        alt="Image"
                        fill
                        className="object-cover"
                    />
                </div>
            </div>
        </>
    )
}