
import { AgendarMentoriaAluno } from "@/components/agendar-mentoria-aluno"
import { listarDiasSemana, listarMentoriasAluno, listarSlotsHorario } from "@/actions/mentoria"
import { auth } from "@/lib/auth";
import { headers } from "next/headers"
import { ListMentoriasAlunos } from "@/components/lista-mentorias-aluno";
import { CardMentoriaConfirmacao } from "@/components/card-mentoria-confirmacao";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { obterProfessor } from "@/actions/admin";


export default async function Page() {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session?.user) {
        return <div>Usuário não autenticado</div>
    }

    const [diasSemana, slotsHorario, mentorias, professor] = await Promise.all([
        listarDiasSemana(),
        listarSlotsHorario(),
        listarMentoriasAluno(session.user.id),
        obterProfessor()
    ])

    if (!professor) {
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

    // Get today's date in Brazil timezone
    const hoje = new Date()
    const brasilTime = new Date(hoje.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }))
    const hojeAno = brasilTime.getFullYear()
    const hojeMes = brasilTime.getMonth()
    const hojeDia = brasilTime.getDate()

    const mentoriasDoDia = mentorias.filter((mentoria) => {
        if (mentoria.status !== "AGENDADA") return false

        // Database stores dates at midnight UTC, which represents the correct day
        // So we compare using UTC date components, not local time
        const dataMentoria = new Date(mentoria.horario.data)

        // Compare year, month, and day using UTC components
        return dataMentoria.getUTCFullYear() === hojeAno &&
            dataMentoria.getUTCMonth() === hojeMes &&
            dataMentoria.getUTCDate() === hojeDia
    })

    const diasAtivos = diasSemana.filter((dia) => dia.status)
    const horariosAtivos = slotsHorario.filter((horario) => horario.status)


    return (
        <div className="w-full">
            <main className="flex flex-col gap-4 p-5 pb-20">
                <div className="flex items-center justify-between">
                    <h2 className="text-primary font-semibold">Suas Mentorias</h2>
                </div>
                <AgendarMentoriaAluno diasSemana={diasAtivos} slotsHorario={horariosAtivos} professorId={professor.id} />
                <Tabs defaultValue="agendada">
                    <TabsList>
                        <TabsTrigger value="agendada" className="text-foreground max-sm:text-xs">Agendadas</TabsTrigger>
                        <TabsTrigger value="realizada" className="text-foreground max-sm:text-xs">Realizadas</TabsTrigger>
                    </TabsList>
                    <TabsContent value="agendada" className="flex flex-col gap-4">
                        {mentoriasDoDia.length > 0 && (
                            <div>
                                {mentoriasDoDia.map((mentoria) => (
                                    <CardMentoriaConfirmacao key={mentoria.id} mentoria={mentoria} professor={professor} />
                                ))}
                            </div>
                        )}

                        <ListMentoriasAlunos
                            mentoriasIniciais={mentorias.filter((mentoria) => mentoria.status === "AGENDADA")}
                            diasSemana={diasAtivos}
                            slotsHorario={horariosAtivos}
                            professor={professor}
                        />
                    </TabsContent>
                    <TabsContent value="realizada" className="flex flex-col gap-4">
                        <ListMentoriasAlunos
                            mentoriasIniciais={mentorias.filter((mentoria) => mentoria.status === "REALIZADA")}
                            diasSemana={diasAtivos}
                            slotsHorario={horariosAtivos}
                            professor={professor}
                        />
                    </TabsContent>
                </Tabs>


            </main>
        </div>
    )
}