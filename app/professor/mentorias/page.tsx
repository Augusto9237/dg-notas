
import { listarDiasSemana, listarMentoriasProfessor, listarSlotsHorario } from "@/actions/mentoria";
import { Suspense } from "react";
import Loading from "./loading";
import { CalendarioGrande } from "@/components/calendario-grande";
import { AjustarAgenda } from "@/components/ajustar-agenda";
import { HeaderTeacher } from "@/components/header-professor";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";


export default async function Page() {
    const session = await auth.api.getSession({
        headers: await headers() // you need to pass the headers object.
    })

    if (!session?.user) {
        redirect('/')
    }
    const diasSemana = await listarDiasSemana()
    const slotsHorario = await listarSlotsHorario()

    const diasAtivos = diasSemana.filter((dia) => dia.status === true)
    const horariosAtivos = slotsHorario.filter((horario) => horario.status === true)
    const mentorias = await listarMentoriasProfessor(session.user.id)

    return (
        <Suspense fallback={<Loading />}>
            <div className="w-full h-full min-h-screen max-h-screen relative pt-16 overflow-hidden">
                <HeaderTeacher title="Mentorias" description="Lista de mentorias">

                </HeaderTeacher>
                <main className="flex flex-col p-5 h-full flex-1 overflow-hidden max-h-[100vh - 3.5rem]">
                    <CalendarioGrande diasSemana={diasAtivos} slotsHorario={horariosAtivos} mentorias={mentorias} />
                </main>
            </div>
        </Suspense>
    )
}