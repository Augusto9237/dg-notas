'use client'
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
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
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { CalendarPlus, CalendarSync, Loader2 } from "lucide-react"
import { useState, useEffect, Dispatch, SetStateAction } from "react"
import { ptBR } from "date-fns/locale"
import { adicionarMentoria, editarMentoria, verificarDisponibilidadeMultiplosSlots } from "@/actions/mentoria"
import { authClient } from "@/lib/auth-client"
import { toast } from "sonner"
import { DiaSemana, Prisma, SlotHorario } from "@/app/generated/prisma"
import clsx from "clsx"
import { enviarNotificacaoParaUsuario } from "@/actions/notificacoes"
import { format } from "date-fns"
import { CalendarioAgendarMentoria } from "./calendario-agendar-mentoria"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion"
import { Skeleton } from "./ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { listarProfessores } from "@/actions/admin"

const formSchema = z.object({
    professorId: z.string(),
    data: z.date({
        message: "Data é obrigatória",
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

type Professor = {
    name: string;
    id: string;
    especialidade: string | null;
    image: string | null;
}

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

// Funções puras fora do componente — o compiler não precisa rastreá-las como dependências
function convertUTCToLocalDate(utcDate: Date): Date {
    const utc = new Date(utcDate);
    return new Date(utc.getUTCFullYear(), utc.getUTCMonth(), utc.getUTCDate());
}

function formatarData(data: Date): string {
    const dataUTC = new Date(data);
    const dataLocal = new Date(
        dataUTC.getUTCFullYear(),
        dataUTC.getUTCMonth(),
        dataUTC.getUTCDate()
    );
    return format(dataLocal, "dd/MM/yyyy", { locale: ptBR });
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
    const [professores, setProfessores] = useState<Professor[]>([])
    const [accordionValue, setAccordionValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isCheckingVagas, setIsCheckingVagas] = useState(false);
    const { data: session } = authClient.useSession();

    useEffect(() => {
        async function buscarProfessores() {
            setIsLoading(true)
            const data = await listarProfessores()
            setProfessores(data.data)
            setIsLoading(false)
        }
        buscarProfessores()
    }, [])

    const initialDate = mode === 'edit' && mentoriaData
        ? convertUTCToLocalDate(mentoriaData.horario.data)
        : new Date();

    const slotIds = slotsHorario.map(slot => slot.id)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            professorId: professorId || '',
            horario: mode === 'edit' && mentoriaData
                ? String(mentoriaData.horario.slotId)
                : '',
            data: mode === 'edit' && mentoriaData
                ? initialDate : undefined
        },
    })

    useEffect(() => {
        if (mode === 'edit' && mentoriaData) {
            const dataCorrigida = convertUTCToLocalDate(mentoriaData.horario.data);
            form.reset({
                professorId: mentoriaData.professorId || professorId || '',
                horario: String(mentoriaData.horario.slotId),
                data: dataCorrigida
            });
        } else if (mode === 'create') {
            form.reset({
                professorId: professorId || '',
                horario: '',
                data: undefined,
            });
        }
    }, [mode, mentoriaData, professorId]);
    // ^ form e initialDate removidos das deps: form é estável do useForm,
    //   initialDate agora é calculado inline sem useMemo

    const watchedData = form.watch('data');

    const diaSemanaId = watchedData
        ? diasSemana.find(dia => dia.dia === watchedData.getDay())?.id ?? 0
        : 0;

    // Debounce direto no useEffect — padrão correto com cleanup nativo
    useEffect(() => {
        if (!watchedData || slotIds.length === 0) {
            setVagas({});
            setIsCheckingVagas(false);
            return;
        }

        setIsCheckingVagas(true);

        const timer = setTimeout(async () => {
            try {
                const vagasResult = await verificarDisponibilidadeMultiplosSlots(
                    watchedData,
                    slotIds,
                    diaSemanaId
                );

                const vagasMap: Record<string, number> = {};
                Object.entries(vagasResult).forEach(([slotId, vagas]) => {
                    vagasMap[slotId] = Number(vagas);
                });

                setVagas(vagasMap);
            } catch (error) {
                console.error('Erro ao verificar vagas:', error);
                setVagas({});
            } finally {
                setIsCheckingVagas(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [watchedData, diaSemanaId]);
    // slotIds removido das deps pois é derivado de slotsHorario (prop estável)

    useEffect(() => {
        setAccordionValue(watchedData ? "item-1" : "");
    }, [watchedData]);

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!values.professorId || !session?.user.id) return

        const slotNome = slotsHorario.find(slot => slot.id === Number(values.horario))?.nome ?? '';
        const notificacaoDestinatario = usuario === 'aluno'
            ? values.professorId
            : (mentoriaData?.alunoId ?? '');
        const notificacaoRota = usuario === 'aluno' ? '/professor/mentorias' : '/aluno/mentorias';

        if (mode === 'edit' && mentoriaData) {
            const response = await editarMentoria({
                mentoriaId: mentoriaData.id,
                data: values.data,
                slotId: Number(values.horario),
                diaSemanaId: mentoriaData.horario.diaSemanaId,
                duracao: mentoriaData.duracao,
            });

            if (!response.success) {
                toast.error(response.error);
                return;
            }

            toast.success(response.message);
            await enviarNotificacaoParaUsuario(
                notificacaoDestinatario,
                'Mentoria reagendada',
                `${session.user.name} reagendou uma mentoria para ${formatarData(values.data)} de ${slotNome}`,
                notificacaoRota
            );
        } else {
            const diaSemanaIdCalculado = diasSemana.find(dia => dia.dia === values.data.getDay())?.id ?? 0;
            const response = await adicionarMentoria({
                professorId: values.professorId,
                alunoId: session.user.id,
                data: values.data,
                slotId: Number(values.horario),
                diaSemanaId: diaSemanaIdCalculado,
            });

            if (!response.success) {
                toast.error(response.error);
                return;
            }

            toast.success(response.message);
            await enviarNotificacaoParaUsuario(
                notificacaoDestinatario,
                'Mentoria agendada',
                `${session.user.name} agendou uma mentoria para ${formatarData(values.data)} de ${slotNome}`,
                notificacaoRota
            );
        }

        form.reset();
        setOpen(false);
        setIsOpen?.(false);
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild disabled={mentoriaData?.status === 'REALIZADA'}>
                {mode === 'edit' ? (
                    <Button
                        size={size}
                        variant={mentoriaData?.status === 'REALIZADA' ? 'ghost' : 'default'}
                        className="w-full"
                    >
                        <CalendarSync />
                        Reagendar
                    </Button>
                ) : (
                    <Button variant='secondary' className="rounded-full fixed bottom-20 right-5 size-12 shadow-md">
                        <CalendarPlus />
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="text-center">
                        {mode === 'edit' ? 'Reagendar Mentoria' : 'Agendar Mentoria'}
                    </DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                        <FormField
                            control={form.control}
                            name="professorId"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Professor(a)</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                                        <SelectTrigger className="w-full py-3 data-[size=default]:h-12.5">
                                            <SelectValue placeholder="Selecione um professor" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                {isLoading ? (
                                                    <Skeleton className="h-12.5 w-full" />
                                                ) : professores.map((professor) => (
                                                    <SelectItem key={professor.id} value={professor.id}>
                                                        <div className="flex items-center gap-2">
                                                            <Avatar>
                                                                <AvatarImage className="object-cover" src={professor.image ?? ''} />
                                                                <AvatarFallback>{professor.name.charAt(0)}</AvatarFallback>
                                                            </Avatar>
                                                            <div className="flex flex-col text-xs items-start">
                                                                {professor.name}
                                                                <span className="text-xs text-muted-foreground">{professor.especialidade}</span>
                                                            </div>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="data"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Data</FormLabel>
                                    <CalendarioAgendarMentoria
                                        primeiroDiaSemana={diasSemana[0]?.dia ?? 0}
                                        segundoDiaSemana={diasSemana[1]?.dia ?? 0}
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
                                    <Accordion type="single" collapsible className="w-full" value={accordionValue} onValueChange={setAccordionValue}>
                                        <AccordionItem value="item-1">
                                            <AccordionTrigger className="py-2">Horário</AccordionTrigger>
                                            <AccordionContent>
                                                <FormControl>
                                                    {watchedData ? (
                                                        <div className="grid grid-cols-3 gap-4 max-h-40 overflow-y-auto">
                                                            {isCheckingVagas ? (
                                                                Array.from({ length: 6 }).map((_, index) => (
                                                                    <Skeleton key={index} className="h-10 w-full rounded-lg" />
                                                                ))
                                                            ) : (
                                                                slotsHorario.map((slot) => (
                                                                    <Button
                                                                        key={slot.id}
                                                                        size="sm"
                                                                        variant={field.value === String(slot.id) ? "outline" : "ghost"}
                                                                        className={clsx('text-xs flex flex-col h-10', field.value === String(slot.id) && "bg-primary/5")}
                                                                        onClick={() => field.onChange(String(slot.id))}
                                                                        disabled={vagas[slot.id] === 0}
                                                                        type="button"
                                                                    >
                                                                        <span>{slot.nome}</span>
                                                                    </Button>
                                                                ))
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center justify-center h-12 text-muted-foreground text-xs">
                                                            Selecione uma data primeiro
                                                        </div>
                                                    )}
                                                </FormControl>
                                            </AccordionContent>
                                        </AccordionItem>
                                        <FormMessage />
                                    </Accordion>
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <Button
                                type="button"
                                variant='ghost'
                                onClick={() => {
                                    form.reset()
                                    setOpen(false)
                                }}
                            >
                                Cancelar
                            </Button>

                            <Button type="submit" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                                {form.formState.isSubmitting
                                    ? (mode === 'edit' ? 'Reagendando' : 'Agendando')
                                    : (mode === 'edit' ? 'Reagendar' : 'Agendar')
                                }
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}