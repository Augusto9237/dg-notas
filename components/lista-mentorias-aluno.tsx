'use client'
import { useContext, useEffect, useState } from "react"
import { CardMentoria } from "./card-mentoria"
import { Card, CardContent } from "./ui/card"
import { Prisma } from "@/app/generated/prisma"
import { ContextoAluno } from "@/context/contexto-aluno"

type Mentoria = Prisma.MentoriaGetPayload<{
    include: {
        horario: true;
    };
}>;

interface ListMentoriasAlunosProps {
    mentoriasIniciais: Mentoria[]
}

export function ListMentoriasAlunos({ mentoriasIniciais }: ListMentoriasAlunosProps) {
    const { fetchAvaliacoes } = useContext(ContextoAluno);
    const [mentorias, setMentorias] = useState<Mentoria[]>(mentoriasIniciais)

    useEffect(() => {
        setMentorias(mentoriasIniciais);
        fetchAvaliacoes();
    }, [mentoriasIniciais])


    return (
        <div className="grid grid-cols-4 max-md:grid-cols-1 gap-4">
            {mentorias.length === 0 ? (
                <Card className="col-span-4">
                    <CardContent className="p-6 text-center text-muted-foreground">
                        Nenhuma mentoria agendada para esta data
                    </CardContent>
                </Card>
            ) : (
                mentorias.map((mentoria) => (
                    <CardMentoria key={mentoria.id} modo='ALUNO' mentoria={mentoria} />
                ))
            )}
        </div>
    )
}