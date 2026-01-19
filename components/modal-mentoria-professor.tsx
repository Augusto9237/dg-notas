'use client';

import { DiaSemana, Prisma, SlotHorario } from "@/app/generated/prisma";
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
import { el, ptBR } from "date-fns/locale";

import { cn } from "@/lib/utils";
import { Badge } from "./ui/badge";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { CardMentoriaProfessor } from "./card-mentoria-professor";
import { Label } from "./ui/label";
import { enviarNotificacaoParaUsuario } from "@/actions/notificacoes";
import { useSession } from "@/lib/auth-client";
import clsx from "clsx";

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

export function ModalMentoriaProfessor({ mentoria, diasSemana, slotsHorario }: ModalMentoriaProfessorProps) {
    const { data: session } = useSession()
    const [isOpen, setIsOpen] = useState(false);
    const [mentoriaData, setMentoriaData] = useState<Mentoria | null>(null);
    const [feedback, setFeedback] = useState('')
    const [feedbackTouched, setFeedbackTouched] = useState(false)
    const [carregando, setCarregando] = useState(false)

    useEffect(() => {
        if (!isOpen) return; // só inicializa quando o modal for aberto
        setCarregando(true)
        setMentoriaData(mentoria)
        setFeedback(mentoria.feedback || '')
        setFeedbackTouched(false)
        setCarregando(false)
    }, [mentoria, isOpen])


    async function atualizarStatusDaMentoria(status: "AGENDADA" | "CONFIRMADA" | "REALIZADA") {
        const MENSAGENS = {
            MENTORIA_INVALIDA: 'Dados da mentoria inválidos.',
            FEEDBACK_OBRIGATORIO: 'Por favor, adicione um feedback antes de finalizar a mentoria.',
            REALIZADO_SUCESSO: 'Mentoria realizada com sucesso! Feedback enviado.',
            STATUS_ATUALIZADO: 'Status atualizado com sucesso',
            ERRO_ATUALIZAR: 'Erro ao atualizar status. Tente novamente.'
        };

        const id = mentoria?.id;
        if (!id) {
            toast.error(MENSAGENS.MENTORIA_INVALIDA);
            return;
        }

        setCarregando(true);
        try {
            if (status === 'REALIZADA') {
                const textoFeedbackDigitado = feedback?.trim() ?? '';
                const feedbackExistente = mentoria.feedback?.trim() ?? '';

                const deveEnviarFeedbackDigitado = feedbackTouched && textoFeedbackDigitado.length > 0;
                const feedbackValido = deveEnviarFeedbackDigitado ? textoFeedbackDigitado : feedbackExistente;

                if (!feedbackValido) {
                    toast.error(MENSAGENS.FEEDBACK_OBRIGATORIO);
                    return;
                }

                await atualizarStatusMentoria(id, status, feedbackValido);
                toast.success(MENSAGENS.REALIZADO_SUCESSO);
                setFeedbackTouched(false);
                await enviarNotificacaoParaUsuario(mentoria.aluno.id, 'Mentoria realizada com sucesso', `${session?.user.name} finalizou a mentoria e enviou o seu feedback`, `/aluno/mentorias`)
            } else {
                await atualizarStatusMentoria(id, status);
                toast.success(MENSAGENS.STATUS_ATUALIZADO);
                await enviarNotificacaoParaUsuario(mentoria.aluno.id, 'Mentoria atualizada', `${session?.user.name} atualizou o status da mentoria para ${status}`, `/aluno/mentorias`)
            }

            setIsOpen(false);
        } catch (error) {
            console.error('Erro ao atualizar status:', error);
            toast.error(MENSAGENS.ERRO_ATUALIZAR);
        } finally {
            setCarregando(false);
        }
    }

    async function excluirMentoria(id: number) {
        try {
            await excluirMentoriaECascata(id)
            toast.error('Mentoria excluída com sucesso')
            await enviarNotificacaoParaUsuario(mentoria.aluno.id, 'Mentoria cancelada', `${session?.user.name} cancelou a mentoria`, `/aluno/mentorias`)
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
                toast.info(`Status da mentoria foi atualizado para ${novoStatus}! Digite um feedback e finalize a mentoria`)
            } else {
                toast(`Status da mentoria foi atualiza para ${novoStatus}! Salve para confirmar a alteração`);
            }
        } catch {
            toast.error('Erro ao atualizar status');
        } finally {
            setCarregando(false);
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => setIsOpen(open)}>
            <DialogTrigger asChild>
                <CardMentoriaProfessor mentoria={mentoria} onclick={() => setIsOpen(true)} />
            </DialogTrigger>

            <DialogContent >
                {carregando === true ? (
                    <div className="min-h-[214px] h-full z-50 flex items-center justify-center">
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
                                    <Avatar className={cn('border-2 size-16', { 'border-primary': mentoriaData?.status === 'REALIZADA', 'border-primary/15': mentoriaData?.status === 'CONFIRMADA', 'border-secondary': mentoriaData?.status === 'AGENDADA' })}>
                                        <AvatarImage
                                            src={mentoriaData?.aluno.image || ''}
                                            alt={mentoriaData?.aluno.name}
                                            className="object-cover"
                                        />
                                        <AvatarFallback className='text-xs'>
                                            {mentoriaData?.aluno.name
                                                .split(" ")
                                                .map(word => word.charAt(0))
                                                .join("")
                                                .toUpperCase()
                                                .slice(0, 2)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <Label>{mentoria.aluno.name}</Label>
                                        <DialogDescription>
                                            {mentoria.aluno.email}
                                        </DialogDescription>
                                        <DialogDescription>
                                            {mentoria.aluno.telefone}
                                        </DialogDescription>
                                    </div>
                                </div>
                                <div>
                                    <div className="grid grid-cols-3">
                                        <Label>Data</Label>
                                        <Label>Horário</Label>
                                        <Label>Status</Label>
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
                                                disabled={mentoria.status === 'REALIZADA'}
                                            >
                                                <SelectTrigger className={clsx("w-full py-0 border-none shadow-none",
                                                    {
                                                        'bg-secondary dark:bg-secondary dark:hover:bg-secondary/90 text-card': mentoriaData?.status === 'AGENDADA',
                                                        'bg-primary/10 text-primary': mentoriaData?.status === 'CONFIRMADA',
                                                        'bg-primary text-card dark:text-forenground': mentoriaData?.status === 'REALIZADA'
                                                    })}
                                                    style={{ height: '24px' }}
                                                >
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent >
                                                    <SelectGroup className="space-y-2" >
                                                        <SelectItem value={'AGENDADA'} className="border-transparent h-[24px] bg-secondary text-card hover:bg-secondary/90 focus:bg-secondary/90 focus:text-card">
                                                            <Clock2 className="stroke-card" />
                                                            Agendada
                                                        </SelectItem>
                                                        <SelectItem value={'CONFIRMADA'} className="text-primary h-[24px] bg-primary/10 border border-primary focus:bg-primary/5 focus:text-primary">
                                                            <TbClockCheck className="stroke-primary" />
                                                            Confirmada
                                                        </SelectItem>
                                                        <SelectItem value={'REALIZADA'} className="text-card h-[24px] bg-primary focus:bg-primary/90 focus:text-card">
                                                            <CheckCircle className="stroke-card" />
                                                            Realizada
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
                                            onChange={(e) => { setFeedback(e.currentTarget.value); setFeedbackTouched(true); }} />
                                        <Button
                                            className="w-full"
                                            onClick={() => mentoriaData && atualizarStatusDaMentoria(mentoriaData.status)}
                                        >{mentoria.feedback ? 'Editar Feedback' : 'Finalizar e enviar o Feedback'}</Button>
                                    </div>
                                )
                                :
                                (
                                    <>
                                        {mentoria.status !== mentoriaData?.status ?
                                            (
                                                <div className="grid grid-cols-2 gap-5 w-full">
                                                    <Button variant='ghost' onClick={() => setIsOpen(false)}>
                                                        Cancelar
                                                    </Button>
                                                    <Button onClick={() => mentoriaData && atualizarStatusDaMentoria(mentoriaData.status)}>
                                                        Salvar
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-2 gap-4 w-full">
                                                    <AgendarMentoriaAluno
                                                        mentoriaData={mentoria}
                                                        mode="edit"
                                                        usuario="professor"
                                                        size='default'
                                                        diasSemana={diasSemana}
                                                        slotsHorario={slotsHorario}
                                                        professorId={mentoria.professorId ?? ''}
                                                    />
                                                    <Button
                                                        variant='ghost'
                                                        className="w-full text-red-500 hover:text-card hover:bg-red-500 "
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
