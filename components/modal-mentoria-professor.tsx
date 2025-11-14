'use client';

import { DiaSemana, Prisma, SlotHorario, StatusMentoria } from "@/app/generated/prisma";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { CalendarX, ChevronDown, ChevronDownIcon, ChevronRight, Loader2 } from "lucide-react";
import { atualizarStatusMentoria, excluirMentoriaECascata } from "@/actions/mentoria";
import { toast } from "sonner";
import { useState } from "react";
import { AgendarMentoriaAluno } from "./agendar-mentoria-aluno";
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
import { Table, TableBody, TableHead, TableHeader, TableRow } from "./ui/table";
import { Badge } from "./ui/badge";
import { Textarea } from "./ui/textarea";

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

interface ModalMentoriaProfessorProps {
    mentoria: Mentoria;
    setListaMentorias: React.Dispatch<React.SetStateAction<Mentoria[]>>
    diasSemana: DiaSemana[]
    slotsHorario: SlotHorario[]
}

const STATUS_TEXT = {
    AGENDADA: "Agendada",
    CONFIRMADA: "Confirmada",
    REALIZADA: "Realizada",
} as const;


export function ModalMentoriaProfessor({ mentoria, setListaMentorias, diasSemana, slotsHorario }: ModalMentoriaProfessorProps) {
    const [open, setOpen] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [carregando, setCarregando] = useState(false)


    async function atualizarStatusDaMentoria(status: "AGENDADA" | "CONFIRMADA" | "REALIZADA") {
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

    const statusText = STATUS_TEXT[mentoria.status as keyof typeof STATUS_TEXT];

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
                    {/* <div className="sm:hidden">
                        <Avatar className="size-10.5">
                            <AvatarImage
                                src={mentoria.aluno.image || ''}
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
                    </div> */}
                </Button>
            </DialogTrigger>

            <DialogContent >
                {carregando === true ? (
                    <div className="min-h-[360px] h-full z-50 flex items-center justify-center">
                        <DialogTitle />
                        <Loader2 className="animate-spin text-primary" size={32} />
                    </div>
                ) : (
                    <>
                        <div className="flex flex-col gap-5 max-sm:gap-2 items-center relative w-full">
                            {/* <Avatar className={cn('size-44 border-2', { 'border-primary': mentoria.status === 'REALIZADA', 'border-primary/15': mentoria.status === 'CONFIRMADA', 'border-secondary': mentoria.status === 'AGENDADA' })}>
                                <AvatarImage
                                    src={mentoria.aluno.image || ''}
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
                            </Avatar> */}
                            <DialogHeader>
                                <DialogTitle className="text-center">
                                    Mentoria
                                </DialogTitle>
                            </DialogHeader>

                            <div className="w-full flex flex-col gap-5 overflow-hidden relative">
                                <div className="flex gap-4 items-center">
                                    <Avatar className={cn('border-2 size-14', { 'border-primary': mentoria.status === 'REALIZADA', 'border-primary/15': mentoria.status === 'CONFIRMADA', 'border-secondary': mentoria.status === 'AGENDADA' })}>
                                        <AvatarImage
                                            src={mentoria.aluno.image || ''}
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
                                    <div>
                                        <h2 className="font-semibold">{mentoria.aluno.name}</h2>
                                        <p className="text-sm text-muted-foreground">
                                            {mentoria.aluno.email}
                                        </p>
                                    </div>
                                </div>
                                <div>
                                    <div className="grid grid-cols-3">
                                        <div>
                                            <p className="font-semibold">Data</p>
                                        </div>
                                        <div>
                                            <p className="font-semibold">Horário</p>
                                        </div>
                                        <div>
                                            <p className="font-semibold">Status</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3">
                                        <div>
                                            <p className="text-sm text-muted-foreground">{formartarData(mentoria.horario.data)}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">{mentoria.horario.slot.nome.replace(' - ', ' às ')}</p>
                                        </div>
                                        <div>
                                            <Badge
                                                variant={mentoria.status === 'AGENDADA' && 'secondary' || mentoria.status === 'CONFIRMADA' && 'outline' || 'default'}
                                                className={cn(mentoria.status === 'CONFIRMADA' && 'bg-primary/10 text-primary border border-primary')}
                                            >
                                                {statusText}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>

                                {/* <ButtonGroup className="w-full max-w-[298px] mt-5">
                                    <Button variant={mentoria.status === 'AGENDADA' && 'secondary' || mentoria.status === 'CONFIRMADA' && 'outline' || 'default'} className={cn("w-full", mentoria.status === 'CONFIRMADA' && 'bg-primary/10')}>
                                        <p className="pl-4">
                                            {statusText}
                                        </p>
                                    </Button>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant={mentoria.status === 'AGENDADA' && 'secondary' || mentoria.status === 'CONFIRMADA' && 'outline' || 'default'} className={cn("!pl-2", mentoria.status === 'CONFIRMADA' && 'bg-primary/10 boder-l-0')}>
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
                                                variant='outline'
                                                onClick={() => atualizarStatusDaMentoria("CONFIRMADA")}
                                                className="w-full bg-primary/10"
                                            >
                                                Confirmada
                                            </Button>

                                            <Button
                                                onClick={() => atualizarStatusDaMentoria("REALIZADA")}
                                                className="w-full"
                                            >
                                                Realizada
                                            </Button>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </ButtonGroup> */}
                            </div>
                        </div>
                        <Separator />
                        <DialogFooter>
                            {mentoria.status === 'CONFIRMADA' ?
                                (
                                    <div className="flex flex-col w-full gap-5">
                                        <Textarea placeholder="Adicione um Feedback após finalizar a mentoria" />
                                        <Button className="w-full">Finalizar e enviar o Feedback</Button>
                                    </div>
                                )
                                :
                                (
                                    <div className="grid grid-cols-2 gap-4 w-full">
                                        <AgendarMentoriaAluno mentoriaData={mentoria} mode="edit" size='default' diasSemana={diasSemana} slotsHorario={slotsHorario} />
                                        <Button
                                            variant="destructive"
                                            className="w-full"
                                            onClick={() => excluirMentoria(mentoria.id)}

                                        >
                                            <CalendarX />
                                            Cancelar
                                        </Button>
                                    </div>
                                )}
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog >
    )
}
