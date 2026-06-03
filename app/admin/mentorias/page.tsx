
import { listarDiasSemana, listarMentoriasMes, listarSlotsHorario } from "@/actions/mentoria";
import { Suspense } from "react";
import Loading from "./loading";
import { CalendarioGrande } from "@/components/calendario-grande";
import { AjustarAgenda } from "@/components/ajustar-agenda";
import { HeaderTeacher } from "@/components/header-professor";
import { normalizarParams } from "@/helpers/normalizar-params";


export default async function Page({
    searchParams
}: {
    searchParams: Promise<{ mes?: string, ano?: string }>
}) {
    const params = await searchParams
    const { mes, ano } = normalizarParams(params.mes, params.ano);

    const diasSemana = await listarDiasSemana()
    const slotsHorario = await listarSlotsHorario()

    const diasAtivos = diasSemana.filter((dia) => dia.status === true)
    const horariosAtivos = slotsHorario.filter((horario) => horario.status === true)
    const mentorias = await listarMentoriasMes(Number(mes), Number(ano))

    return (
        <Suspense fallback={<Loading />}>
            <div className="w-full h-full min-h-screen max-h-screen relative pt-16 overflow-hidden">
                <HeaderTeacher title="Mentorias" description="Lista de mentorias">
                    <AjustarAgenda diasSemana={diasSemana} slotsHorario={slotsHorario} />
                </HeaderTeacher>
                <main className="flex flex-col p-5 h-full flex-1 overflow-hidden max-h-[100vh - 3.5rem]">
                    <CalendarioGrande diasSemana={diasAtivos} slotsHorario={horariosAtivos} mentorias={mentorias} />
                </main>
            </div>
        </Suspense>
    )
}