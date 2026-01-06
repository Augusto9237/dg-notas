'use client'

import { Eye, EyeOff, Loader2, PencilIcon, X } from "lucide-react"
import { Button } from "./ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"
import { useEffect, useState } from "react"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form"
import { Input } from "./ui/input"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { Textarea } from "./ui/textarea"
import { User } from "@/app/generated/prisma"

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { atualizarContaProfessor } from "@/actions/admin"
import { ref, uploadBytes } from "firebase/storage"
import { storage } from "@/lib/firebase"
import { obterUrlImagem } from "@/lib/obter-imagem"
import { authClient } from "@/lib/auth-client"
import clsx from "clsx"

export const contaSchema = z.object({
    name: z
        .string()
        .min(2, "Nome deve ter pelo menos 2 caracteres")
        .max(50, "Nome deve ter no máximo 50 caracteres"),
    email: z
        .string()
        .min(1, "Email é obrigatório")
        .email("Email deve ter um formato válido"),
    telefone: z.string().min(1, "Telefone é obrigatório"),
    especialidade: z.string().min(1, "Especialidade é obrigatória"),
    bio: z.string().min(1, "Bio é obrigatória"),
    currentPassword: z
        .string()
        .optional()
        .or(z.literal('')), // Aceita string vazia
    password: z
        .string()
        .optional()
        .or(z.literal('')), // Aceita string vazia
    confirmPassword: z
        .string()
        .optional()
        .or(z.literal('')), // Aceita string vazia
}).refine((data) => {
    // Só valida se pelo menos uma senha foi preenchida
    if (data.password || data.confirmPassword) {
        return data.password === data.confirmPassword;
    }
    return true;
}, {
    message: "Senhas não coincidem",
    path: ["confirmPassword"],
})

export type SignUpFormData = z.infer<typeof contaSchema>

interface FormularioContaProps {
    professor: User
}

export function FormularioConta({ professor }: FormularioContaProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [imagePreview, setImagePreview] = useState<File | null>(null);
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [currentAvatarUrl, setCurrentAvatarUrl] = useState<string | null>(null);
    const { refetch } = authClient.useSession();

    useEffect(() => {
        async function fetchImage() {
            if (professor.image) {
                try {
                    const url = await obterUrlImagem(professor.image);
                    setCurrentAvatarUrl(url);
                } catch (error) {
                    console.error("Erro ao carregar imagem:", error);
                    setCurrentAvatarUrl(null);
                }
            }
        }
        fetchImage();
    }, [professor.image]);

    const form = useForm<SignUpFormData>({
        resolver: zodResolver(contaSchema),
        defaultValues: {
            name: professor.name,
            email: professor.email,
            telefone: professor.telefone || '',
            especialidade: professor.especialidade || '',
            bio: professor.bio || '',
            currentPassword: '', // Mudança: de undefined para string vazia
            password: '', // Mudança: de undefined para string vazia
            confirmPassword: '', // Mudança: de undefined para string vazia
        },
    })

    const handleImageChange = (file: File | undefined) => {
        if (file) {
            setImagePreview(file);
        }
    }

    const onSubmit = async (data: SignUpFormData) => {
        try {

            const resultado = await atualizarContaProfessor(
                professor.id,
                {
                    name: data.name,
                    email: data.email,
                    telefone: data.telefone,
                    especialidade: data.especialidade,
                    bio: data.bio,
                },
                // Envia undefined se string vazia
                data.currentPassword && data.currentPassword.trim() !== '' ? data.currentPassword : undefined,
                data.password && data.password.trim() !== '' ? data.password : undefined
            );
            form.reset();
            toast.success(resultado.message);
            setIsOpen(false);
            refetch();
        } catch (error) {
            toast.error("Erro ao atualizar conta. Tente novamente.");
        }
    };

    function cancelar() {
        setImagePreview(null);
        setIsOpen(false);
        form.reset();
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="secondary">
                    <PencilIcon />
                    <span className="max-sm:hidden">Editar Conta</span>
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="text-center">Editar Conta</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nome</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="João"
                                            {...field}
                                            disabled={form.formState.isSubmitting}
                                            className="bg-background"
                                            required
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>E-mail</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="email"
                                            placeholder="joao@exemplo.com"
                                            {...field}
                                            disabled={form.formState.isSubmitting}
                                            className="bg-background"
                                            required
                                            autoFocus
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="especialidade"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Especialidade</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Matemática"
                                            {...field}
                                            disabled={form.formState.isSubmitting}
                                            className="bg-background"
                                            required
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
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
                        <FormField
                            control={form.control}
                            name='bio'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Bio</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Descreva um pouco sobre você"
                                            {...field}
                                            disabled={form.formState.isSubmitting}
                                            className="bg-background"
                                            required
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Accordion
                            type="single"
                            collapsible
                            className="w-full border-b"
                            defaultValue="item-1"
                        >
                            <AccordionItem value="item-1">
                                <AccordionTrigger>Senha</AccordionTrigger>
                                <AccordionContent className="flex flex-col gap-4 text-balance">
                                    <FormField
                                        control={form.control}
                                        name="currentPassword"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Senha Atual</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Input
                                                            type={showPassword ? "text" : "password"}
                                                            placeholder="Digite sua senha"
                                                            {...field}
                                                            disabled={form.formState.isSubmitting}
                                                            className="bg-background"
                                                            required
                                                            autoFocus
                                                        />
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                            onClick={() => setShowPassword(!showPassword)}
                                                            disabled={form.formState.isSubmitting}
                                                        >
                                                            {showPassword ? (
                                                                <EyeOff className="h-4 w-4" />
                                                            ) : (
                                                                <Eye className="h-4 w-4" />
                                                            )}
                                                        </Button>
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Nova Senha</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Input
                                                            type={showPassword ? "text" : "password"}
                                                            placeholder="Digite sua senha"
                                                            {...field}
                                                            disabled={form.formState.isSubmitting}
                                                            className="bg-background"
                                                            required
                                                            autoFocus
                                                        />
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                            onClick={() => setShowPassword(!showPassword)}
                                                            disabled={form.formState.isSubmitting}
                                                        >
                                                            {showPassword ? (
                                                                <EyeOff className="h-4 w-4" />
                                                            ) : (
                                                                <Eye className="h-4 w-4" />
                                                            )}
                                                        </Button>
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="confirmPassword"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Confirmar Senha</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Input
                                                            type={showConfirmPassword ? "text" : "password"}
                                                            placeholder="Confirme sua senha"
                                                            {...field}
                                                            disabled={form.formState.isSubmitting}
                                                            className="bg-background"
                                                            required
                                                            autoFocus
                                                        />
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                            disabled={form.formState.isSubmitting}
                                                        >
                                                            {showConfirmPassword ? (
                                                                <EyeOff className="h-4 w-4" />
                                                            ) : (
                                                                <Eye className="h-4 w-4" />
                                                            )}
                                                        </Button>
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>

                        <div className="w-full grid grid-cols-2 gap-4 pt-4">
                            <Button
                                type="reset"
                                disabled={form.formState.isSubmitting}
                                variant="ghost"
                                onClick={cancelar}
                                className={clsx(form.formState.isSubmitting ? 'animate-fade-left animate-once hidden' : 'w-full')}
                            >
                                Cancelar
                            </Button>

                            <Button
                                type="submit"
                                className={clsx(form.formState.isSubmitting ? 'animate-width-transition animate-once w-full col-span-2' : 'w-full')}
                                disabled={form.formState.isSubmitting}

                            >
                                {form.formState.isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Salvando
                                    </>
                                ) : (
                                    "Salvar"
                                )}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
