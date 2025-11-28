'use client'
import { useContext, useEffect, useState } from "react"
import { CardMentoria } from "./card-mentoria"
import { Card, CardContent } from "./ui/card"
import { DiaSemana, Prisma, SlotHorario } from "@/app/generated/prisma"
import { ContextoAluno } from "@/context/contexto-aluno"
import { CalendarX } from "lucide-react"

type Mentoria = Prisma.MentoriaGetPayload<{
    include: {
        horario: {
            include: {
                slot: true
            }
        }
    };
}>;

interface ListMentoriasAlunosProps {
    mentoriasIniciais: Mentoria[];
    diasSemana: DiaSemana[]
    slotsHorario: SlotHorario[]
    professor: {
        nome: string;
        email: string;
        telefone: string | null;
        especialidade: string | null;
        bio: string | null;
        image: string | null;
    } | null
}

export function ListMentoriasAlunos({ mentoriasIniciais, diasSemana, slotsHorario, professor }: ListMentoriasAlunosProps) {
    const { fetchAvaliacoes } = useContext(ContextoAluno);
    const [mentorias, setMentorias] = useState<Mentoria[]>(mentoriasIniciais)

    useEffect(() => {
        setMentorias(mentoriasIniciais);
        fetchAvaliacoes();
    }, [mentoriasIniciais])


    return (
        <div className="grid grid-cols-4 max-md:grid-cols-1 gap-4">
            {mentorias.length === 0 ? (
                <div className="w-full flex flex-col items-center justify-center gap-2 text-muted-foreground">
                    <CalendarX className="size-10" />
                    <span className="text-foreground font-semibold">Nenhuma mentoria encontrada</span>
                    <p className="text-xs">Que tal agendar uma nova mentoria?</p>
                </div>
            ) : (
                mentorias.map((mentoria) => (
                    <CardMentoria key={mentoria.id} mentoria={mentoria} diasSemana={diasSemana} slotsHorario={slotsHorario} professor={professor} />
                ))
            )}
        </div>
    )
}