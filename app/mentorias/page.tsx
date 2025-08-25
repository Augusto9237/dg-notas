'use client'

import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ptBR } from 'date-fns/locale'
import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DeleteButton } from "@/components/ui/delete-button"
import { EditButton } from "@/components/ui/edit-button"

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
    const [dataSelecionada, setDataSelecionada] = useState<Date | undefined>(new Date())
    const [mentorias] = useState<Mentoria[]>(mentoriasIniciais)

    const mentoriasFiltradas = dataSelecionada
        ? mentorias.filter(mentoria =>
            mentoria.data.toDateString() === dataSelecionada.toDateString()
        )
        : mentorias

    return (
        <div className="w-full p-5">
            <div className="flex flex-col gap-4">
                <h1 className=" text-xl font-bold">Mentorias Agendadas</h1>

                {/* <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Calendário</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Calendar
                                mode="single"
                                selected={dataSelecionada}
                                onSelect={setDataSelecionada}
                                locale={ptBR}
                                className="rounded-md border"
                            />
                        </CardContent>
                    </Card> */}

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
                </div>
            {/* </div> */}
        </div>
    )
}