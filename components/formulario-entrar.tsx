'use client'
import { cn } from "@/lib/utils"
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
import { authClient } from "@/lib/auth-client"
import Link from "next/link"

export function FormularioEntrar() {
  async function entrarComGoogle() {
    await authClient.signIn.social({
      provider: 'google',
      callbackURL: '/aluno'
    },
    )
  };

  return (
    <div className="flex w-full  flex-col gap-6">
      <Tabs defaultValue="aluno">
        <TabsList className="W-full bg-primary px-5">
          <TabsTrigger value="aluno" className="">
            <PiStudentFill />
            Aluno(a)
          </TabsTrigger>
          <TabsTrigger value="professor">
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
                Login com Google
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
              <div className="grid gap-2 text-background">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" type="email" placeholder="professor@email.com" required className="bg-background" />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center text-background">
                  <Label htmlFor="password">Senha</Label>
                </div>
                <div>
                  <Input id="password" type="password" required className="bg-background" />
                  <Button
                    variant="link" className="text-xs text-background px-0"
                  >
                    Esqueci minha senha
                  </Button>
                </div>

              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button
                type="submit"
                className="w-full"
                variant="secondary"
              >
                Entrar
              </Button>
              <span className="text-card text-sm">Ainda não possui conta? <Link href="/inscricao" className="underline underline-offset-4 text-secondary ml-1"> Criar conta</Link></span>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  return (
    <form className={cn("flex flex-col gap-6 w-full", className)} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-lg font-bold text-background">Entre na sua conta</h1>
        {/* <p className="text-muted-foreground text-sm text-balance">
          Enter your email below to login to your account
        </p> */}
      </div>
      <div className="grid gap-6">

        {/* <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
          <span className="bg-background text-muted-foreground relative z-10 px-2">
            Or continue with
          </span>
        </div> */}
        <Button variant="secondary" className="w-full">
          <FcGoogle />
          Login com Google
        </Button>
      </div>
      <div className="text-center text-sm">
        Don&apos;t have an account?{" "}
        <a href="#" className="underline underline-offset-4">
          Sign up
        </a>
      </div>
    </form>
  )
}
