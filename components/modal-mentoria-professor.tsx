'use client';

import { DiaSemana, Prisma, SlotHorario, StatusMentoria } from "@/app/generated/prisma";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { CalendarX, CheckCircle, ChevronRight, Clock2, Loader2 } from "lucide-react";
import { TbClockCheck } from "react-icons/tb";
import { atualizarStatusMentoria, excluirMentoriaECascata } from "@/actions/mentoria";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { AgendarMentoriaAluno } from "./agendar-mentoria-aluno";
import { Separator } from "./ui/separator";
import { Button } from "./ui/button";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { cn } from "@/lib/utils";
import { Badge } from "./ui/badge";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "./ui/select";

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
    const [isOpen, setIsOpen] = useState(false);
    const [mentoriaData, setMentoriaData] = useState<Mentoria | null>(null);
    const [feedback, setFeedback] = useState('')
    const [carregando, setCarregando] = useState(false)

    useEffect(() => {
        setCarregando(true)
        setMentoriaData(mentoria)
        setFeedback(mentoria.feedback || '')
        setCarregando(false)
    }, [mentoria, isOpen])


    async function atualizarStatusDaMentoria(status: "AGENDADA" | "CONFIRMADA" | "REALIZADA") {
        setCarregando(true);
        try {
            // Feedback só deve ser enviado se o status for REALIZADA
            const feedbackToSend = status === 'REALIZADA' && feedback.trim().length > 0 ? feedback.trim() : undefined;
            await atualizarStatusMentoria(mentoria.id, status, feedbackToSend);

            toast.success(
                status === 'REALIZADA'
                    ? 'Mentoria realizada com sucesso!'
                    : 'Status atualizado com sucesso'
            );
            setIsOpen(false);
        } catch (error) {
            console.error('Erro ao atualizar status:', error);
            toast.error('Erro ao atualizar status. Tente novamente.');
        } finally {
            setCarregando(false);
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

    const handleStatusChange = async (novoStatus: "AGENDADA" | "CONFIRMADA" | "REALIZADA") => {
        if (!mentoriaData) return;
        setCarregando(true);
        try {
            setMentoriaData({ ...mentoriaData, status: novoStatus });
            if (novoStatus === 'REALIZADA') {
                toast(`Status da mentoria foi atualizado para ${novoStatus}! Digite um feedback e finalize a mentoria`)
            } else {
                toast(`Status da mentoria foi atualiza para ${novoStatus}! Salve para confirmar a alteração`);
            }
        } catch (error) {
            toast.error('Erro ao atualizar status');
        } finally {
            setCarregando(false);
        }
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
                                            <Select
                                                defaultValue={mentoriaData?.status}
                                                value={mentoriaData?.status}
                                                onValueChange={(value) => handleStatusChange(value as "AGENDADA" | "CONFIRMADA" | "REALIZADA")}
                                            >
                                                <SelectTrigger className="w-full p-0 py-0 border-none shadow-none" style={{ height: '24px' }}>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectGroup>
                                                        <SelectItem value={'AGENDADA'}>
                                                            <Badge
                                                                variant='secondary'
                                                                className="w-full min-w-full"
                                                            >
                                                                <Clock2 className="stroke-card" />
                                                                Agendada
                                                            </Badge>
                                                        </SelectItem>
                                                        <SelectItem value={'CONFIRMADA'}>
                                                            <Badge
                                                                variant='outline'
                                                                className='bg-primary/10 text-primary border border-primary'
                                                            >
                                                                <TbClockCheck className="stroke-primary" />
                                                                Confirmada
                                                            </Badge>
                                                        </SelectItem>
                                                        <SelectItem value={'REALIZADA'}>
                                                            <Badge
                                                                variant='default'
                                                            >
                                                                <CheckCircle className="stroke-card" />
                                                                Realizada
                                                            </Badge>
                                                        </SelectItem>
                                                    </SelectGroup>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <Separator />
                        <DialogFooter>
                            {mentoriaData?.status === 'REALIZADA' ?
                                (
                                    <div className="flex flex-col w-full gap-5">
                                        <Textarea
                                            placeholder="Adicione um Feedback após finalizar a mentoria"
                                            value={feedback}
                                            onChange={(value) => setFeedback(value.currentTarget.value)} />
                                        <Button
                                            className="w-full"
                                            onClick={() => atualizarStatusDaMentoria(mentoriaData.status)}
                                        >Finalizar e enviar o Feedback</Button>
                                    </div>
                                )
                                :
                                (
                                    <>
                                        {mentoria.status !== mentoriaData?.status ?
                                            (
                                                <div className="grid grid-cols-2 gap-4 w-full">
                                                    <Button variant='outline'>
                                                        Cancelar
                                                    </Button>
                                                    <Button onClick={() => atualizarStatusDaMentoria(mentoriaData?.status!)}>
                                                        Salvar
                                                    </Button>
                                                </div>
                                            ) : (
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
                                            )
                                        }
                                    </>

                                )
                            }
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog >
    )
}
