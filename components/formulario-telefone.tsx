'use client'

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useState, useEffect } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Input } from "./ui/input"

const formSchema = z.object({
    telefone: z.string().min(10, "O telefone deve ter pelo menos 10 caracteres."),
})

type FormValues = z.infer<typeof formSchema>

// This interface now only expects the properties the component actually uses,
// making it more robust and preventing type errors from other properties on the user object.
interface FormularioTelefoneProps {
    user: {
        telefone?: string | null;
    } | null
}

export function FormularioTelefone({ user }: FormularioTelefoneProps) {
    const [isOpen, setIsOpen] = useState(true)

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            telefone: user?.telefone || "",
        },
    })

    useEffect(() => {
        // Using == null checks for both null and undefined
        if (user && user.telefone == null) {
            setIsOpen(true)
        }
    }, [user])

    async function onSubmit(values: FormValues) {
        // TODO: This should call an action to update the user's phone number.
        // The previous actions (AdicionarTema, EditarTema) were incorrect for this form.
        console.log(values)
        toast.info("A funcionalidade de salvar o telefone ainda não foi implementada.");
        // Example of what the implementation could look like:
        // try {
        //   await updateUserPhoneNumber(values.telefone);
        //   toast.success("Telefone salvo com sucesso!");
        //   setIsOpen(false);
        // } catch (error) {
        //   toast.error("Erro ao salvar o telefone.");
        // }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="text-center">
                        Adicionar Telefone
                    </DialogTitle>
                    <DialogDescription>
                        Adicione um telefone para contato.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="telefone"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Telefone</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="(11) 99999-9999"
                                            {...field}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                const cleanedValue = value.replace(/\D/g, ''); // Remove non-digits
                                                let formattedValue = '';

                                                if (cleanedValue.length > 0) {
                                                    formattedValue += `(${cleanedValue.substring(0, 2)}`;
                                                }
                                                if (cleanedValue.length > 2) {
                                                    formattedValue += `) ${cleanedValue.substring(2, 7)}`;
                                                }
                                                if (cleanedValue.length > 7) {
                                                    formattedValue += `-${cleanedValue.substring(7, 11)}`;
                                                }
                                                field.onChange(formattedValue);
                                            }}
                                            value={field.value || ''} // Ensure controlled component
                                            maxLength={15} // (XX) XXXXX-XXXX is 15 characters long
                                            disabled={form.formState.isSubmitting}
                                            className="bg-background"
                                            required
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-center pt-4">
                            <Button
                                type="submit"
                                className="w-full"
                                disabled={form.formState.isSubmitting}
                            >
                                {form.formState.isSubmitting ? "Salvando..." : "Salvar"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}