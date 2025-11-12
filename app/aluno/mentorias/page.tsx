
import { AgendarMentoriaAluno } from "@/components/agendar-mentoria-aluno"
import { listarDiasSemana, listarMentoriasAluno, listarSlotsHorario } from "@/actions/mentoria"
import { auth } from "@/lib/auth";
import { headers } from "next/headers"
import { ListMentoriasAlunos } from "@/components/lista-mentorias-aluno";
import { CardMentoriaConfirmacao } from "@/components/card-mentoria-confirmacao";


export default async function Page() {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session?.user) {
        return <div>Usuário não autenticado</div>
    }

    const [diasSemana, slotsHorario, mentorias] = await Promise.all([
        listarDiasSemana(),
        listarSlotsHorario(),
        listarMentoriasAluno(session.user.id)
    ])

    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)
    const hojeTimestamp = hoje.getTime()

    const mentoriasDoDia = mentorias.filter((mentoria) => {
        if (mentoria.status !== "AGENDADA") return false
        const dataMentoria = new Date(mentoria.horario.data)
        dataMentoria.setHours(0, 0, 0, 0)
        return dataMentoria.getTime() === hojeTimestamp
    })

    const diasAtivos = diasSemana.filter((dia) => dia.status)
    const horariosAtivos = slotsHorario.filter((horario) => horario.status)

    return (
        <div className="w-full">
            <main className="flex flex-col gap-4 p-5 pb-20">
                <div className="flex items-center justify-between">
                    <h2 className="text-primary font-semibold">Suas Mentorias</h2>
                </div>

                <AgendarMentoriaAluno diasSemana={diasAtivos} slotsHorario={horariosAtivos} />
                {mentoriasDoDia.length > 0 && (
                    <div>
                        {mentoriasDoDia.map((mentoria) => (
                            <CardMentoriaConfirmacao key={mentoria.id} mentoria={mentoria} />
                        ))}
                    </div>
                )}

                <ListMentoriasAlunos 
                    mentoriasIniciais={mentorias} 
                    diasSemana={diasAtivos} 
                    slotsHorario={horariosAtivos} 
                />
            </main>
        </div>
    )
}