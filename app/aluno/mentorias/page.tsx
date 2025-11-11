
import { AgendarMentoriaAluno } from "@/components/agendar-mentoria-aluno"
import { listarDiasSemana, listarMentoriasAluno, listarSlotsHorario } from "@/actions/mentoria"
import { auth } from "@/lib/auth";
import { headers } from "next/headers"
import { ListMentoriasAlunos } from "@/components/lista-mentorias-aluno";
import { CardMentoriaConfirmacao } from "@/components/card-mentoria-confirmacao";


export default async function Page() {
    const session = await auth.api.getSession({
        headers: await headers() // you need to pass the headers object.
    })

    if (session?.user) {
        const diasSemana = await listarDiasSemana()
        const slotsHorario = await listarSlotsHorario()
        const mentorias = await listarMentoriasAluno(session.user.id);

        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);

        const mentoriasDoDia = mentorias.filter(
            (mentoria) => {
                const dataMentoria = new Date(mentoria.horario.data);
                dataMentoria.setHours(0, 0, 0, 0);
                return dataMentoria.getTime() === hoje.getTime() && mentoria.status === "AGENDADA";
            }
        );


        const diasAtivos = diasSemana.filter((dia) => dia.status === true)
        const horariosAtivos = slotsHorario.filter((horario) => horario.status === true);

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
                                <CardMentoriaConfirmacao mentoria={mentoria} />
                            ))}
                        </div>
                    )}

                    <ListMentoriasAlunos mentoriasIniciais={mentorias} diasSemana={diasAtivos} slotsHorario={horariosAtivos} />
                </main>
            </div>
        )
    } else {
        return <div>Usuário não autenticado</div>
    }
}