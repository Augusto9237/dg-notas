
import { AgendarMentoriaAluno } from "@/components/agendar-mentoria-aluno"
import { listarDiasSemana, listarSlotsHorario } from "@/actions/mentoria"
import { auth } from "@/lib/auth";
import { headers } from "next/headers"
import { obterProfessor } from "@/actions/admin";
import { TabelaMentoriasAluno } from "@/components/tabela-mentorias-aluno";


export default async function Page() {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session?.user) {
        return <div>Usuário não autenticado</div>
    }

    const [diasSemana, slotsHorario, professor] = await Promise.all([
        listarDiasSemana(),
        listarSlotsHorario(),
        obterProfessor()
    ])
    if (professor?.id === undefined) {
        return (
            <div className="w-full">
                <main className="flex flex-col gap-4 p-5 pb-20">
                    <div className="flex items-center justify-between">
                        <h2 className="text-primary font-semibold">Suas Mentorias</h2>
                    </div>
                    <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
                        <p className="text-muted-foreground">
                            Nenhum professor disponível no momento.
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Entre em contato com o administrador do sistema.
                        </p>
                    </div>
                </main>
            </div>
        )
    }

    const diasAtivos = diasSemana.filter((dia) => dia.status)
    const horariosAtivos = slotsHorario.filter((horario) => horario.status)

    return (
        <div className="w-full h-full max-h-screen min-h-screen overflow-hidden">
            <main className="flex flex-col gap-4 p-5 pb-20 h-full">
                <div className="flex items-center justify-between">
                    <h2 className="text-primary font-semibold">Suas Mentorias</h2>
                </div>
                <AgendarMentoriaAluno diasSemana={diasAtivos} slotsHorario={horariosAtivos} professorId={professor.id} />
                <TabelaMentoriasAluno diasSemana={diasAtivos} slotsHorario={horariosAtivos} professor={professor} />
            </main>
        </div>
    )
}