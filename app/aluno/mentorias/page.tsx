
import { AgendarMentoriaAluno } from "@/components/agendar-mentoria-aluno"
import { listarDiasSemana, listarMentoriasAluno, listarSlotsHorario } from "@/actions/mentoria"
import { auth } from "@/lib/auth";
import { headers } from "next/headers"
import { ListMentoriasAlunos } from "@/components/lista-mentorias-aluno";


export default async function Page() {
    const session = await auth.api.getSession({
        headers: await headers() // you need to pass the headers object.
    })

    if (session?.user) {
        const diasSemana = await listarDiasSemana()
        const slotsHorario = await listarSlotsHorario()
        const mentorias = await listarMentoriasAluno(session.user.id)

        const diasAtivos = diasSemana.filter((dia) => dia.status === true)
        const horariosAtivos = slotsHorario.filter((horario) => horario.status === true);

        return (
            <div className="w-full">
                <main className="flex flex-col gap-4 p-5 pb-20">
                    <div className="flex items-center justify-between">
                        <h2 className="text-primary font-semibold">Suas Mentorias</h2>
                    </div>

                    <AgendarMentoriaAluno diasSemana={diasAtivos} slotsHorario={horariosAtivos} />

                    <ListMentoriasAlunos mentoriasIniciais={mentorias} diasSemana={diasAtivos} slotsHorario={horariosAtivos} />
                </main>
            </div>
        )
    } else {
        return <div>Usuário não autenticado</div>
    }
}