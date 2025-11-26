
import { listarDiasSemana, listarMentoriasHorario, listarSlotsHorario } from "@/actions/mentoria";
import { Suspense } from "react";
import Loading from "./loading";
import { CalendarioGrande } from "@/components/calendario-grande";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { prisma } from "@/lib/prisma";
import { AjustarAgenda } from "@/components/ajustar-agenda";


export default async function Page() {
    const diasSemana = await listarDiasSemana()
    const slotsHorario = await listarSlotsHorario()
    const mentorias = await listarMentoriasHorario()

    const diasAtivos = diasSemana.filter((dia) => dia.status === true)
    const horariosAtivos = slotsHorario.filter((horario) => horario.status === true)

    return (
        <Suspense fallback={<Loading />}>
            <div className="w-full flex flex-col flex-1 h-screen">
                <div className='flex justify-between items-center h-14 p-5 mt-3 relative'>
                    <SidebarTrigger className='absolute' />
                    <div className="max-[1025px]:pl-10">
                        <h1 className=" text-xl font-bold">Mentorias</h1>
                        <p className="text-xs text-muted-foreground max-sm:leading-none max-sm:truncate">Lista de mentorias agendadas</p>
                    </div>
                    <AjustarAgenda diasSemana={diasSemana} slotsHorario={slotsHorario} />
                </div>
                <main className="flex flex-col p-5 h-full flex-1 overflow-hidden max-h-[100vh - 3.5rem]">
                    <CalendarioGrande mentorias={mentorias} diasSemana={diasAtivos} slotsHorario={horariosAtivos} />
                </main>
            </div>
        </Suspense>
    )
}