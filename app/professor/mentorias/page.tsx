
import { listarDiasSemana, listarSlotsHorario } from "@/actions/mentoria";
import { Suspense } from "react";
import Loading from "./loading";
import { CalendarioGrande } from "@/components/calendario-grande";
import { AjustarAgenda } from "@/components/ajustar-agenda";
import { HeaderProfessor } from "@/components/header-professor";


export default async function Page() {
    const diasSemana = await listarDiasSemana()
    const slotsHorario = await listarSlotsHorario()

    const diasAtivos = diasSemana.filter((dia) => dia.status === true)
    const horariosAtivos = slotsHorario.filter((horario) => horario.status === true)

    return (
        <Suspense fallback={<Loading />}>
            <div className="w-full h-full min-h-screen max-h-screen relative pt-14 overflow-hidden">
                <HeaderProfessor>
                    <div className="max-[1025px]:pl-10">
                        <h1 className=" text-xl font-bold">Mentorias</h1>
                        <p className="text-xs text-muted-foreground leading-none">Lista de mentorias agendadas</p>
                    </div>
                    <AjustarAgenda diasSemana={diasSemana} slotsHorario={slotsHorario} />
                </HeaderProfessor>
                <main className="flex flex-col p-5 h-full flex-1 overflow-hidden max-h-[100vh - 3.5rem]">
                    <CalendarioGrande  diasSemana={diasAtivos} slotsHorario={horariosAtivos} />
                </main>
            </div>
        </Suspense>
    )
}