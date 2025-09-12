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
import { Input } from "@/components/ui/input"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Calendar } from "./ui/calendar"
import { CalendarPlus, Plus } from "lucide-react"
import { useState } from "react"
import { ptBR } from "date-fns/locale"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"


const formSchema = z.object({
    aluno: z.string().min(1, "Nome do aluno é obrigatório"),
    data: z.date().min(new Date(), {
        message: "Data é obrigatória",
    }),
    horario: z.string().min(1, "Horário é obrigatório"),
})


export function generateTimeSlots(): string[] {
    return Array.from({ length: 7 }, (_, i) => {
        const hour = 15 + Math.floor(i / 3);
        const minutes = (i % 3) * 20;
        return `${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    });
}

export function AgendarMentoriaAluno() {
    const [open, setOpen] = useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            aluno: "",
            horario: "",
            data: new Date(),
        },
    })

    const dummyStudents: any[] = Array.from({ length: 10 }, (_, i) => ({
        id: `student-${i + 1}`,
        name: `Aluno ${i + 1}`,
    }));

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            // Aqui você pode adicionar a lógica para salvar a mentoria
            console.log(values)

            form.reset()
            setOpen(false)
        } catch (error) {
            console.error('Erro ao agendar mentoria:', error)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <CalendarPlus />
                    Agendar Mentoria
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="text-center">Agendar Mentoria</DialogTitle>
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
                                        <Select onValueChange={field.onChange} defaultValue={field.value ?? ""}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Selecione um horário" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {generateTimeSlots().map((time) => (
                                                    <SelectItem key={time} value={time}>
                                                        {time}
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
                            {form.formState.isSubmitting ? 'Salvando...' : 'Salvar'}
                        </Button>
                    </div>
                </form>
            </Form>
        </DialogContent>
        </Dialog >
    )
}