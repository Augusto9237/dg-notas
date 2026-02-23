
import { AgendarMentoriaAluno } from "@/components/agendar-mentoria-aluno"
import { listarDiasSemana, listarMentoriasAluno, listarSlotsHorario } from "@/actions/mentoria"
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
        cacheLife({ stale: 1800 })
        const [diasSemana, slotsHorario] = await Promise.all([
            listarDiasSemana(),
            listarSlotsHorario(),
        ])

        return {
            diasSemana,
            slotsHorario,
        }
    }

    const professor = await obterProfessor()
    const mentorias = await listarMentoriasAluno(session.user.id)
    const { diasSemana, slotsHorario } = await listaDadosAgenda()

    const diasAtivos = diasSemana.filter((dia) => dia.status)
    const horariosAtivos = slotsHorario.filter((horario) => horario.status)

    if (!professor) {
        return (
            <div className="w-full h-full max-h-screen min-h-screen overflow-hidden">
                <main className="flex flex-col gap-4 p-5 pb-20 h-full">
                    <div className="flex items-center justify-between">
                        <h2 className="text-primary font-semibold">Suas Mentorias</h2>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Nenhum professor disponível no momento. Tente novamente mais tarde.
                    </p>
                </main>
            </div>
        )
    }

    return (
        <div className="w-full h-full max-h-screen min-h-screen overflow-hidden">
            <main className="flex flex-col gap-4 p-5 pb-20 h-full">
                <div className="flex items-center justify-between">
                    <h2 className="text-primary font-semibold">Suas Mentorias</h2>
                </div>
                <AgendarMentoriaAluno diasSemana={diasAtivos} slotsHorario={horariosAtivos} professorId={professor.id} />
                <TabelaMentoriasAluno diasSemana={diasAtivos} slotsHorario={horariosAtivos} professor={professor} mentoriasIniciais={mentorias} />
            </main>
        </div>
    )
}