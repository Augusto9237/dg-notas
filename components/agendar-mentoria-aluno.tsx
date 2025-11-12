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
import { CalendarPlus, CalendarSync, Loader2 } from "lucide-react"
import { useState, useEffect, Dispatch, SetStateAction } from "react"
import { ptBR } from "date-fns/locale"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { adicionarMentoria, editarMentoria, verificarDisponibilidadeHorario } from "@/actions/mentoria"
import { authClient } from "@/lib/auth-client"
import { toast } from "sonner"
import { DiaSemana, Prisma, SlotHorario } from "@/app/generated/prisma"
import clsx from "clsx"

const formSchema = z.object({
    data: z.date({
        message: "Data é obrigatória",
    }).min(new Date(), {
        message: "Data deve ser no futuro",
    }),
    horario: z.string({ message: "Selecione um horario" }).min(1)
})


type Mentoria = Prisma.MentoriaGetPayload<{
    include: {
        horario: {
            include: {
                slot: true
            }
        }
    };
}>;

// Props do componente
interface AgendarMentoriaAlunoProps {
    diasSemana: DiaSemana[]
    slotsHorario: SlotHorario[]
    mode?: 'create' | 'edit';
    mentoriaData?: Mentoria;
    size?: "default" | "sm" | "lg" | "icon" | null | undefined
    setIsOpen?: Dispatch<SetStateAction<boolean>>
}

// Função utilitária para converter data UTC em data local (apenas data, sem horário)
function convertUTCToLocalDate(utcDate: Date): Date {
    const utc = new Date(utcDate);
    // Criar uma nova data usando os componentes UTC como se fossem locais
    return new Date(
        utc.getUTCFullYear(),
        utc.getUTCMonth(),
        utc.getUTCDate()
    );
}

export function AgendarMentoriaAluno({
    diasSemana,
    slotsHorario,
    mode = 'create',
    mentoriaData,
    size = "sm",
    setIsOpen
}: AgendarMentoriaAlunoProps) {
    const [open, setOpen] = useState(false)
    const [vagas, setVagas] = useState<Record<string, number>>({});
    const [isLoading, setIsLoading] = useState(false);
    const { data: session } = authClient.useSession();

    // Determinar a data inicial corrigindo o fuso horário
    const getInitialDate = () => {
        if (mode === 'edit' && mentoriaData) {
            return convertUTCToLocalDate(mentoriaData.horario.data);
        }
        return new Date();
    };

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            horario: mode === 'edit' && mentoriaData
                ? String(mentoriaData.horario.slotId)
                : '',
            data: mode === 'edit' && mentoriaData
                ? getInitialDate() : undefined
        },
    })

    // Resetar formulário quando modo ou dados da mentoria mudarem
    useEffect(() => {
        if (mode === 'edit' && mentoriaData) {
            const dataCorrigida = convertUTCToLocalDate(mentoriaData.horario.data);

            form.reset({
                horario: String(mentoriaData.horario.slotId),
                data: dataCorrigida
            });
        } else if (mode === 'create') {
            form.reset({
                horario: '',
                data: undefined,
            });
        }
    }, [mode, mentoriaData, form]);

    const watchedData = form.watch('data');

    useEffect(() => {
        const verificarVagas = async () => {
            if (!watchedData) return;

            setIsLoading(true);
            const vagasPromises = slotsHorario.map(horario =>
                verificarDisponibilidadeHorario(watchedData, horario.id)
            );
            const vagasResult = await Promise.all(vagasPromises);

            const vagasMap: Record<string, number> = {};
            slotsHorario.forEach((horario, index) => {
                vagasMap[horario.id] = vagasResult[index];
            });

            setVagas(vagasMap);
            setIsLoading(false);
        };

        verificarVagas();
    }, [watchedData, slotsHorario]);

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {

            if (mode === 'edit' && mentoriaData) {
                await editarMentoria({
                    mentoriaId: mentoriaData.id,
                    data: values.data,
                    slotId: Number(values.horario),
                    duracao: mentoriaData.duracao,
                });
            } else {
                await adicionarMentoria({
                    alunoId: session?.user.id || "user_123",
                    data: values.data,
                    slotId: Number(values.horario),
                });
            }
            const message = mode === 'edit' ? 'Mentoria editada com sucesso!' : 'Mentoria agendada com sucesso!';
            toast.success(message);
            form.reset();
            setOpen(false);
            setIsOpen && setIsOpen(false)
        } catch (error) {
            toast.error('Algo deu errado, tente novamente');
            console.error(`Erro ao ${mode === 'edit' ? 'editar' : 'agendar'} mentoria:`, error);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen} >
            <DialogTrigger asChild disabled={mentoriaData?.status === 'REALIZADA'} >
                {mode === 'edit' ?
                    <Button size={size} variant={mentoriaData?.status === 'REALIZADA' ? 'ghost' : "outline"} className="w-full">
                        <CalendarSync />
                        Reagendar
                    </Button>
                    :
                    <Button variant='secondary' className="rounded-full fixed bottom-20 right-5 size-12 shadow-md">
                        <CalendarPlus />
                    </Button>
                }
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="text-center">
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
                                            if (date < new Date()) return true
                                            const dayOfWeek = date.getDay()
                                            return dayOfWeek !== diasSemana[0].dia && dayOfWeek !== diasSemana[1].dia
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
                                        <Select onValueChange={field.onChange} value={String(field.value) ?? ""}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder={!watchedData ? "Selecione uma data primeiro" : "Selecione um horário"} />
                                            </SelectTrigger>
                                            <SelectContent className="space-y-4">
                                                {isLoading && <div className="flex items-center justify-center p-2"><Loader2 className="h-4 w-4 animate-spin" /></div>}
                                                {!isLoading && Object.keys(vagas).length > 0 && slotsHorario.map((horario) => {
                                                    const vagasDisponiveis = vagas[horario.id];
                                                    const isAvailable = vagasDisponiveis > 0;

                                                    return (
                                                        <SelectItem key={horario.id} value={String(horario.id)} disabled={!isAvailable} className={!isAvailable ? 'opacity-45 text-foreground hover:text-foreground' : 'text-primary hover:text-primary'}>
                                                            {horario.nome} - {isAvailable ? `${vagasDisponiveis} ${vagasDisponiveis === 1 ? 'vaga disponível' : 'vagas disponíveis'}` :
                                                                'Reservado'}
                                                        </SelectItem>
                                                    )
                                                })}
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <div className={clsx(form.formState.isSubmitting ? 'animate-fade-left animate-once hidden' : "w-full flex md:justify-end")}>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full md:max-w-[100px]"
                                    onClick={() => {
                                        form.reset()
                                        setOpen(false)
                                    }}
                                >
                                    Cancelar
                                </Button>
                            </div>

                            <div className={clsx(form.formState.isSubmitting ? 'animate-width-transition animate-once w-full col-span-2 flex justify-center' : "w-full flex")}>
                                <Button
                                    type="submit"
                                    className={clsx(form.formState.isSubmitting ? 'animate-width-transition animate-once w-full md:max-w-[216px] flex' : "w-full md:max-w-[100px]")}
                                    disabled={form.formState.isSubmitting}

                                >
                                    {form.formState.isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                                    {form.formState.isSubmitting
                                        ? (mode === 'edit' ? 'Reagendando' : 'Agendando')
                                        : (mode === 'edit' ? 'Reagendar' : 'Agendar')
                                    }
                                </Button>
                            </div>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog >
    )
}