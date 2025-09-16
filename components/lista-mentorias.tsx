'use client'
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { ptBR } from 'date-fns/locale'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import { useEffect, useState } from "react"
import { AgendarMentoriaModal } from "./agendar-mentoria-modal"
import { CalendarIcon } from "lucide-react"
import { Calendar } from "./ui/calendar"
import { CardMentoria } from "./card-mentoria"
import { Prisma } from "@/app/generated/prisma"
import { listarMentoriasHorario } from "@/actions/mentoria"

type Mentoria = Prisma.MentoriaGetPayload<{
    include: {
        horario: true;
        aluno: true;
    };
}>;


interface ListaMentoriasProps {
    mentoriasIniciais: Mentoria[]
}

export function ListaMentorias({ mentoriasIniciais }: ListaMentoriasProps) {
    const [open, setOpen] = useState(false)
    const [dataSelecionada, setDataSelecionada] = useState<Date | undefined>(new Date())
    const [mentorias, setMentorias] = useState<Mentoria[]>([]);

    console.log(dataSelecionada)

    useEffect(() => {
        setMentorias(mentoriasIniciais)
    }, [mentoriasIniciais])

    useEffect(() => {
        async function FiltrarPorData() {
            const mentorias = await listarMentoriasHorario(dataSelecionada)
            console.log('mentoria', mentorias)
            setMentorias(mentorias)
        }
        FiltrarPorData()
    }, [dataSelecionada])

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
                                return dayOfWeek !== 1 && dayOfWeek !== 3
                            }}
                            className="rounded-md border w-sm"
                        />
                    </PopoverContent>
                </Popover>
            </div>
            <div className="grid grid-cols-4 max-md:grid-cols-1 gap-4">
                {mentorias.length === 0 ? (
                    <Card>
                        <CardContent className="p-6 text-center text-muted-foreground">
                            Nenhuma mentoria agendada para esta data
                        </CardContent>
                    </Card>
                ) : (
                    mentorias.map((mentoria) => (
                        <CardMentoria key={mentoria.id} mentoria={mentoria} professor={true} aluno={mentoria.aluno} />
                    ))
                )}
            </div>
        </main>
    )
}