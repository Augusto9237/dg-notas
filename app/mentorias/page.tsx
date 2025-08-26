'use client'
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ptBR } from 'date-fns/locale'
import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DeleteButton } from "@/components/ui/delete-button"
import { EditButton } from "@/components/ui/edit-button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { CalendarIcon, Plus } from "lucide-react"

interface Mentoria {
    id: string
    titulo: string
    data: Date
    aluno: string
    status: "agendada" | "concluida" | "cancelada"
}

const mentoriasIniciais: Mentoria[] = [
    {
        id: "1",
        titulo: "Revisão de Redação",
        data: new Date(),
        aluno: "João Silva",
        status: "agendada"
    },
    {
        id: "2",
        titulo: "Correção Dissertação",
        data: new Date(2025, 4, 3, 15, 0),
        aluno: "Maria Santos",
        status: 'concluida'
    }
]

export default function MentoriasPage() {
    const [open, setOpen] = useState(false)
    const [dataSelecionada, setDataSelecionada] = useState<Date | undefined>(new Date())
    const [mentorias] = useState<Mentoria[]>(mentoriasIniciais)

    const mentoriasFiltradas = dataSelecionada
        ? mentorias.filter(mentoria =>
            mentoria.data.toDateString() === dataSelecionada.toDateString()
        )
        : mentorias

    return (
        <div className="w-full">
            <div className='flex justify-between items-center h-14 p-5 mt-3'>
                <div>
                    <h1 className=" text-xl font-bold">Mentorias</h1>
                    <p className="text-xs text-muted-foreground">Lista de mentorias agendadas</p>
                </div>
                <Button variant="secondary">
                    <Plus />
                    Novo Mentoria
                </Button>
            </div>
            <main className="flex flex-col p-5 gap-4">
                <div className="max-w-sm">
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
                                className="rounded-md border w-sm"
                            />
                        </PopoverContent>
                    </Popover>
                </div>
                <div className="grid grid-cols-4 gap-4">
                    {mentoriasFiltradas.length === 0 ? (
                        <Card>
                            <CardContent className="p-6 text-center text-muted-foreground">
                                Nenhuma mentoria agendada para esta data
                            </CardContent>
                        </Card>
                    ) : (
                        mentoriasFiltradas.map((mentoria) => (
                            <Card key={mentoria.id} className="h-36">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                                    <CardTitle className="font-bold">
                                        {mentoria.titulo}
                                    </CardTitle>
                                    <Badge
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
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-2">
                                        <div className="flex items-center gap-4">
                                            <Avatar className="size-12">
                                                <AvatarImage src="https://github.com/shadcn.png" />
                                                <AvatarFallback>CN</AvatarFallback>
                                            </Avatar>
                                            <div className="flex items-center justify-between w-full">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-muted-foreground font-semibold text-sm">Aluno:</span>
                                                        <span className="text-sm">{mentoria.aluno}</span>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <span className="text-muted-foreground font-semibold text-sm">Horário:</span>
                                                        <span className="text-sm">
                                                            {mentoria.data.toLocaleTimeString('pt-BR', {
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <EditButton onClick={() => alert(`Editar mentoria ${mentoria.id}`)} />
                                                    <DeleteButton onClick={() => alert(`Cancelar mentoria ${mentoria.id}`)} />
                                                </div>
                                            </div>
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