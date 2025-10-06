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
import { Loader2} from "lucide-react"
import { authClient} from "@/lib/auth-client"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import z from "zod"

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Email é obrigatório")
    .email("Email deve ter um formato válido"),
})

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

export function FormularioEsqueceuSenha() {
  const router = useRouter()

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  })


  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      await authClient.forgetPassword({
        email: data.email,
        redirectTo: "/nova-senha"
      })
      toast.success("Redefinição de senha foi enviada para o seu e-mail")
    } catch (error) {
      toast.error("Erro! Tente novamente.")
    }
  }

  return (
    <Card className="bg-primary border-none shadow-none w-full">
      <CardHeader className="justify-center text-center">
        <CardTitle className="text-background">Esqueceu a senha</CardTitle>
        <CardDescription className="text-background/50">
          Digite seu e-mail
        </CardDescription>
      </CardHeader>
      <CardContent>
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

            <Button
              type="submit"
              className="w-full mt-5"
              disabled={form.formState.isSubmitting}
              variant="secondary"
            >
              {form.formState.isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando
                </>
              ) : (
                "Enviar"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}