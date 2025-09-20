'use client'
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { CalendarX } from "lucide-react";
import { Prisma, User } from "@/app/generated/prisma";
import { AgendarMentoriaAluno, generateTimeSlots } from "./agendar-mentoria-aluno";
import { excluirMentoriaECascata } from "@/actions/mentoria";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

type Mentoria = Prisma.MentoriaGetPayload<{
    include: {
        horario: true;
    };
}>;

interface CardMentoriaProps {
    mentoria: Mentoria;
    professor?: boolean | null;
    aluno?: User | null;
}

export function CardMentoria({ mentoria, professor = false, aluno }: CardMentoriaProps) {

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
        <Card className="p-0 gap-2">
            <CardContent className="p-4">
                <div className="flex justify-between items-start">
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <Avatar className="border-2 border-primary size-10">
                                <AvatarImage src={professor ? (aluno?.image || '/foto-1.jpeg') : '/foto-1.jpeg'} style={{ objectFit: 'cover' }} />
                                <AvatarFallback>DG</AvatarFallback>
                            </Avatar>
                            <div className="space-y-1">
                                <h3 className="font-medium text-sm">
                                    {professor ? aluno?.name : "Profª Daniely Guedes"}
                                </h3>
                                <p className="text-xs text-muted-foreground">
                                    {formartarData(mentoria.horario.data)} - {
                                        generateTimeSlots().find(slot => slot.slot === mentoria.horario.slot)?.display || mentoria.horario.slot
                                    }
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



            <CardFooter className="p-4 pt-0 gap-5 overflow-hidden grid grid-cols-2">
                <AgendarMentoriaAluno mentoriaData={mentoria} mode="edit"/>
                
                <Button
                    size="sm"
                    variant={mentoria.status === 'REALIZADA' ? 'ghost' : "destructive"}
                    className="w-full"
                    onClick={() => excluirMentoria(mentoria.id)}
                >
                    <CalendarX />
                    Cancelar
                </Button>
            </CardFooter>
        </Card>
    );
}
