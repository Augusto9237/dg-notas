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
import { Plus } from "lucide-react"
import { useState } from "react"
import { ptBR } from "date-fns/locale"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { generateTimeSlots } from "./agendar-mentoria-aluno"

interface Aluno {
    email: string;
    name: string;
    image: string | null;
    id: string;
    role: string | null;
    emailVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
    banned: boolean | null;
    banReason: string | null;
    banExpires: Date | null;
}

interface AgendarMentoriasProps {
    alunos: Aluno[];
}

const formSchema = z.object({
    aluno: z.string().min(1, "Nome do aluno é obrigatório"),
    data: z.date().min(new Date(), {
        message: "Data é obrigatória",
    }),
    horario: z.string().min(1, "Horário é obrigatório"),
})



export function AgendarMentoriaModal() {
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
                <Button variant="secondary">
                    <Plus />
                    <span className="max-md:hidden">
                        Nova
                    </span>
                    Mentoria
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="text-center">Nova Mentoria</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                        <FormField
                            control={form.control}
                            name="aluno"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Aluno</FormLabel>
                                    <FormControl>
                                        <Select onValueChange={field.onChange} defaultValue={String(field.value)}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Daniely Guedes" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {dummyStudents.map((aluno) => (
                                                    <SelectItem key={aluno.id} value={String(aluno.id)}>
                                                        <div className="flex items-center gap-4">
                                                            <Avatar>
                                                                <AvatarImage src="https://github.com/shadcn.png" />
                                                                <AvatarFallback>CN</AvatarFallback>
                                                            </Avatar>
                                                            {aluno.name}
                                                        </div>
                                                    </SelectItem>
                                                ))}

                                            </SelectContent>
                                        </Select>
                                    </FormControl>
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
                                            return dayOfWeek !== 2 && dayOfWeek !== 4
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
                                                    <SelectItem key={time.slot} value={time.time}>
                                                        {time.display}
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
                            >
                                {form.formState.isSubmitting ? 'Agendando...' : 'Agendar'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog >
    )
}