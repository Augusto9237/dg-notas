'use client';

import { SlotHorario, StatusHorario, StatusMentoria } from "@/app/generated/prisma";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTrigger } from "./ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { DialogTitle } from "@radix-ui/react-dialog";
import { CalendarX, ChevronDown, ChevronDownIcon, ChevronRight, Loader2 } from "lucide-react";
import { atualizarStatusMentoria, excluirMentoriaECascata } from "@/actions/mentoria";
import { toast } from "sonner";
import { useState } from "react";
import { AgendarMentoriaAluno, generateTimeSlots } from "./agendar-mentoria-aluno";
import { Separator } from "./ui/separator";
import { Button } from "./ui/button";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { ButtonGroup } from "@/components/ui/button-group"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils";

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

interface ModalMentoriaProfessorProps {
    mentoria: Mentoria;
    setListaMentorias: React.Dispatch<React.SetStateAction<Mentoria[]>>
}



const getInitials = (name: string): string => {
    return name
        .split(" ")
        .map(word => word.charAt(0))
        .join("")
        .toUpperCase()
        .slice(0, 2)
}

export function ModalMentoriaProfessor({ mentoria, setListaMentorias }: ModalMentoriaProfessorProps) {
    const [open, setOpen] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [carregando, setCarregando] = useState(false)


    async function atualizarStatusDaMentoria(status: "AGENDADA" | "REALIZADA") {
        setCarregando(true)
        setOpen(false)

        try {
            const mentoriaData = await atualizarStatusMentoria(mentoria.id, status)
            toast.success('Status atualizado com sucesso')
            setListaMentorias(prev => prev.map(m => m.id === mentoria.id ? { ...m, status: status } : m))
            return mentoriaData
        } catch {
            toast.error('Erro ao atualizar status')
        } finally {
            setCarregando(false)
        }
    }

    async function excluirMentoria(id: number) {
        try {
            await excluirMentoriaECascata(id)
            toast.success('Mentoria excluída com sucesso')
        } catch {
            toast.error('Erro ao excluir mentoria')
        }
    }

    function formartarData(data: Date) {
        // Converter a data UTC para uma data local sem problemas de fuso horário
        const dataUTC = new Date(data);
        const dataLocal = new Date(
            dataUTC.getUTCFullYear(),
            dataUTC.getUTCMonth(),
            dataUTC.getUTCDate()
        );
        return format(dataLocal, "dd/MM/yyyy", { locale: ptBR });
    }

    return (
        <Dialog open={isOpen} onOpenChange={() => setIsOpen((open) => !open)}>
            <DialogTrigger asChild>
                <Button size='icon' variant='ghost' className="bg-transparent hover:bg-accent-foreground/20 hover:text-card hover:cursor-pointer">
                    <ChevronRight className="max-sm:hidden" />
                    <div className="sm:hidden">
                        <Avatar className="size-10.5">
                            <AvatarImage
                                src={mentoria.aluno.image || ''}
                                alt={mentoria.aluno.name}
                                className="object-cover"
                            />
                            <AvatarFallback className="text-xs">
                                {getInitials(mentoria.aluno.name)}
                            </AvatarFallback>
                        </Avatar>
                    </div>
                </Button>
            </DialogTrigger>

            <DialogContent className="flex flex-col overflow-hidden w-full sm:max-w-sm" style={{ maxWidth: '384px' }}>
                {carregando === true ? (
                    <div className="min-h-[360px] h-full z-50 flex items-center justify-center">
                        <DialogTitle />
                        <Loader2 className="animate-spin text-primary" size={32} />
                    </div>
                ) : (
                    <>
                        <div className="flex flex-col gap-5 max-sm:gap-2 items-center relative w-full">
                            <Avatar className={cn('size-44 border-2', { 'border-primary': mentoria.status === 'REALIZADA', 'border-secondary': mentoria.status === 'AGENDADA' })}>
                                <AvatarImage
                                    src={mentoria.aluno.image || ''}
                                    alt={mentoria.aluno.name}
                                    className="object-cover"
                                />
                                <AvatarFallback className="text-xs">
                                    {getInitials(mentoria.aluno.name)}
                                </AvatarFallback>
                            </Avatar>

                            <div className="w-full flex flex-col overflow-hidden relative">
                                <DialogTitle>
                                    {mentoria.aluno.name}
                                </DialogTitle>
                                <DialogDescription>
                                    {mentoria.aluno.email}
                                </DialogDescription>
                                <DialogDescription>
                                    {formartarData(mentoria.horario.data)} - {generateTimeSlots().find(slot => slot.slot === mentoria.horario.slot)?.display.replace(' - ', ' às ')}
                                </DialogDescription>

                                <ButtonGroup className="w-full max-w-[298px] mt-5">
                                    <Button variant={mentoria.status === 'REALIZADA' ? 'default' : 'secondary'} className="w-full">
                                        <p className="pl-4">
                                            {mentoria.status === 'AGENDADA' ? 'Agendada' : 'Realizada'}
                                        </p>
                                    </Button>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant={mentoria.status === 'REALIZADA' ? 'default' : 'secondary'} className="!pl-2">
                                                <ChevronDownIcon />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align='end' className="space-y-4 min-w-[330px] max-w-[330px] p-2" sideOffset={0} style={{ width: "100%" }}>
                                            <Button
                                                variant='secondary'
                                                onClick={() => atualizarStatusDaMentoria("AGENDADA")}
                                                className="w-full"
                                            >
                                                Agendada
                                            </Button>

                                            <Button
                                                onClick={() => atualizarStatusDaMentoria("REALIZADA")}
                                                className="w-full"
                                            >
                                                Realizada
                                            </Button>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </ButtonGroup>
                            </div>
                        </div>
                        <Separator />
                        <DialogFooter className="grid grid-cols-2 gap-4">
                            <AgendarMentoriaAluno mentoriaData={mentoria} mode="edit" size='default' />
                            <Button
                                variant={mentoria.status === 'REALIZADA' ? 'ghost' : "destructive"}
                                className="w-full"
                                onClick={() => excluirMentoria(mentoria.id)}
                                disabled={mentoria.status === 'REALIZADA'}
                            >
                                <CalendarX />
                                Cancelar
                            </Button>
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    )
}
