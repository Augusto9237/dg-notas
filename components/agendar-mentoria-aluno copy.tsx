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
import { enviarNotificacaoParaTodos, enviarNotificacaoParaUsuario } from "@/actions/notificacoes"
import { format } from "date-fns"
import { CalendarioAgendarMentoria } from "./calendario-agendar-mentoria"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion"
import { Skeleton } from "./ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { listarProfessores } from "@/actions/admin"
import { Calendar } from "./ui/calendar"
import { defineStepper } from "@stepperize/react"
import { StepStatus, useStepItemContext } from "@stepperize/react/primitives"
import { RadioGroup, RadioGroupItem } from "./ui/radio-group"
import { Field, FieldContent, FieldDescription, FieldLabel, FieldTitle } from "./ui/field"

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

const { Stepper, ...stepperDefinition } = defineStepper(
    {
        id: "step-1",
        title: "Professor(a)",
        description: "Selecione um professor",
    },
    {
        id: "step-2",
        title: "Data",
        description: "Selecione uma data",
    },
    {
        id: "step-3",
        title: "Horário",
        description: "Selecione um horário",
    },
);

const StepperTriggerWrapper = () => {
    const item = useStepItemContext();
    const isInactive = item.status === "inactive";

    return (
        <Stepper.Trigger
            render={(domProps) => (
                <Button
                    className="rounded-full"
                    variant={isInactive ? "ghost" : "default"}
                    size="icon"
                    {...domProps}
                    type="button"
                >
                    <Stepper.Indicator>
                        {item.index + 1}
                    </Stepper.Indicator>
                </Button>
            )}
        />
    );
};

const StepperTitleWrapper = ({ title }: { title: string }) => {
    return (
        <Stepper.Title
            render={(domProps) => (
                <h4 className="text-xs font-medium" {...domProps}>
                    {title}
                </h4>
            )}
        />
    );
};


const StepperSeparatorWithLabelOrientation = ({
    status,
    isLast,
}: { status: StepStatus; isLast: boolean }) => {
    if (isLast) return null;

    return (
        <Stepper.Separator
            orientation="horizontal"
            data-status={status}
            className="absolute left-[calc(50%+30px)] right-[calc(-50%+20px)] top-5 block shrink-0 bg-muted data-[status=success]:bg-primary data-[disabled]:opacity-50 transition-all duration-300 ease-in-out h-0.5"
        />
    );
};


export function NovoAgendarMentoriaAluno({
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

    const watchedData = form.watch('data');

    const diaSemanaId = watchedData
        ? diasSemana.find(dia => dia.dia === watchedData.getDay())?.id ?? 0
        : 0;

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

    useEffect(() => {
        setAccordionValue(watchedData ? "item-1" : "");
    }, [watchedData]);

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!values.professorId || !session?.user.id) return

        const slotNome = slotsHorario.find(slot => slot.id === Number(values.horario))?.nome ?? '';
        const notificacaoDestinatario = usuario === 'aluno'
            ? values.professorId
            : (mentoriaData?.alunoId ?? '');

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
            if (usuario === 'aluno') {
                await enviarNotificacaoParaUsuario(
                    notificacaoDestinatario,
                    'Mentoria reagendada',
                    `${session.user.name} reagendou uma mentoria para ${formatarData(values.data)} de ${slotNome}`,
                    '/aluno/mentorias'
                );
            } else {
                await enviarNotificacaoParaUsuario(
                    notificacaoDestinatario,
                    'Mentoria reagendada',
                    `${session.user.name} reagendou uma mentoria para ${formatarData(values.data)} de ${slotNome}`,
                    '/professor/mentorias'
                );
                await enviarNotificacaoParaTodos(
                    'assistente',
                    'Mentoria reagendada',
                    `${session.user.name} reagendou uma mentoria para ${formatarData(values.data)} de ${slotNome}`,
                    '/assistente/mentorias'
                );
                await enviarNotificacaoParaTodos(
                    'admin',
                    'Mentoria reagendada',
                    `${session.user.name} reagendou uma mentoria para ${formatarData(values.data)} de ${slotNome}`,
                    '/admin/mentorias'
                );
            }
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
            if (usuario === 'aluno') {
                await enviarNotificacaoParaUsuario(
                    notificacaoDestinatario,
                    'Mentoria agendada',
                    `${session.user.name} agendou uma mentoria para ${formatarData(values.data)} de ${slotNome}`,
                    '/professor/mentorias'
                );
            } else {
                await enviarNotificacaoParaTodos(
                    'aluno',
                    'Mentoria agendada',
                    `${session.user.name} agendou uma mentoria para ${formatarData(values.data)} de ${slotNome}`,
                    '/aluno/mentorias'
                );
                await enviarNotificacaoParaTodos(
                    'assistente',
                    'Mentoria agendada',
                    `${session.user.name} agendou uma mentoria para ${formatarData(values.data)} de ${slotNome}`,
                    '/assistente/mentorias'
                );
                await enviarNotificacaoParaTodos(
                    'admin',
                    'Mentoria agendada',
                    `${session.user.name} agendou uma mentoria para ${formatarData(values.data)} de ${slotNome}`,
                    '/admin/mentorias'
                );
            }
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
                    <Stepper.Root className="w-full h-full flex flex-col space-y-4 min-h-0" orientation="horizontal">
                        {({ stepper }) => (
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                                <Stepper.List className="flex list-none gap-2 flex-row items-center w-full justify-between shrink-0">
                                    {stepper.state.all.map((stepData, index) => {
                                        const currentIndex = stepper.state.current.index;
                                        const status = index < currentIndex ? "success" : index === currentIndex ? "active" : "inactive";
                                        const isLast = index === stepper.state.all.length - 1;
                                        const data = stepData as { id: string; title: string; description?: string };
                                        return (
                                            <Stepper.Item
                                                key={stepData.id}
                                                step={stepData.id}
                                                className="group peer relative flex w-full flex-col items-center justify-center gap-2"
                                            >
                                                <StepperTriggerWrapper />
                                                <StepperSeparatorWithLabelOrientation
                                                    status={status}
                                                    isLast={isLast}
                                                />
                                                <StepperTitleWrapper
                                                    title={data.title}
                                                />
                                            </Stepper.Item>
                                        );
                                    })}
                                </Stepper.List>
                                <div className="flex-1 min-h-[466px] max-sm:min-h-[396px] flex flex-col">
                                    {stepper.flow.switch({
                                        'step-1': () =>
                                            < FormField
                                                control={form.control}
                                                name="professorId"
                                                render={({ field }) => (
                                                    <FormItem className="flex flex-col">
                                                        <FormLabel>Professor(a)</FormLabel>
                                                        <RadioGroup defaultValue="plus" className="">
                                                            {professores.map((professor) => (
                                                                <FieldLabel htmlFor={professor.id} key={professor.id}>
                                                                    <Field orientation="horizontal">
                                                                        <FieldContent className="flex flex-row items-center gap-3">
                                                                            <Avatar>
                                                                                <AvatarImage className="object-cover" src={professor.image ?? ''} />
                                                                                <AvatarFallback>{professor.name.charAt(0)}</AvatarFallback>
                                                                            </Avatar>
                                                                            <div>
                                                                                <FieldTitle>{professor.name}</FieldTitle>
                                                                                <FieldDescription className="text-xs">
                                                                                    {professor.especialidade}
                                                                                </FieldDescription>
                                                                            </div>
                                                                        </FieldContent>
                                                                        <RadioGroupItem value={professor.id} id={professor.id} />
                                                                    </Field>
                                                                </FieldLabel>
                                                            ))}
                                                        </RadioGroup>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />,
                                        'step-2': () =>
                                            < FormField
                                                control={form.control}
                                                name="data"
                                                render={({ field }) => (
                                                    <FormItem className="flex flex-col">
                                                        <FormLabel>Data</FormLabel>
                                                        <Calendar
                                                            mode="single"
                                                            selected={field.value}
                                                            onSelect={field.onChange}
                                                            disabled={(date) => {
                                                                const hoje = new Date();
                                                                hoje.setHours(0, 0, 0, 0);
                                                                const diasPermitidos = diasSemana.map(d => d.dia);
                                                                return date < hoje || !diasPermitidos.includes(date.getDay());
                                                            }}
                                                            locale={ptBR}
                                                            className="w-full"
                                                        />
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />,
                                        'step-3': () =>
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
                                    })}
                                </div>
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
                        )}
                    </Stepper.Root>
                </Form>
            </DialogContent>
        </Dialog>
    )
}