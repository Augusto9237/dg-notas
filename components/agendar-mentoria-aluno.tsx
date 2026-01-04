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
import { CalendarPlus, CalendarSync, Loader2 } from "lucide-react"
import { useState, useEffect, useMemo, useCallback, Dispatch, SetStateAction, useRef } from "react"
import { ptBR } from "date-fns/locale"
import { adicionarMentoria, editarMentoria, verificarDisponibilidadeMultiplosSlots } from "@/actions/mentoria"
import { authClient } from "@/lib/auth-client"
import { toast } from "sonner"
import { DiaSemana, Prisma, SlotHorario } from "@/app/generated/prisma"
import clsx from "clsx"
import { enviarNotificacaoParaUsuario } from "@/actions/notificacoes"
import { format } from "date-fns"
import { CalendarioAgendarMentoria } from "./calendario-agendar-mentoria"

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
    professorId: string;
    mode?: 'create' | 'edit';
    usuario?: 'professor' | 'aluno';
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
    professorId,
    mode = 'create',
    usuario = 'aluno',
    mentoriaData,
    size = "sm",
    setIsOpen
}: AgendarMentoriaAlunoProps) {
    const [open, setOpen] = useState(false)
    const [vagas, setVagas] = useState<Record<string, number>>({});
    const [isLoading, setIsLoading] = useState(false);
    const { data: session } = authClient.useSession();
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Memoizar a data inicial para evitar recálculos
    const initialDate = useMemo(() => {
        if (mode === 'edit' && mentoriaData) {
            return convertUTCToLocalDate(mentoriaData.horario.data);
        }
        return new Date();
    }, [mode, mentoriaData]);

    // Memoizar IDs dos slots para evitar recriação de arrays
    const slotIds = useMemo(() => slotsHorario.map(slot => slot.id), [slotsHorario]);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            horario: mode === 'edit' && mentoriaData
                ? String(mentoriaData.horario.slotId)
                : '',
            data: mode === 'edit' && mentoriaData
                ? initialDate : undefined
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
    }, [mode, mentoriaData, form, initialDate]);

    const watchedData = form.watch('data');

    // Memoizar cálculo do diaSemanaId
    const diaSemanaId = useMemo(() => {
        if (!watchedData) return 0;
        return diasSemana.find(dia => dia.dia === watchedData.getDay())?.id || 0;
    }, [watchedData, diasSemana]);

    // Função otimizada para verificar vagas com debounce
    const verificarVagas = useCallback(async (data: Date) => {
        if (!data || slotIds.length === 0) {
            setVagas({});
            return;
        }

        setIsLoading(true);
        try {
            const vagasResult = await verificarDisponibilidadeMultiplosSlots(
                data,
                slotIds,
                diaSemanaId
            );

            // Converter para Record<string, number> para manter compatibilidade
            const vagasMap: Record<string, number> = {};
            Object.entries(vagasResult).forEach(([slotId, vagas]) => {
                vagasMap[slotId] = Number(vagas);
            });

            setVagas(vagasMap);
        } catch (error) {
            console.error('Erro ao verificar vagas:', error);
            setVagas({});
        } finally {
            setIsLoading(false);
        }
    }, [slotIds, diaSemanaId]);

    // useEffect com debounce para evitar múltiplas chamadas
    useEffect(() => {
        // Limpar timer anterior se existir
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        if (!watchedData) {
            setVagas({});
            return;
        }

        // Debounce de 300ms para evitar chamadas excessivas
        debounceTimerRef.current = setTimeout(() => {
            verificarVagas(watchedData);
        }, 300);

        // Cleanup
        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, [watchedData, verificarVagas]);


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

    // Memoizar função de submit
    const onSubmit = useCallback(async (values: z.infer<typeof formSchema>) => {
        if (!professorId || !session?.user.id) return
        try {
            if (mode === 'edit' && mentoriaData) {
                await editarMentoria({
                    mentoriaId: mentoriaData.id,
                    data: values.data,
                    slotId: Number(values.horario),
                    diaSemanaId: mentoriaData.horario.diaSemanaId,
                    duracao: mentoriaData.duracao,
                });
            } else {
                const diaSemanaIdCalculado = diasSemana.find(dia => dia.dia === values.data.getDay())?.id || 0;
                await adicionarMentoria({
                    professorId,
                    alunoId: session.user.id,
                    data: values.data,
                    slotId: Number(values.horario),
                    diaSemanaId: diaSemanaIdCalculado,
                });
            }
            const message = mode === 'edit' ? 'Mentoria editada com sucesso!' : 'Mentoria agendada com sucesso!';
            toast.success(message);
            form.reset();
            setOpen(false);
            setIsOpen?.(false)
            await enviarNotificacaoParaUsuario(usuario === 'aluno' ? professorId : (mentoriaData?.alunoId ?? ''), 'Mentoria agendada', `${session?.user.name} ${mode === 'edit' ? 'reagendou' : 'agendou'} uma mentoria para ${formartarData(values.data)} de ${slotsHorario.find(slot => slot.id === Number(values.horario))?.nome}`, `${usuario === 'aluno' ? '/professor/mentorias' : '/aluno/mentorias'}`)
        } catch (error) {
            toast.error('Algo deu errado, tente novamente');
            console.error(`Erro ao ${mode === 'edit' ? 'editar' : 'agendar'} mentoria:`, error);
        }
    }, [mode, mentoriaData, session?.user.id, session?.user.name, diasSemana, form, setIsOpen, professorId, slotsHorario, usuario]);

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
                                    <CalendarioAgendarMentoria
                                        primeiroDiaSemana={diasSemana[0].dia}
                                        segundoDiaSemana={diasSemana[1].dia}
                                        selecionado={field.value}
                                        aoSelecionar={field.onChange}
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
                                        <div className="grid grid-cols-3 gap-4 max-h-48 overflow-y-auto ">
                                            {slotsHorario.map((slot) => (
                                                <Button
                                                    key={slot.id}
                                                    size="sm"
                                                    variant={field.value === String(slot.id) ? "outline" : "ghost"}
                                                    className={clsx('text-xs', field.value === String(slot.id) && "bg-primary/5")}
                                                    onClick={() => field.onChange(String(slot.id))}
                                                    disabled={vagas[slot.id] === 0}
                                                    type="button"
                                                >
                                                    {slot.nome}
                                                </Button>
                                            ))}
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4 pt-4">
                            <div className={clsx(form.formState.isSubmitting ? 'animate-fade-left animate-once hidden' : "w-full flex md:justify-end")}>
                                <Button
                                    type="button"
                                    variant='ghost'
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