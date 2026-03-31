
import Image from "next/image";
import { Suspense } from "react";
import Loading from "../(dashboard)/loading";
import InformacoesApp from "@/components/informacoes-app";
import { IdentidadeVisual } from "@/components/identidade-visual";
import { FotoCapa } from "@/components/foto-capa";
import { HeaderTeacher } from "@/components/header-professor";

export default async function Page() {

    return (
        <Suspense fallback={<Loading />}>
            <div className="w-full h-screen relative flex flex-col pt-16 max-lg:overflow-y-auto">
                <HeaderTeacher title="Configurações" description="Gerencie a aparência e informações da sua plataforma" />

                <main className="grid grid-cols-3 max-lg:grid-cols-1 gap-5 p-5 w-full h-full flex-1 overflow-hidden">
                    {/* INFORMAÇÕES DA PLATAFORMA */}
                    <InformacoesApp />
                    {/* IDENTIDADE VISUAL */}
                    <IdentidadeVisual />
                    <FotoCapa />
                </main>

            </div>
        </Suspense>
    )
}

