import { listarAlunosGoogle } from "@/actions/alunos";
import { ListarAvaliacoes, listarTemasMes } from "@/actions/avaliacao";
import { listarMentoriasMes } from "@/actions/mentoria";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { CardDashboard } from "@/components/card-dashboard";
import { TabelaTopAlunos } from "@/components/tabela-top-alunos";
import { SeletorData } from "@/components/seletor-data";
import { calcularMediaGeral, rankearMelhoresAlunos } from "@/lib/dashboard-utils";
import { Prisma } from "@/app/generated/prisma";
import { UltimasAvaliacoes } from "@/components/ultimas-avaliacoes";
import { HeaderProfessor } from "@/components/header-professor";
import { ListaCardsDashboard } from "@/components/lista-cards-dashbord";


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
    const [avaliacoes, mentorias, temasMes, alunos] = await Promise.all([
        ListarAvaliacoes(mes, ano, 1, 1000),
        listarMentoriasMes(mes, ano),
        listarTemasMes(mes, ano),
        listarAlunosGoogle('', 1, 1000)
    ]);

    const meses = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ]

    return (
        <div className="w-full h-full min-h-screen relative pt-14 overflow-y-auto">
            <HeaderProfessor>
                <div className="flex flex-col max-[1025px]:ml-10">
                    <h1 className="text-lg font-bold ">
                        Olá, {session?.user.name}!
                    </h1>
                    <p className="text-xs text-muted-foreground leading-none">Dados de {mes && ano ? `${meses[Number(mes) - 1]} de ${ano}` : 'este mês'}</p>
                </div>
                <SeletorData />
            </HeaderProfessor>

            <main className="flex flex-col gap-4 p-5 h-full">
                <ListaCardsDashboard alunos={alunos.data} temas={temasMes} avaliacoes={avaliacoes.data} mentorias={mentorias} meses={meses} />

                <div className="grid grid-cols-2 max-[1025px]:grid-cols-1 gap-5 flex-1 h-full">
                    <UltimasAvaliacoes temasMes={temasMes} avaliacoes={avaliacoes.data} />
                    <TabelaTopAlunos avaliacoes={avaliacoes.data} />
                </div>
            </main >
        </div >
    )
}