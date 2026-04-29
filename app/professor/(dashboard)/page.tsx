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
import { cacheLife, cacheTag, updateTag } from "next/cache";


// Helper para normalizar os parâmetros
function normalizarParams(mes?: string, ano?: string) {
    if (!mes || !ano) return { mes: undefined, ano: undefined };

    const mesNum = Number(mes);
    const anoNum = Number(ano);

    // Validação básica
    if (isNaN(mesNum) || isNaN(anoNum) || mesNum < 1 || mesNum > 12) {
        return { mes: undefined, ano: undefined };
    }

    return { mes: mesNum, ano: anoNum };
}

export default async function Page({
    searchParams
}: {
    searchParams: Promise<{ mes?: string, ano?: string }>
}) {
    // Executar autenticação e params em paralelo
    const [session, params] = await Promise.all([
        auth.api.getSession({ headers: await headers() }),
        searchParams
    ]);

    const { mes, ano } = normalizarParams(params.mes, params.ano);

    // OTIMIZAÇÃO CRÍTICA: Executar todas as queries em paralelo
    const [mentorias, temasMes, alunos] = await Promise.all([
        listarMentoriasMes(mes, ano),
        listarTemasMes(mes, ano),
        listarAlunosGoogle('', 1, 1000)
    ]);

    async function listarAvaliacoesIniciais() {
        'use cache: private'
        cacheTag('listar-avaliacoes-home')
        cacheLife({ revalidate: 900 })

        const avaliacoes = await ListarAvaliacoes(mes, ano, 1, 1000)

        return avaliacoes
    }

    const meses = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ]

    const ultimosTemas = temasMes.slice(0, 10)

    // Avaliações para não chamar múltiplas vezes
    const avaliacoesIniciais = await listarAvaliacoesIniciais();

    return (
        <div className="w-full h-full min-h-screen relative pt-16 overflow-y-auto">
            <HeaderTeacher title={`Olá, ${session?.user.name}!`} description="Bem - vindo ao seu Painel">
                <div className="w-full flex-1 flex justify-end">
                    <SeletorData />
                </div>
            </HeaderTeacher>

            <main className="flex flex-col gap-4 p-5 h-full">
                <ListaCardsDashboard alunos={alunos.data} temas={temasMes} avaliacoes={avaliacoesIniciais.data} mentorias={mentorias} meses={meses} />

                <div className="grid grid-cols-2 max-[1025px]:grid-cols-1 gap-5 flex-1 h-full">
                    <UltimasAvaliacoes temasMes={ultimosTemas} avaliacoes={avaliacoesIniciais.data} />
                    <TabelaTopAlunos avaliacoes={avaliacoesIniciais.data} ultimotemaId={temasMes[0]?.id} />
                </div>
            </main >
        </div >
    )
}