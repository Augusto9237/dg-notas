import { listarAlunosGoogle } from "@/actions/alunos";
import { ListarAvaliacoes, listarTemasMes } from "@/actions/avaliacao";
import { listarMentoriasMes } from "@/actions/mentoria";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { TabelaTopAlunos } from "@/components/tabela-top-alunos";
import { SeletorData } from "@/components/seletor-data";
import { UltimasAvaliacoes } from "@/components/ultimas-avaliacoes";
import { HeaderTeacher } from "@/components/header-professor";
import { ListaCardsDashboard, } from "@/components/lista-cards-dashbord";
import { Suspense } from "react";
import Loading from "./loading";
import { normalizarParams } from "@/helpers/normalizar-params";

export default async function Page({
    searchParams
}: {
    searchParams: Promise<{ mes?: string, ano?: string }>
}) {

    const session = await auth.api.getSession({ headers: await headers() })
    const params = await searchParams

    const { mes, ano } = normalizarParams(params.mes, params.ano);

    // OTIMIZAÇÃO CRÍTICA: Executar todas as queries em paralelo
    const [mentorias, temasMes] = await Promise.all([
        listarMentoriasMes(Number(mes), Number(ano)),
        listarTemasMes(Number(mes), Number(ano)),
    ]);

    const meses = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ]

    const ultimosTemas = temasMes.slice(0, 10)
    const { total } = await listarAlunosGoogle()
    const avaliacoesIniciais = await ListarAvaliacoes(Number(mes), Number(ano), 1, 1000)

    return (
        <Suspense fallback={<Loading />}>
            <div className="w-full h-full min-h-screen relative pt-16 overflow-y-auto">
                <HeaderTeacher title={`Olá, ${session?.user.name}!`} description="Bem - vindo ao seu Painel">
                    <div className="w-full flex-1 flex justify-end">
                        <SeletorData />
                    </div>
                </HeaderTeacher>

                <main className="flex flex-col gap-4 p-5 h-full">
                    <ListaCardsDashboard totalAlunos={total} temas={temasMes} avaliacoes={avaliacoesIniciais.data} mentorias={mentorias} meses={meses} />

                    <div className="grid grid-cols-2 max-[1025px]:grid-cols-1 gap-5 flex-1 h-full">
                        <UltimasAvaliacoes temasMes={ultimosTemas} />
                        <TabelaTopAlunos avaliacoes={avaliacoesIniciais.data} />
                    </div>
                </main >
            </div >
        </Suspense>
    )
}