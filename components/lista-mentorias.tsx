'use client'
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { ptBR } from 'date-fns/locale'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

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

import { useEffect, useState } from "react"
import { AgendarMentoriaModal } from "./agendar-mentoria-modal"
import { CalendarIcon } from "lucide-react"
import { Calendar } from "./ui/calendar"
import { CardMentoria } from "./card-mentoria"

export function ListaMentorias() {
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

        <main className="flex flex-col p-5 gap-5">
            <div className="max-w-sm max-md:max-w-full">
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            id="date-picker"

                            className="w-full"
                        >
                            <CalendarIcon />
                            <span >Selecionar Data</span>
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent
                        className="w-sm overflow-hidden p-0"
                        align="center"
                        alignOffset={-8}
                        sideOffset={10}
                    >
                        <Calendar
                            mode="single"
                            selected={dataSelecionada}
                            onSelect={setDataSelecionada}
                            locale={ptBR}
                            disabled={(date) => {
                                // Disable dates in the past
                                if (date < new Date()) return true

                                // Get day of week (0 = Sunday, 1 = Monday, etc)
                                const dayOfWeek = date.getDay()

                                // Only enable Tuesdays (2) and Thursdays (4)
                                return dayOfWeek !== 2 && dayOfWeek !== 4
                            }}
                            className="rounded-md border w-sm"
                        />
                    </PopoverContent>
                </Popover>
            </div>
            <div className="grid grid-cols-4 max-md:grid-cols-1 gap-4">
                {mentoriasFiltradas.length === 0 ? (
                    <Card>
                        <CardContent className="p-6 text-center text-muted-foreground">
                            Nenhuma mentoria agendada para esta data
                        </CardContent>
                    </Card>
                ) : (
                    mentoriasFiltradas.map((mentoria) => (
                        <CardMentoria key={mentoria.id} mentoria={mentoria} professor={true} aluno={'Aluno teste'} />
                    ))
                )}
            </div>
        </main>
    )
}