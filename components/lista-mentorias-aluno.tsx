'use client'
import { useContext, useEffect, useState } from "react"
import { CardMentoria } from "./card-mentoria"
import { Card, CardContent } from "./ui/card"
import { DiaSemana, Prisma, SlotHorario } from "@/app/generated/prisma"
import { ContextoAluno } from "@/context/contexto-aluno"
import { CalendarX } from "lucide-react"
import InfiniteScroll from "./ui/infinite-scroll"
import { Spinner } from "./ui/spinner"

type Mentoria = Prisma.MentoriaGetPayload<{
    include: {
        horario: {
            include: {
                slot: true
            }
        },
        professor: true;
        aluno: true;
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
    hasMore?: boolean;
    loading?: boolean;
    nextMentorias?: () => void;
}

export function ListMentoriasAlunos({ mentoriasIniciais, diasSemana, slotsHorario, hasMore, loading, nextMentorias }: ListMentoriasAlunosProps) {
    const [mentorias, setMentorias] = useState<Mentoria[]>(mentoriasIniciais)

    useEffect(() => {
        setMentorias(mentoriasIniciais);
    }, [mentoriasIniciais])


    return (
        <div className="grid grid-cols-4 max-md:grid-cols-1 gap-4">
            {mentorias.length === 0 ? (
                <div className="w-full h-full flex flex-col flex-1 items-center justify-center gap-2 text-muted-foreground pt-5">
                    <CalendarX className="size-10" />
                    <span className="text-foreground font-semibold">Nenhuma mentoria encontrada</span>
                    <p className="text-xs">Que tal agendar uma nova mentoria?</p>
                </div>
            ) : (
                <>
                    {mentorias.map((mentoria) => (
                        <CardMentoria key={mentoria.id} mentoria={mentoria} diasSemana={diasSemana} slotsHorario={slotsHorario} />
                    ))}
                    {hasMore !== undefined && loading !== undefined && nextMentorias && (
                        <>
                            <div className="flex items-center justify-center col-span-full max-md:hidden">
                                <InfiniteScroll hasMore={hasMore} isLoading={loading} next={nextMentorias} threshold={1} >
                                    {hasMore && <Spinner />}
                                </InfiniteScroll>
                            </div>
                            <div className="flex items-center justify-center col-span-full min-md:hidden">
                                <InfiniteScroll hasMore={hasMore} isLoading={loading} next={nextMentorias} threshold={0.1} rootMargin="100px">
                                    {hasMore && <Spinner />}
                                </InfiniteScroll>
                            </div>
                        </>
                    )}
                </>
            )}
        </div>
    )
}