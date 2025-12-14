'use client'
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { CalendarX } from "lucide-react";
import { DiaSemana, Prisma, SlotHorario, User } from "@/app/generated/prisma";
import { AgendarMentoriaAluno } from "./agendar-mentoria-aluno";
import { atualizarStatusMentoria, excluirMentoriaECascata } from "@/actions/mentoria";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState, useEffect } from "react";
import { ModalFeedbackMentoria } from "./modal-feedback-mentoria";
import { obterUrlImagem } from "@/lib/obter-imagem";

type Mentoria = Prisma.MentoriaGetPayload<{
    include: {
        horario: {
            include: {
                slot: true
            }
        },
        professor: true
    };
}>;

interface CardMentoriaProps {
    mentoria: Mentoria;
    diasSemana: DiaSemana[]
    slotsHorario: SlotHorario[]
}

export function CardMentoria({ diasSemana, slotsHorario, mentoria }: CardMentoriaProps) {
    const [open, setOpen] = useState(false);
    const [carregando, setCarregando] = useState(false);

    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

    useEffect(() => {
        async function fetchImage() {
            if (mentoria.professor?.image) {
                try {
                    const url = await obterUrlImagem(mentoria.professor.image)
                    setAvatarUrl(url)
                } catch (error) {
                    console.error("Erro ao carregar imagem:", error)
                }
            }
        }
        fetchImage()
    }, [mentoria.professor?.image])

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

    async function atualizarStatusDaMentoria(status: "AGENDADA" | "REALIZADA") {
        setCarregando(true)
        try {
            await atualizarStatusMentoria(mentoria.id, status)
            setOpen(false)
            toast.success('Status atualizado com sucesso')
            setCarregando(false)
        } catch {
            toast.error('Erro ao atualizar status')
            setCarregando(false)
        }
    }

    return (
        <Card className="p-0 gap-2">
            <CardContent className="p-4">
                <div className="flex justify-between items-start">
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <Avatar className="border-2 border-primary size-10">
                                <AvatarImage src={avatarUrl || ''} style={{ objectFit: 'cover' }} />
                                <AvatarFallback>{mentoria.professor?.name?.slice(0, 2)}</AvatarFallback>
                            </Avatar>
                            <div className="space-y-1">
                                <h3 className="font-medium text-sm">
                                    {mentoria.professor?.name}
                                </h3>
                                <p className="text-xs text-muted-foreground">
                                    {formartarData(mentoria.horario.data)} - {mentoria.horario.slot.nome}
                                </p>
                            </div>
                        </div>

                    </div>

                    <Badge
                        variant={mentoria.status === "REALIZADA" ? 'default' : 'secondary'}
                    >
                        {mentoria.status === 'AGENDADA' ? 'Agendada' : 'Realizada'}
                    </Badge>
                </div>

            </CardContent>



            <CardFooter className="p-4 pt-0">
                {mentoria.status === "REALIZADA" ? (
                    <ModalFeedbackMentoria feedback={mentoria.feedback ?? ''} />
                ) : (
                    <div className="gap-5 overflow-hidden grid grid-cols-2 w-full">
                        <AgendarMentoriaAluno professorId={mentoria.professorId || ''} mentoriaData={mentoria} mode="edit" diasSemana={diasSemana} slotsHorario={slotsHorario} />
                        <Button
                            size="sm"
                            variant='ghost'
                            className="w-full text-red-500 hover:text-card hover:bg-red-500  border border-red-500"
                            onClick={() => excluirMentoria(mentoria.id)}
                        >
                            <CalendarX />
                            Cancelar
                        </Button>
                    </div>
                )}

            </CardFooter>
        </Card >
    );
}
