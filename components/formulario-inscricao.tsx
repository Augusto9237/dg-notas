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
import Image from "next/image"
import { signUp } from "@/lib/auth-client"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"

export function FormularioInscricao() {
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const router = useRouter()

  const form = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
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

            // Atraso de 5 segundos (5000 ms)
            setTimeout(() => {
              router.push("/")
            }, 2000)
          }
        },
      })
    } catch (error) {
      toast.error("Erro ao criar conta. Tente novamente.")
    }
  }

  return (
    <Card className="bg-primary border-none shadow-none">
      <CardHeader className="justify-center text-center">
        <CardTitle className="text-background">Criar Conta</CardTitle>
        <CardDescription className="text-background/50">
          Crie sua conta de professor
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-background">Nome</FormLabel>
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
                  <FormLabel className="text-background">E-mail</FormLabel>
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
                  <FormLabel className="text-background">Senha</FormLabel>
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
                  <FormLabel className="text-background">Confirmar Senha</FormLabel>
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

            <FormField
              control={form.control}
              name="image"
              render={({ field: { onChange, value, ...field } }) => (
                <FormItem>
                  <FormLabel className="text-background">Foto de Perfil (opcional)</FormLabel>
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
      </CardContent>
    </Card>
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
