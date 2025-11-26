import { DiaSemana, Prisma, SlotHorario } from "@/app/generated/prisma"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { ModalMentoriaProfessor } from "./modal-mentoria-professor"
import { Button } from "./ui/button"
import { ChevronRight } from "lucide-react"

type Mentoria = Prisma.MentoriaGetPayload<{
    include: {
        aluno: true,
        horario: {
            include: {
                slot: true
            }
        },
    }
}>

interface CardMentoriaAlunoProps {
    mentoria: Mentoria;
    onclick: () => void;
}

const STATUS_VARIANTES = {
    AGENDADA: "secondary",
    CONFIRMADA: "outline",
    REALIZADA: "default",
} as const;

const STATUS_TEXT = {
    AGENDADA: "Agendada",
    CONFIRMADA: "Confirmada",
    REALIZADA: "Realizada",
} as const;


export function CardMentoriaProfessor({ mentoria, onclick }: CardMentoriaAlunoProps) {
    const statusText = STATUS_TEXT[mentoria.status as keyof typeof STATUS_TEXT];

    return (
        <Button
            className={cn('h-full', mentoria.status === "CONFIRMADA" && "bg-primary/10", mentoria.status === 'AGENDADA' && "text-card")}
            onClick={onclick}
            variant={STATUS_VARIANTES[mentoria.status as keyof typeof STATUS_VARIANTES]}
        >
            <div className="flex items-center w-full justify-between">
                <div className="flex items-center gap-2 md:gap-3">
                    <Avatar className="size-10 flex-shrink-0 max-sm:hidden">
                        <AvatarImage
                            src={mentoria.aluno.image || undefined}
                            alt={mentoria.aluno.name}
                            className="object-cover"
                        />
                        <AvatarFallback className='text-xs'>
                            {mentoria.aluno.name
                                .split(" ")
                                .map(word => word.charAt(0))
                                .join("")
                                .toUpperCase()
                                .slice(0, 2)}
                        </AvatarFallback>
                    </Avatar>
                    <div className="space-y-1 min-w-0 w-full text-start">
                        <span className="font-semibold truncate text-ellipsis text-sm md:hidden">
                            {mentoria.aluno.name.split(" ")[0]}
                        </span>
                        <span className="font-semibold truncate text-ellipsis text-sm hidden sm:block">
                            {mentoria.aluno.name}
                        </span>
                        <div>
                            <p className="truncate text-xs max-md:leading-none opacity-80 max-sm:hidden">
                                {statusText}
                            </p>
                        </div>
                    </div>
                </div>
                <ChevronRight />
            </div>
        </Button>
    )
}
