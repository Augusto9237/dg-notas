'use client'
import { useEffect, useState } from "react"
import { CardMentoria } from "./card-mentoria"
import { Card, CardContent } from "./ui/card"
import { Mentoria } from "@/app/generated/prisma"

interface ListMentoriasAlunosProps{
    mentoriasIniciais: Mentoria[]
}

export function ListMentoriasAlunos({mentoriasIniciais}: ListMentoriasAlunosProps) {
    const [dataSelecionada, setDataSelecionada] = useState<Date | undefined>(new Date())
    const [mentorias, setMentorias] = useState<Mentoria[]>(mentoriasIniciais)
    const [mentoriasFiltradas, setMentoriasFiltradas] = useState<Mentoria[]>(mentoriasIniciais)

    useEffect(() => {
        setMentoriasFiltradas(mentoriasIniciais)
    }, [mentoriasIniciais])


    return (
        <div className="grid grid-cols-4 max-md:grid-cols-1 gap-4">
            {mentoriasFiltradas.length === 0 ? (
                <Card className="col-span-4">
                    <CardContent className="p-6 text-center text-muted-foreground">
                        Nenhuma mentoria agendada para esta data
                    </CardContent>
                </Card>
            ) : (
                mentoriasFiltradas.map((mentoria) => (
                    <CardMentoria key={mentoria.id} mentoria={mentoria} />
                ))
            )}
        </div>
    )
}