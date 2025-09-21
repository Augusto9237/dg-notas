'use client'
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Calendar } from "./ui/calendar"
import { CalendarPlus, CalendarSync } from "lucide-react"
import { useState, useEffect } from "react"
import { ptBR } from "date-fns/locale"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { adicionarMentoria, editarMentoria, verificarDisponibilidadeHorario } from "@/actions/mentoria"
import { authClient } from "@/lib/auth-client"
import { toast } from "sonner"
import { Prisma } from "@/app/generated/prisma"


const formSchema = z.object({
    data: z.date({
        message: "Data é obrigatória",
    }).min(new Date(), {
        message: "Data deve ser no futuro",
    }),
    horario: z.string().min(1, "Horário é obrigatório"),
})


// Enum dos slots de horário (baseado no schema)
enum SlotHorario {
    SLOT_15_00 = "SLOT_15_00",
    SLOT_15_20 = "SLOT_15_20",
    SLOT_15_40 = "SLOT_15_40",
    SLOT_16_00 = "SLOT_16_00",
    SLOT_16_20 = "SLOT_16_20",
    SLOT_16_40 = "SLOT_16_40"
}

// Interface para representar um slot de horário
interface TimeSlot {
    slot: SlotHorario;
    display: string;
    time: string;
}

export function generateTimeSlots(): TimeSlot[] {
    return [
        { slot: SlotHorario.SLOT_15_00, display: "15:00 - 15:20", time: "15:00" },
        { slot: SlotHorario.SLOT_15_20, display: "15:20 - 15:40", time: "15:20" },
        { slot: SlotHorario.SLOT_15_40, display: "15:40 - 16:00", time: "15:40" },
        { slot: SlotHorario.SLOT_16_00, display: "16:00 - 16:20", time: "16:00" },
        { slot: SlotHorario.SLOT_16_20, display: "16:20 - 16:40", time: "16:20" },
        { slot: SlotHorario.SLOT_16_40, display: "16:40 - 17:00", time: "16:40" }
    ];
}


type Mentoria = Prisma.MentoriaGetPayload<{
    include: {
        horario: true;
    };
}>;


// Props do componente
interface AgendarMentoriaAlunoProps {
    mode?: 'create' | 'edit';
    mentoriaData?: Mentoria;
    onSuccess?: () => void;
}

export function AgendarMentoriaAluno({
    mode = 'create',
    mentoriaData,
    onSuccess
}: AgendarMentoriaAlunoProps) {
    const [open, setOpen] = useState(false)
    const [vagasDisponiveis, setVagasDisponiveis] = useState<number>(4)
    const { data: session } = authClient.useSession();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            horario: mode === 'edit' && mentoriaData
                ? generateTimeSlots().find(slot => slot.slot === mentoriaData.horario.slot)?.time
                : "",
            data: mode === 'edit' && mentoriaData ? mentoriaData.horario.data : new Date(),
        },
    })

    // Resetar formulário quando modo ou dados da mentoria mudarem
    useEffect(() => {
        if (mode === 'edit' && mentoriaData) {
            form.reset({
                horario: generateTimeSlots().find(slot => slot.slot === mentoriaData.horario.slot)?.time,
                data: mentoriaData.horario.data
            });
        } else if (mode === 'create') {
            form.reset({
                horario: "",
                data: new Date(),
            });
        }
    }, [mode, mentoriaData, form]);

    // Verificar disponibilidade quando data ou horário mudarem
    const watchedData = form.watch('data')
    const watchedHorario = form.watch('horario')

    useEffect(() => {
        async function verificarVagas() {
            const data = form.getValues('data')
            const horario = form.getValues('horario')

            if (data && horario) {
                const timeSlot = generateTimeSlots().find(slot => slot.time === horario)
                if (timeSlot) {
                    const vagas = await verificarDisponibilidadeHorario(data, timeSlot.slot)
                    setVagasDisponiveis(vagas)
                }
            }
        }
        verificarVagas()
    }, [watchedData, watchedHorario, form])


    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            const timeSlot = generateTimeSlots().find(slot => slot.time === values.horario)
            if (!timeSlot) {
                toast.error('Horário inválido selecionado');
                return;
            }
            const slot = timeSlot.slot;

            let result;

            if (mode === 'edit' && mentoriaData) {
                result = await editarMentoria({
                    mentoriaId: mentoriaData.id,
                    data: values.data,
                    slot: slot,
                    duracao: mentoriaData.duracao,
                });
            } else {
                result = await adicionarMentoria({
                    alunoId: session?.user.id || "user_123",
                    data: values.data,
                    slot: slot,
                });
            }

            if (result.success) {
                const message = mode === 'edit' ? 'Mentoria editada com sucesso!' : 'Mentoria agendada com sucesso!';
                toast.success(message);
                form.reset();
                setOpen(false);
                onSuccess?.();
            } else {
                toast.error(result.error || `Erro ao ${mode === 'edit' ? 'editar' : 'agendar'} mentoria`);
            }
        } catch (error) {
            toast.error('Algo deu errado, tente novamente');
            console.error(`Erro ao ${mode === 'edit' ? 'editar' : 'agendar'} mentoria:`, error);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {mode === 'edit' ?
                    <Button size="sm" variant={mentoriaData?.status === 'REALIZADA' ? 'ghost' : "outline"} className="w-full">
                        <CalendarSync />
                        Reagendar
                    </Button>
                    :
                    <Button>
                        <CalendarPlus />
                        Agendar Mentoria
                    </Button>
                }
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="text-center text-sm">
                        {mode === 'edit' ? 'Reagendar Mentoria' : 'Agendar Mentoria'}
                    </DialogTitle>
                    <DialogDescription className="text-center text-xs">
                        {mode === 'edit'
                            ? 'Altere a data e horário da sua mentoria'
                            : 'Selecione a data e horário para sua mentoria'
                        }
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                        <FormField
                            control={form.control}
                            name="data"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Data</FormLabel>
                                    <Calendar
                                        mode="single"
                                        selected={field.value}
                                        onSelect={field.onChange}
                                        locale={ptBR}
                                        disabled={(date) => {
                                            // Disable dates in the past
                                            if (date < new Date()) return true

                                            // Get day of week (0 = Sunday, 1 = Monday, etc)
                                            const dayOfWeek = date.getDay()

                                            // Only enable Tuesdays (2) and Thursdays (4)
                                            return dayOfWeek !== 1 && dayOfWeek !== 3
                                        }}
                                        className="rounded-md border w-full"
                                    />
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="horario"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Horário</FormLabel>
                                    <FormControl>
                                        <Select onValueChange={field.onChange} value={field.value ?? ""}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Selecione um horário" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {generateTimeSlots().map((timeSlot) => (
                                                    <SelectItem key={timeSlot.slot} value={timeSlot.time} disabled={vagasDisponiveis === 0 ? true : false} className={vagasDisponiveis === 0 ? 'opacity-45' : ''}>
                                                        {timeSlot.display}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-center gap-4">
                            <Button
                                type="button"
                                variant="outline"
                                className="w-[100px]"
                                onClick={() => {
                                    form.reset()
                                    setOpen(false)
                                }}
                            >
                                Cancelar
                            </Button>

                            <Button
                                type="submit"
                                disabled={form.formState.isSubmitting}
                                className="w-[100px]"
                            >
                                {form.formState.isSubmitting
                                    ? (mode === 'edit' ? 'Reagendando...' : 'Agendando...')
                                    : (mode === 'edit' ? 'Reagendar' : 'Agendar')
                                }
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog >
    )
}