import { listarAlunosGoogle } from "@/actions/alunos";
import { ListarAvaliacoes, ListarTemas, listarTemasMes } from "@/actions/avaliacao";
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
import { Prisma, Tema } from "@/app/generated/prisma";

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

export default async function Page({
    searchParams
}: {
    searchParams: Promise<{ mes: string, ano: string }>
}) {
    const mes = (await searchParams).mes;
    const ano = (await searchParams).ano;
    const session = await auth.api.getSession({
        headers: await headers()
    })
    const alunos = await listarAlunosGoogle();

    let avaliacoes: Avaliacao[] = [];
    let mentorias: Mentoria[] = [];
    let temasMes: Tema[] = [];

    if (mes === undefined || ano === undefined) {
        avaliacoes = await ListarAvaliacoes();
        mentorias = await listarMentoriasMes();
        temasMes = await listarTemasMes();
    } else {
        mentorias = await listarMentoriasMes(Number(mes), Number(ano));
        avaliacoes = await ListarAvaliacoes(Number(mes), Number(ano));
        temasMes = await listarTemasMes(Number(mes), Number(ano));
    }

    const mediaGeral = calcularMediaGeral(avaliacoes);
    const top10 = rankearMelhoresAlunos(avaliacoes);

    return (
        <div className="w-full">
            <div className='flex justify-between items-center h-14 p-5 mt-3 gap-2 relative'>
                <SidebarTrigger className='absolute' />
                <div className='max-[1025px]:ml-10 overflow-hidden'>
                    <h1 className="text-xl max-sm:text-lg font-bold">Olá,  {session?.user.name}!</h1>
                    <p className="text-xs text-muted-foreground truncate"></p>
                </div>
                <SeletorData />
            </div>
            <main className="flex flex-col gap-4 p-5">
                <div className="grid grid-cols-4 max-[1025px]:grid-cols-2 gap-5 w-full">
                    <CardDashboard
                        description="Média Geral"
                        value={mediaGeral}
                        icon={<FaChartLine size={26} />}
                        footerText="Média geral de todos os alunos"
                    />

                    <CardDashboard
                        description="Total de Alunos"
                        value={alunos.length}
                        icon={<Users size={26} />}
                        footerText="Alunos cadastrados"
                    />

                    <CardDashboard
                        description="Total de Temas"
                        value={temasMes.length}
                        icon={<FileType size={26} />}
                        footerText="Temas cadastrados"
                    />

                    <CardDashboard
                        description="Total de Mentorias"
                        value={mentorias.length}
                        icon={<RiUserStarLine size={26} />}
                        footerText="Mentorias cadastradas"
                    />
                </div>

                <div className="grid grid-cols-2 gap-5">
                    <div>temas</div>
                    <TabelaTopAlunos alunos={top10} />
                </div>
            </main>
        </div>
    )
}