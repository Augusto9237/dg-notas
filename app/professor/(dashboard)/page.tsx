import { listarAlunosGoogle } from "@/actions/alunos";
import { ListarAvaliacoes, listarTemasMes, listarTemasProfessor } from "@/actions/avaliacao";
import { listarDiasSemana, listarMentoriasMes, listarSlotsHorario } from "@/actions/mentoria";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { TabelaTopAlunos } from "@/components/tabela-top-alunos";
import { SeletorData } from "@/components/seletor-data";
import { UltimasAvaliacoes } from "@/components/ultimas-avaliacoes";
import { HeaderTeacher } from "@/components/header-professor";
import { ListaCardsDashboard, } from "@/components/lista-cards-dashbord";
import { Suspense } from "react";
import { cacheLife, cacheTag, updateTag } from "next/cache";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { Button } from "@react-email/components";
import { CardMentoriaProfessor } from "@/components/card-mentoria-professor";
import { ModalMentoriaProfessor } from "@/components/modal-mentoria-professor";


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
    const [mentorias, temasProfessor] = await Promise.all([
        listarMentoriasMes(mes, ano),
        listarTemasMes(mes, ano, session?.user.id!),
    ]);

    const meses = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ]

    const ultimosTemas = temasProfessor.slice(0, 10)
    const mentoriasHoje = mentorias.filter(mentoria => new Date(mentoria.horario.data) === new Date())
    const diasSemana = await listarDiasSemana()
    const slotsHorario = await listarSlotsHorario()

    const diasAtivos = diasSemana.filter((dia) => dia.status === true)
    const horariosAtivos = slotsHorario.filter((horario) => horario.status === true)

    return (
        <div className="w-full h-full min-h-screen relative pt-16 overflow-y-auto">
            <HeaderTeacher title={`Olá, ${session?.user.name}!`} description="Bem - vindo ao seu Painel">
                <div className="w-full flex-1 flex justify-end">
                    <SeletorData />
                </div>
            </HeaderTeacher>

            <main className="flex flex-col gap-4 p-5 h-full">
                {/* <ListaCardsDashboard alunos={alunos.data} temas={temasMes} avaliacoes={avaliacoesIniciais.data} mentorias={mentorias} meses={meses} /> */}

                <div className="grid grid-cols-3 max-[1025px]:grid-cols-1 gap-5 flex-1 h-full">
                    <div className="flex flex-1 col-span-2">
                        <UltimasAvaliacoes temasMes={ultimosTemas} />
                    </div>
                    <Card>
                        <CardHeader className="flex items-center justify-between">
                            <CardTitle>Mentorias do dia</CardTitle>
                            <CardDescription>{format(new Date(), 'dd/MM/yyyy')}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col">
                            {mentoriasHoje.map((mentoria) => (
                                <ModalMentoriaProfessor key={mentoria.id} mentoria={mentoria} diasSemana={diasAtivos} slotsHorario={horariosAtivos} />
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </main >
        </div >
    )
}