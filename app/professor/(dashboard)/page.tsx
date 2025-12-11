import { listarAlunosGoogle } from "@/actions/alunos";
import { ListarAvaliacoes, listarTemasMes } from "@/actions/avaliacao";
import { listarMentoriasMes } from "@/actions/mentoria";
import { FileType, Users } from "lucide-react";
import { RiUserStarLine } from "react-icons/ri";
import { FaChartLine } from "react-icons/fa";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { CardDashboard } from "@/components/card-dashboard";
import { TabelaTopAlunos } from "@/components/tabela-top-alunos";
import { SeletorData } from "@/components/seletor-data";
import { calcularMediaGeral, rankearMelhoresAlunos } from "@/lib/dashboard-utils";
import { Prisma } from "@/app/generated/prisma";
import { UltimasAvaliacoes } from "@/components/ultimas-avaliacoes";
import { HeaderProfessor } from "@/components/header-professor";

type Avaliacao = Prisma.AvaliacaoGetPayload<{
    include: {
        aluno: true,
        criterios: true,
        tema: true,
    }
}>

type Mentoria = Prisma.MentoriaGetPayload<{
    include: {
        aluno: true,
        horario: true,
    }
}>


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
        ListarAvaliacoes(mes, ano),
        listarMentoriasMes(mes, ano),
        listarTemasMes(mes, ano),
        listarAlunosGoogle()
    ]);

    // Cálculos após receber os dados
    const mediaGeral = calcularMediaGeral(avaliacoes);
    const top10 = rankearMelhoresAlunos(avaliacoes);

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
                <div className="grid grid-cols-4 max-[1025px]:grid-cols-2 gap-5 w-full">
                    <CardDashboard
                        description="Média Geral"
                        value={mediaGeral.toFixed(2).replace('.', ',')}
                        icon={<FaChartLine size={26} />}
                        footerText={`Média geral de ${meses[Number(mes) - 1]}`}
                    />

                    <CardDashboard
                        description="Total de Alunos"
                        value={alunos.length}
                        icon={<Users size={26} />}
                        footerText={`Cadastrados até ${meses[Number(mes) - 1]}`}
                    />

                    <CardDashboard
                        description="Total de Temas"
                        value={temasMes.length}
                        icon={<FileType size={26} />}
                        footerText={mes && ano ? `Temas de ${meses[Number(mes) - 1]}` : 'Temas do mês atual'}
                    />

                    <CardDashboard
                        description="Total de Mentorias"
                        value={mentorias.length}
                        icon={<RiUserStarLine size={26} />}
                        footerText={mes && ano ? `Mentorias de ${meses[Number(mes) - 1]}` : 'Mentorias do mês atual'}
                    />
                </div>

                <div className="grid grid-cols-2 max-[1025px]:grid-cols-1 gap-5 flex-1 h-full">
                    <UltimasAvaliacoes temasMes={temasMes} avaliacoes={avaliacoes} />
                    <TabelaTopAlunos alunos={top10} />
                </div>
            </main >
        </div >
    )
}