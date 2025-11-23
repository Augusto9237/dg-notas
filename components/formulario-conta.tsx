'use client'

import { Eye, EyeOff, Loader2, PencilIcon, X } from "lucide-react"
import { Button } from "./ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"
import { useState } from "react"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form"
import { Input } from "./ui/input"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { useRouter } from "next/navigation"
import { Textarea } from "./ui/textarea"

export const contaSchema = z.object({
    image: z
        .instanceof(File)
        .optional()
        .refine(
            (file) => !file || file.size <= 5 * 1024 * 1024,
            "Imagem deve ter no máximo 5MB"
        )
        .refine(
            (file) => !file || file.type.startsWith("image/"),
            "Arquivo deve ser uma imagem"
        ),
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
        .optional(),
    password: z
        .string()
        .optional(),
    confirmPassword: z
        .string()
        .optional(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Senhas não coincidem",
    path: ["confirmPassword"],
})

export type SignUpFormData = z.infer<typeof contaSchema>

export function FormularioConta() {
    const [isOpen, setIsOpen] = useState(false)
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);


    const form = useForm<SignUpFormData>({
        resolver: zodResolver(contaSchema),
        defaultValues: {
            name: "",
            email: "",
            telefone: "",
            especialidade: "",
            bio: "",
        },
    })

    const handleImageChange = (file: File | undefined) => {
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setImagePreview(reader.result as string)
            }
            reader.readAsDataURL(file)
        } else {
            setImagePreview(null)
        }
    }

    const onSubmit = async (data: SignUpFormData) => {
        try {
            console.log(data)
            // await signUp.email({
            //     email: data.email,
            //     password: data.password,
            //     name: data.name,
            //     image: data.image ? await convertImageToBase64(data.image) : "",
            //     callbackURL: "/",
            //     fetchOptions: {
            //         onResponse: () => {
            //             form.setValue("password", "")
            //             form.setValue("confirmPassword", "")
            //         },
            //         onError: (ctx) => {
            //             toast.error(ctx.error.message)
            //         },
            //         onSuccess: async () => {
            //             toast.success("Conta criada com sucesso! Aguarde a liberação do seu acesso a area do professor")

            //             setTimeout(() => {
            //                 router.push("/")
            //             }, 2000)
            //         }
            //     },
            // })
        } catch (error) {
            toast.error("Erro ao criar conta. Tente novamente.")
        }
    }
    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="secondary">
                    <PencilIcon />
                    Editar Conta
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="text-center">Editar Conta</DialogTitle>
                    <DialogDescription>
                        Faça as suas alterações e clique em salvar para confirmar.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="image"
                            render={({ field: { onChange, value, ...field } }) => (
                                <FormItem>
                                    <FormLabel>Foto de Perfil (opcional)</FormLabel>
                                    <FormControl>
                                        <div className="flex items-center gap-2">
                                            {imagePreview && (
                                                <Avatar className="h-12 w-12 border-2 border-secondary">
                                                    <AvatarImage
                                                        src={imagePreview}
                                                        style={{ objectFit: "cover" }}
                                                    />
                                                    <AvatarFallback className="bg-background text-primary font-medium">
                                                        DG
                                                    </AvatarFallback>
                                                </Avatar>
                                            )}
                                            <div className="flex items-center gap-2 w-full">
                                                <Input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0]
                                                        onChange(file)
                                                        handleImageChange(file)
                                                    }}
                                                    className="w-full bg-background"
                                                    disabled={form.formState.isSubmitting}
                                                />
                                                {imagePreview && (
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => {
                                                            onChange(undefined)
                                                            setImagePreview(null)
                                                        }}
                                                        disabled={form.formState.isSubmitting}
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
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


                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Senha</FormLabel>
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

                        <Button
                            type="submit"
                            className="w-full mt-5"
                            disabled={form.formState.isSubmitting}
                            variant="secondary"
                        >
                            {form.formState.isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Criando conta...
                                </>
                            ) : (
                                "Criar Conta"
                            )}
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}

async function convertImageToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(file)
    })
}