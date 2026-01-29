'use client'
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { authClient } from "@/lib/auth-client";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useEffect, useState } from "react";
import { User } from "@/app/generated/prisma";
import { obterProfessorPorId } from "@/actions/admin";
import { obterUrlImagem } from "@/lib/obter-imagem";
import { useIsMobile } from "@/hooks/use-mobile";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { ThemeSwitcher } from "./kibo-ui/theme-switcher";
import { useTheme } from "next-themes";
import Image from "next/image";

export function PerfilAluno() {
    const mobile = useIsMobile()
    const { data: session } = authClient.useSession();
    const [aluno, setAluno] = useState<User | null>(null)
    const { setTheme, theme } = useTheme()

    const router = useRouter()

    useEffect(() => {
        async function fetchAluno() {
            if (session?.user.id) {
                const data = await obterProfessorPorId(session.user.id);
                setAluno(data);
            }
        }
        fetchAluno();
    }, [session?.user.id]);

    async function sair() {
        await authClient.signOut();
        router.push("/");
    }

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Avatar className="size-10 border-2 border-secondary">
                    <Image
                        alt={session?.user.name || "Usuário"}
                        priority={true}
                        width={40}
                        height={40}
                        src={session?.user.image || "/avatar-placeholder.png"}
                    />
                    <AvatarFallback className="bg-background text-primary font-medium">
                        DG
                    </AvatarFallback>
                </Avatar>
            </SheetTrigger>
            <SheetContent className="gap-2 bg-card" side={mobile === true ? 'left' : 'right'}>
                <SheetHeader>
                    <SheetTitle>
                        Sua Conta
                    </SheetTitle>
                </SheetHeader>
                <div>
                    <Avatar className="size-44 border-2 border-secondary mx-auto">
                        <AvatarImage
                            src={session?.user.image || "/avatar-placeholder.png"}
                        />
                        <AvatarFallback className="bg-background text-primary font-medium">
                            {aluno?.name}
                        </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 auto-rows-min gap-4 p-5">
                        <div className="grid">
                            <Label htmlFor="nome">Nome</Label>
                            <p className="text-muted-foreground max-sm:text-sm">{aluno?.name}</p>
                        </div>
                        <div className="grid">
                            <Label htmlFor="email">E-mail</Label>
                            <p className="text-muted-foreground max-sm:text-sm">{aluno?.email}</p>
                        </div>
                        <div className="grid">
                            <Label htmlFor="email">Telefone</Label>
                            <p className="text-muted-foreground max-sm:text-sm">{aluno?.telefone}</p>
                        </div>
                    </div>
                </div>
                <SheetFooter>
                    <div className="w-full items-center text-center justify-center pb-2 min-[1025px]:hidden">
                        <ThemeSwitcher className="w-20 mx-auto" defaultValue="system" onChange={setTheme} value={(theme as "light" | "dark" | "system" | undefined)} />
                    </div>
                    <Button
                        variant='ghost'
                        onClick={sair}
                    >
                        <LogOut />
                        Sair
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}
