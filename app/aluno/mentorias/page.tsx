'use client'
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ptBR } from 'date-fns/locale'
import { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DeleteButton } from "@/components/ui/delete-button"
import { EditButton } from "@/components/ui/edit-button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { CalendarIcon, Plus } from "lucide-react"
import { AgendarMentoriaModal } from "@/components/agendar-mentoria-modal"
import { AgendarMentoriaAluno } from "@/components/agendar-mentoria-aluno"

interface Mentoria {
    id: string
    titulo: string
    data: Date
    professor: string
    status: "agendada" | "concluida" | "cancelada"
}

const mentoriasIniciais: Mentoria[] = [
    {
        id: "1",
        titulo: "Revisão de Redação",
        data: new Date(),
        professor: "Daniely Guedes",
        status: "agendada"
    },
    {
        id: "2",
        titulo: "Correção Dissertação",
        data: new Date(2025, 4, 3, 15, 0),
        professor: "Daniely Guedes",
        status: 'concluida'
    }
]

export default function MentoriasPage() {
    const [open, setOpen] = useState(false)
    const [dataSelecionada, setDataSelecionada] = useState<Date | undefined>(new Date())
    const [mentorias] = useState<Mentoria[]>(mentoriasIniciais)

    const [mentoriasFiltradas, setMentoriasFiltradas] = useState<Mentoria[]>(mentorias)

    useEffect(() => {
        const filteredMentorias = dataSelecionada
            ? mentorias.filter(mentoria =>
                mentoria.data.toDateString() === dataSelecionada.toDateString()
            )
            : []

        setMentoriasFiltradas(filteredMentorias)
    }, [dataSelecionada, mentorias])

    return (
        <div className="w-full">
            <div className='flex justify-between items-center h-14 p-5 mt-3'>
                <div>
                    <h1 className="text-lg font-bold">Mentorias</h1>
                    <p className="text-xs text-muted-foreground">Suas mentorias agendadas</p>
                </div>
                <AgendarMentoriaAluno />
            </div>
            <main className="flex flex-col p-5 gap-5">

                <div className="grid grid-cols-4 max-md:grid-cols-1 gap-4">
                    {mentoriasIniciais.length === 0 ? (
                        <Card>
                            <CardContent className="p-6 text-center text-muted-foreground">
                                Nenhuma mentoria agendada para esta data
                            </CardContent>
                        </Card>
                    ) : (
                        mentoriasIniciais.map((mentoria) => (
                            <Card key={mentoria.id} className="h-26 gap-4 py-4">
                                <CardContent className="relative px-3">
                                    <Badge
                                        className="absolute top-0 right-4"
                                        variant={
                                            mentoria.status === "agendada" ? 'outline' :
                                                mentoria.status === "concluida" ? 'secondary' :
                                                    "destructive"
                                        }
                                    >
                                        {mentoria.status === "agendada" ? "Agendada" :
                                            mentoria.status === "concluida" ? "Concluída" :
                                                "Cancelada"}
                                    </Badge>
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-2 w-full">
                                            <Avatar className="size-14">
                                                <AvatarImage src="https://github.com/shadcn.png" />
                                                <AvatarFallback>CN</AvatarFallback>
                                            </Avatar>
                                            <div >
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-muted-foreground font-semibold text-sm">Profª:</span>
                                                        <span className="text-sm">{mentoria.professor}</span>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <span className="text-muted-foreground font-semibold text-sm">Data:</span>
                                                        <div className="text-sm">
                                                            {mentoria.data.toLocaleDateString('pt-BR', {
                                                                day: '2-digit',
                                                                month: '2-digit',
                                                                year: 'numeric'
                                                            })}
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <span className="text-muted-foreground font-semibold text-sm">Horário:</span>
                                                        <div className="text-sm">
                                                            {mentoria.data.toLocaleTimeString('pt-BR', {
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 mt-8">
                                            <EditButton onClick={() => alert(`Editar mentoria ${mentoria.id}`)} />
                                            <DeleteButton onClick={() => alert(`Cancelar mentoria ${mentoria.id}`)} />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </main>
        </div>
    )
}