'use client'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ContextoAluno } from "@/context/contexto-aluno";
import { useContext } from "react";
import { CardMentoriaConfirmacao } from "./card-mentoria-confirmacao";
import { ListMentoriasAlunos } from "./lista-mentorias-aluno";
import { DiaSemana, SlotHorario } from "@/app/generated/prisma";

type Professor = {
    id: string;
    nome: string;
    email: string;
    telefone: string | null;
    especialidade: string | null;
    bio: string | null;
    image: string;
} | null

interface TabelaMentoriasAlunoProps {
    professor: Professor;
    diasSemana: DiaSemana[];
    slotsHorario: SlotHorario[];
}

export function TabelaMentoriasAluno({ professor, diasSemana, slotsHorario }: TabelaMentoriasAlunoProps) {
    const { listaMentorias } = useContext(ContextoAluno);
    // Get today's date in Brazil timezone
    const hoje = new Date()
    const brasilTime = new Date(hoje.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }))
    const hojeAno = brasilTime.getFullYear()
    const hojeMes = brasilTime.getMonth()
    const hojeDia = brasilTime.getDate()

    const mentoriasDoDia = listaMentorias.filter((mentoria) => {
        if (mentoria.status !== "AGENDADA" && mentoria.status !== 'CONFIRMADA') return false

        // Database stores dates at midnight UTC, which represents the correct day
        // So we compare using UTC date components, not local time
        const dataMentoria = new Date(mentoria.horario.data)

        // Compare year, month, and day using UTC components
        return dataMentoria.getUTCFullYear() === hojeAno &&
            dataMentoria.getUTCMonth() === hojeMes &&
            dataMentoria.getUTCDate() === hojeDia
    })
    return (
        <Tabs defaultValue="agendada" className='h-full'>
            <TabsList>
                <TabsTrigger value="agendada" className="text-foreground max-sm:text-xs">Agendadas</TabsTrigger>
                <TabsTrigger value="realizada" className="text-foreground max-sm:text-xs">Realizadas</TabsTrigger>
            </TabsList>
            <TabsContent value="agendada" className="flex flex-col flex-1 h-full gap-4 overflow-y-auto max-sm:pb-24">
                {mentoriasDoDia.length > 0 && (
                    <div className="grid grid-cols-4 max-md:grid-cols-1 gap-4">
                        {mentoriasDoDia.map((mentoria) => (
                            <CardMentoriaConfirmacao key={mentoria.id} mentoria={mentoria} professor={professor} />
                        ))}
                    </div>
                )}

                <ListMentoriasAlunos
                    mentoriasIniciais={listaMentorias.filter(
                        (mentoria) => mentoria.status === "AGENDADA" 
                    )}
                    diasSemana={diasSemana}
                    slotsHorario={slotsHorario}
                    professor={professor}
                />
            </TabsContent>
            <TabsContent value="realizada" className="flex flex-col flex-1 h-full overflow-y-auto max-sm:pb-24">
                <ListMentoriasAlunos
                    mentoriasIniciais={listaMentorias.filter((mentoria) => mentoria.status === "REALIZADA")}
                    diasSemana={diasSemana}
                    slotsHorario={slotsHorario}
                    professor={professor}
                />
            </TabsContent>
        </Tabs>

    )
}