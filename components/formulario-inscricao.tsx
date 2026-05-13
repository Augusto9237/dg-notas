"use client"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { signUpSchema, type SignUpFormData } from "@/lib/validations/auth"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Loader2, X, Eye, EyeOff } from "lucide-react"
import { signUp } from "@/lib/auth-client"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"

import { authClient } from "@/lib/auth-client"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"

interface FormularioInscricaoProps {
  isDialog?: boolean;
  onSuccessCallback?: () => void;
  role?: "user" | "admin";
}

export function FormularioInscricao({ isDialog, onSuccessCallback, role }: FormularioInscricaoProps = {}) {
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const router = useRouter()

  const form = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "",
      password: "",
      confirmPassword: "",
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
      if (isDialog && role) {
        // Quando está criando de dentro do painel de admin, o método ideal do better-auth plugin admin é admin.createUser
        await authClient.admin.createUser({
          email: data.email,
          password: data.password,
          name: data.name,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          role: data.role as any,
          fetchOptions: {
            onResponse: () => {
              form.setValue("password", "")
              form.setValue("confirmPassword", "")
            },
            onError: (ctx) => {
              toast.error(ctx.error.message)
            },
            onSuccess: async () => {
              toast.success("Usuário criado com sucesso!")
              if (onSuccessCallback) {
                onSuccessCallback()
              }
            }
          }
        })
      } else {
        await signUp.email({
          email: data.email,
          password: data.password,
          name: data.name,
          image: data.image ? await convertImageToBase64(data.image) : "",
          callbackURL: "/",
          fetchOptions: {
            onResponse: () => {
              form.setValue("password", "")
              form.setValue("confirmPassword", "")
            },
            onError: (ctx) => {
              toast.error(ctx.error.message)
            },
            onSuccess: async () => {
              toast.success("Conta criada com sucesso! Aguarde a liberação do seu acesso a area do professor")
              if (!isDialog) {
                setTimeout(() => {
                  router.push("/")
                }, 2000)
              }
            }
          },
        })
      }
    } catch (error) {
      toast.error("Erro ao criar conta. Tente novamente.")
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
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={form.formState.isSubmitting}
              >
                <SelectTrigger className="bg-background w-full">
                  <SelectValue placeholder="Selecione a função" />
                </SelectTrigger>
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
        <div className="grid grid-cols-2 gap-4 pt-4">
          <Button
            type="button"
            variant='ghost'
            onClick={() => {
              form.reset()
              onSuccessCallback && onSuccessCallback()
            }}

          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? "Salvando..." : "Salvar"}
          </Button>
        </div>

      </form>
    </Form>
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
