'use client'
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { signUpSchema, type SignUpFormData } from "@/lib/validations/auth"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Loader2, Eye, EyeOff } from "lucide-react"
import { signUp } from "@/lib/auth-client"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

import { authClient } from "@/lib/auth-client"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { User } from "@/app/generated/prisma"
import { z } from "zod"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion"
import { atualizarContaProfessor } from "@/actions/admin"

interface FormularioInscricaoProps {
  isDialog?: boolean;
  onSuccessCallback?: () => void;
  role?: "user" | "admin";
  user?: User;
}


// Tipo unificado para o formulário que acomoda ambos os schemas
type FormValues = z.infer<typeof signUpSchema>;

export function FormularioInscricao({ isDialog, onSuccessCallback, role, user }: FormularioInscricaoProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const router = useRouter()
  const isEditMode = !!user;

  const form = useForm<FormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "",
      password: "",
      confirmPassword: "",
    },
  })

  useEffect(() => {
    if (isEditMode && user) {
      form.reset({
        name: user.name || "",
        email: user.email || "",
        role: user.role || "",
        password: "",
        confirmPassword: "",
      })
    }
  }, [isEditMode, user, form])

  const onSubmit = async (data: FormValues) => {
    try {
      if (isEditMode && user) {
        // Modo de Edição
        const result = await atualizarContaProfessor(
          user.id,
          {
            name: data.name,
            email: data.email,
            telefone: user.telefone || '' ,
            especialidade: user.especialidade || '' ,
            bio: user.bio || '' ,
          },
          data.password
        );

        if (result.success) {
          toast.success(result.message);
          if (onSuccessCallback) {
            onSuccessCallback();
          }
        } else {
          toast.error(result.message);
        }

      } else {
        // Modo de Criação: a validação do signUpSchema garante que a senha existe
        if (!data.password) {
            toast.error("Senha é obrigatória.");
            return;
        }

        if (isDialog && role) {
          await authClient.admin.createUser({
            email: data.email,
            password: data.password,
            name: data.name,
            role: data.role as any,
            fetchOptions: {
              onResponse: () => form.reset(),
              onError: (ctx) => { toast.error(ctx.error.message) },
              onSuccess: async () => {
                toast.success("Usuário criado com sucesso!")
                if (onSuccessCallback) onSuccessCallback()
              }
            }
          })
        } else {
          await signUp.email({
            email: data.email,
            password: data.password,
            name: data.name,
            callbackURL: "/",
            fetchOptions: {
                onResponse: () => form.reset(),
                onError: (ctx) => { toast.error(ctx.error.message) },
                onSuccess: async () => {
                toast.success("Conta criada com sucesso! Aguarde a liberação do seu acesso.")
                if (!isDialog) {
                  setTimeout(() => router.push("/"), 2000)
                }
              }
            },
          })
        }
      }
    } catch (error) {
      toast.error("Ocorreu um erro. Tente novamente.")
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel >Função</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={user?.role || ''} disabled={form.formState.isSubmitting}>
                <FormControl>
                  <SelectTrigger className="bg-background w-full">
                    <SelectValue placeholder="Selecione a função" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="assistente">Assistente</SelectItem>
                  <SelectItem value="professor">Professor</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel >Nome</FormLabel>
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
              <FormLabel >E-mail</FormLabel>
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

        {isEditMode ? (
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>Alterar Senha</AccordionTrigger>
              <AccordionContent className="flex flex-col gap-4 text-balance pt-4">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nova Senha</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} placeholder="••••••••" disabled={form.formState.isSubmitting} />
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
                      <FormLabel>Confirmar Nova Senha</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} placeholder="••••••••" disabled={form.formState.isSubmitting} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        ) : (
          <>
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel >Senha</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Digite sua senha"
                        {...field}
                        disabled={form.formState.isSubmitting}
                        className="bg-background"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={form.formState.isSubmitting}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
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
                  <FormLabel >Confirmar Senha</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirme sua senha"
                        {...field}
                        disabled={form.formState.isSubmitting}
                        className="bg-background"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        disabled={form.formState.isSubmitting}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        <div className="grid grid-cols-2 gap-4 pt-4">
          <Button
            type="button"
            variant='ghost'
            onClick={() => {
              form.reset()
              if (onSuccessCallback) onSuccessCallback()
            }}
            disabled={form.formState.isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...</>
            ) : (
              isEditMode ? "Salvar Alterações" : "Criar Usuário"
            )}
          </Button>
        </div>

      </form>
    </Form>
  )
}
