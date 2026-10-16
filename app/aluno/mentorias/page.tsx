
import { listarDiasSemana, listarMentoriasAluno, listarSlotsHorario } from "@/actions/mentoria"
import { auth } from "@/lib/auth";
import { headers } from "next/headers"
import { obterProfessor } from "@/actions/admin";
import { TabelaMentoriasAluno } from "@/components/tabela-mentorias-aluno";
import { Suspense } from "react";
import Loading from "./loading";
import { AgendarMentoria } from "@/components/agendar-mentoria";


export default async function Page() {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session?.user) {
        return <div>Usuário não autenticado</div>
    }

    const mentorias = await listarMentoriasAluno(session.user.id)

    const diasSemana = await listarDiasSemana()
    const slotsHorario = await listarSlotsHorario()
    const diasAtivos = diasSemana.filter((dia) => dia.status)
    const horariosAtivos = slotsHorario.filter((horario) => horario.status)


    return (
        <Suspense fallback={<Loading />}>
            <div className="w-full h-full max-h-screen min-h-screen overflow-hidden bg-linear-to-b from-primary/15 via-primary/5 to-transparent">
                <main className="flex flex-col gap-4 p-5 pb-20 h-full">
                    <div className="flex items-center justify-between">
                        <h2 className="text-primary dark:text-primary-foreground font-semibold text-lg sm:text-xl">Suas Mentorias</h2>
                        <p className='text-primary dark:text-primary-foreground text-xs'>Acompanhe as suas mentorias</p>
                    </div>
                    <AgendarMentoria diasSemana={diasAtivos} slotsHorario={horariosAtivos} />
                    <TabelaMentoriasAluno diasSemana={diasAtivos} slotsHorario={horariosAtivos} mentoriasIniciais={mentorias} />
                </main>
            </div>
        </Suspense>
    )
}