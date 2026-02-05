'use client'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FcGoogle } from "react-icons/fc";
import { PiStudentFill, PiChalkboardTeacherFill } from "react-icons/pi";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { signInSchema, type SignInFormData } from "@/lib/validations/auth"

import { authClient } from "@/lib/auth-client"
import Link from "next/link"
import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function FormularioEntrar() {
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  const form = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function entrarComGoogle() {
    await authClient.signIn.social({
      provider: 'google',
      callbackURL: '/aluno'
    },
    )
  };

  const onSubmit = async (data: SignInFormData) => {
    try {
      await authClient.signIn.email({
        email: data.email,
        password: data.password,
        callbackURL: "/professor",
        fetchOptions: {
          onResponse: () => {
            form.setValue("password", "")
          },
          onError: (ctx) => {
            toast.error('E-mail ou senha incorretos, tente novamente!')
            console.error("Erro ao entrar:", ctx.error.message)
          },
          onSuccess: async () => {
            toast.success("Autenticação efetuada com sucesso!")
            router.push("/professor")
          }
        },
      })
    } catch (error) {
      toast.error("Erro ao fazer login. Tente novamente.")
      console.error("Erro ao entrar com email:", error)
    }
  }

  return (
    <Tabs defaultValue="aluno" className="w-full mt-5">
      <TabsList className="W-full bg-primary px-5">
        <TabsTrigger value="aluno" className="text-card/50 data-[state=active]:text-card">
          <PiStudentFill />
          Aluno(a)
        </TabsTrigger>
        <TabsTrigger value="professor" className="text-card/50 data-[state=active]:text-card">
          <PiChalkboardTeacherFill />
          Professor(a)
        </TabsTrigger>
      </TabsList>

      {/* Login aluno */}
      <TabsContent value="aluno">
        <Card className="h-[346px] bg-primary border-none shadow-none">
          <CardHeader className="justify-center text-center">
            <CardTitle className="text-background">Aluno(a)</CardTitle>
            <CardDescription className="text-background/50">
              Acesse sua conta de aluno
            </CardDescription>
          </CardHeader>
          <CardContent className="px-5 pt-5">
            <Button
              variant="secondary"
              className="w-full"
              onClick={entrarComGoogle}
            >
              <FcGoogle />
              Continuar com Google
            </Button>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Login professor */}
      <TabsContent value="professor">
        <Card className="h-[346px] bg-primary border-none shadow-none gap-5">
          <CardHeader className="justify-center text-center">
            <CardTitle className="text-background">Professor(a)</CardTitle>
            <CardDescription className="text-background/50">
              Entre na sua conta de professor
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                      <div className="flex items-center justify-between">
                        <FormLabel className="text-background">Senha</FormLabel>

                        <Link href='/esqueceu-senha' className="text-background/70 text-xs">Esqueci a senha</Link>
                      </div>
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

                <Button
                  type="submit"
                  className="w-full mt-5"
                  disabled={form.formState.isSubmitting}
                  variant="secondary"
                >
                  {form.formState.isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Entrando
                    </>
                  ) : (
                    "Entrar"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
