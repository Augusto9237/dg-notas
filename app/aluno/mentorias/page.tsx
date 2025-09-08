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
import { CardMentoria } from "@/components/card-mentoria"

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
            <main className="flex flex-col gap-4 p-5 pb-20">
                <div className="flex items-center justify-between">
                    <h2 className="text-primary font-semibold">Suas Mentorias</h2>

                </div>

                <AgendarMentoriaAluno />

                <div className="grid grid-cols-4 max-md:grid-cols-1 gap-4">
                    {mentoriasIniciais.length === 0 ? (
                        <Card>
                            <CardContent className="p-6 text-center text-muted-foreground">
                                Nenhuma mentoria agendada para esta data
                            </CardContent>
                        </Card>
                    ) : (
                        mentoriasIniciais.map((mentoria) => (
                            <CardMentoria key={mentoria.id} mentoria={mentoria} />
                        ))
                    )}
                </div>
            </main>
        </div>
    )
}