'use client'
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { CalendarCheck, CalendarX, ChevronDown, Loader2 } from "lucide-react";
import { DiaSemana, Prisma, SlotHorario, User } from "@/app/generated/prisma";
import { AgendarMentoriaAluno } from "./agendar-mentoria-aluno";
import { atualizarStatusMentoria, excluirMentoriaECascata } from "@/actions/mentoria";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR, se } from "date-fns/locale";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useState } from "react";

type Mentoria = Prisma.MentoriaGetPayload<{
    include: {
        horario: {
            include: {
                slot: true
            }
        }
    };
}>;

interface CardMentoriaProps {
    mentoria: Mentoria;
}

export function CardMentoriaConfirmacao({ mentoria }: CardMentoriaProps) {
    const [open, setOpen] = useState(false);
    const [carregando, setCarregando] = useState(false);

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

    async function atualizarStatusDaMentoria(status: 'CONFIRMADA') {
        setCarregando(true)
        try {
            await atualizarStatusMentoria(mentoria.id, status)
            setOpen(false)
            toast.success('Mentoria confimada com sucesso')
            setCarregando(false)
        } catch {
            toast.error('Erro ao atualizar status')
            setCarregando(false)
        }
    }

    return (
        <Card
            className="cursor-pointer bg-secondary/10 border-secondary hover:shadow-md transition-shadow p-0 gap-2 relative"
        >
            <CardContent className="p-4">
                <div className="flex justify-between items-start">
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <Avatar className="border-2 border-primary size-10">
                                <AvatarImage src="/foto-1.jpeg" style={{ objectFit: 'cover' }} />
                                <AvatarFallback>DG</AvatarFallback>
                            </Avatar>
                            <div className="space-y-1">
                                <h3 className="font-medium text-sm">
                                    Profª Daniely Guedes
                                </h3>
                                <p className="text-xs text-muted-foreground">
                                    {formartarData(mentoria.horario.data)} - {mentoria.horario.slot.nome}
                                </p>
                            </div>
                        </div>
                    </div>
                    <Badge
                        variant='secondary'
                    >
                        Hoje
                    </Badge>
                </div>

            </CardContent>


            <CardFooter className="p-4 pt-0 gap-5 overflow-hidden">
                <Button
                    size="sm"
                    className="w-full"
                >

                    <CalendarCheck />
                    Confirmar
                </Button>
            </CardFooter>
        </Card >
    );
}
