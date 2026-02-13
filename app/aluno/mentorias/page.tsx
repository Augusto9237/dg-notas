
import { AgendarMentoriaAluno } from "@/components/agendar-mentoria-aluno"
import { listarDiasSemana, listarSlotsHorario } from "@/actions/mentoria"
import { auth } from "@/lib/auth";
import { headers } from "next/headers"
import { obterProfessor } from "@/actions/admin";
import { TabelaMentoriasAluno } from "@/components/tabela-mentorias-aluno";
import { cacheLife } from "next/cache";


export default async function Page() {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session?.user) {
        return <div>Usuário não autenticado</div>
    }

    async function listaDadosAgenda() {
        'use cache: private'

        cacheLife('hours')
        const [diasSemana, slotsHorario, professor] = await Promise.all([
            listarDiasSemana(),
            listarSlotsHorario(),
            obterProfessor()
        ])

        return {
            diasSemana,
            slotsHorario,
            professor,
        }
    }


    const diasAtivos = (await listaDadosAgenda()).diasSemana.filter((dia) => dia.status)
    const horariosAtivos = (await listaDadosAgenda()).slotsHorario.filter((horario) => horario.status)

    return (
        <div className="w-full h-full max-h-screen min-h-screen overflow-hidden">
            <main className="flex flex-col gap-4 p-5 pb-20 h-full">
                <div className="flex items-center justify-between">
                    <h2 className="text-primary font-semibold">Suas Mentorias</h2>
                </div>
                <AgendarMentoriaAluno diasSemana={diasAtivos} slotsHorario={horariosAtivos} professorId={(await listaDadosAgenda()).professor!.id} />
                <TabelaMentoriasAluno diasSemana={diasAtivos} slotsHorario={horariosAtivos} professor={(await listaDadosAgenda()).professor} />
            </main>
        </div>
    )
}