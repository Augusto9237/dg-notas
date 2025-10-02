'use client';

import { SlotHorario, StatusHorario, StatusMentoria } from "@/app/generated/prisma";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTrigger } from "./ui/dialog";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { DialogTitle } from "@radix-ui/react-dialog";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { CalendarX, ChevronDown, ChevronRight, Loader2 } from "lucide-react";
import { Badge } from "./ui/badge";
import { atualizarStatusMentoria, excluirMentoriaECascata } from "@/actions/mentoria";
import { toast } from "sonner";
import { useState } from "react";
import { AgendarMentoriaAluno, generateTimeSlots } from "./agendar-mentoria-aluno";
import { Separator } from "./ui/separator";
import { Button } from "./ui/button";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

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
                    <ChevronRight />
                </Button>
            </DialogTrigger>

            <DialogContent className="flex flex-col overflow-hidden">
                {carregando === true ? (
                    <div className="min-h-[152px] h-full z-50 flex items-center justify-center">
                        <DialogTitle />
                        <Loader2 className="animate-spin text-primary" size={32} />
                    </div>
                ) : (
                    <>
                        <div className="flex gap-4 max-sm:gap-2 items-center relative w-full">
                            <Avatar className="size-20 max-sm:size-16 flex-shrink-0">
                                <AvatarImage
                                    src={mentoria.aluno.image || ''}
                                    alt={mentoria.aluno.name}
                                    className="object-cover"
                                />
                                <AvatarFallback className="text-xs">
                                    {getInitials(mentoria.aluno.name)}
                                </AvatarFallback>
                            </Avatar>

                            <div>
                                <DialogTitle className="max-sm:text-sm">
                                    {mentoria.aluno.name}
                                </DialogTitle>
                                <DialogDescription className="max-sm:text-xs">
                                    {mentoria.aluno.email}
                                </DialogDescription>
                                <DialogDescription className="max-sm:text-xs">
                                    {formartarData(mentoria.horario.data)} {generateTimeSlots().find(slot => slot.slot === mentoria.horario.slot)?.display}
                                </DialogDescription>
                            </div>

                            <div className="absolute top-2 -right-2">
                                <Popover open={open} onOpenChange={setOpen}>
                                    <PopoverTrigger asChild className="cursor-pointer">
                                        <div className="flex items-center gap-0.5">
                                            <Badge
                                                variant={mentoria.status === "REALIZADA" ? 'default' : 'secondary'}
                                            >
                                                {mentoria.status === 'AGENDADA' ? 'Agendada' : 'Realizada'}
                                            </Badge>
                                            <ChevronDown size={16} className="text-muted-foreground" />
                                        </div>
                                    </PopoverTrigger>
                                    <PopoverContent
                                        className="overflow-hidden max-w-fit flex flex-col gap-3 p-2"
                                        align="center"
                                    >
                                        <Badge
                                            onClick={() => atualizarStatusDaMentoria("REALIZADA")}
                                            variant='default'
                                            className="cursor-pointer"
                                        >
                                            Realizada
                                        </Badge>

                                        <Badge
                                            onClick={() => atualizarStatusDaMentoria("AGENDADA")}
                                            variant='secondary'
                                            className="cursor-pointer"
                                        >
                                            Agendada
                                        </Badge>
                                    </PopoverContent>
                                </Popover>
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
