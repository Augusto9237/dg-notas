import { SlotHorario, StatusHorario, StatusMentoria } from "@/app/generated/prisma"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { ModalMentoriaProfessor } from "./modal-mentoria-professor"

type Mentoria = {
    id: number
    status: StatusMentoria
    alunoId: string
    horarioId: number
    duracao: number
    createdAt: Date
    updatedAt: Date
    horario: {
        data: Date
        slot: SlotHorario
        id: number
        status: StatusHorario
    }
    aluno: {
        image: string | null
        id: string
        name: string
        role: string | null
        createdAt: Date
        updatedAt: Date
        email: string
        emailVerified: boolean
        banned: boolean | null
        banReason: string | null
        banExpires: Date | null
    }
}

interface CardMentoriaAlunoProps {
    mentoria: Mentoria;
    setListaMentorias: React.Dispatch<React.SetStateAction<Mentoria[]>>
}

const STATUS_COLORS = {
    AGENDADA: "bg-secondary",
    REALIZADA: "bg-primary",
} as const

export function CardMentoriaProfessor({ mentoria, setListaMentorias }: CardMentoriaAlunoProps) {

    const getInitials = (name: string): string => {
    return name
        .split(" ")
        .map(word => word.charAt(0))
        .join("")
        .toUpperCase()
        .slice(0, 2)
}

    return (
        <div
            className={cn(
                "rounded-md p-4 max-md:p-2 text-card flex items-center justify-between w-full text-xs font-medium shadow-sm  hover:opacity-90 transition-opacity overflow-hidden",
                STATUS_COLORS[mentoria.status as keyof typeof STATUS_COLORS],
            )}
        >
            <div className="flex items-center gap-2 w-full">
                <Avatar className="w-10 max-md:w-8 h-10 max-md:h-8 flex-shrink-0">
                    <AvatarImage
                        src={mentoria.aluno.image || undefined}
                        alt={mentoria.aluno.name}
                        className="object-cover"
                    />
                    <AvatarFallback className="text-xs">
                        {getInitials(mentoria.aluno.name)}
                    </AvatarFallback>
                </Avatar>
                <div className="space-y-1 min-w-0 flex-1">
                    <span className="font-semibold truncate text-ellipsis text-sm block">
                        {mentoria.aluno.name}
                    </span>
                    <div>
                        <p className="truncate text-xs max-md:leading-none opacity-80">
                            {mentoria.status === 'REALIZADA' ? 'Realizada' : 'Agendada'}
                        </p>
                    </div>
                </div>
            </div>
            <ModalMentoriaProfessor mentoria={mentoria} setListaMentorias={setListaMentorias} />
        </div>
    )
}