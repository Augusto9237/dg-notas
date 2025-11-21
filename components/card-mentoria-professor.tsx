import { DiaSemana, Prisma, SlotHorario } from "@/app/generated/prisma"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { ModalMentoriaProfessor } from "./modal-mentoria-professor"

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
    setListaMentorias: React.Dispatch<React.SetStateAction<Mentoria[]>>
    diasSemana: DiaSemana[]
    slotsHorario: SlotHorario[]
}

const STATUS_COLORS = {
    AGENDADA: "bg-secondary text-card ",
    CONFIRMADA: "bg-primary/10 text-primary",
    REALIZADA: "bg-primary text-card ",
} as const;

const STATUS_TEXT = {
    AGENDADA: "Agendada",
    CONFIRMADA: "Confirmada",
    REALIZADA: "Realizada",
} as const;


export function CardMentoriaProfessor({ mentoria, setListaMentorias, diasSemana, slotsHorario }: CardMentoriaAlunoProps) {
    const statusText = STATUS_TEXT[mentoria.status as keyof typeof STATUS_TEXT];

    return (
        <div
            className={cn(
                "relative rounded-md max-sm:rounded-sm max-sm:h-12 p-4 max-md:px-2 max-sm:p-2 flex items-center justify-between max-sm:justify-center w-full text-xs font-medium shadow-sm  hover:opacity-90 transition-opacity overflow-hidden",
                STATUS_COLORS[mentoria.status as keyof typeof STATUS_COLORS],
            )}
        >
            <div className="flex items-center gap-2 w-full">
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
                <div className="space-y-1 min-w-0">
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
            <ModalMentoriaProfessor mentoria={mentoria} setListaMentorias={setListaMentorias} diasSemana={diasSemana} slotsHorario={slotsHorario} />
        </div>
    )
}
