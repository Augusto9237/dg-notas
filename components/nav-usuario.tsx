"use client"
import {
    ChevronDown,
    LogOut,
    UserCog,
} from "lucide-react"
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import { Skeleton } from "./ui/skeleton"
import { useEffect, useState } from "react"
import { obterUrlImagem } from "@/lib/obter-imagem";
import Image from "next/image"
import { Switch } from "./ui/switch"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Sub } from "@radix-ui/react-dropdown-menu"

export function NavUsuario() {
    const [isClient, setIsClient] = useState(false)
    const { data: session, isPending } = authClient.useSession();
    const [avatarImagem, setAvatarImagem] = useState<string | null>(null);
    const { setTheme, theme } = useTheme()

    const router = useRouter()

    useEffect(() => {
        setIsClient(true)
    }, [])

    useEffect(() => {
        async function fetchImage() {
            if (session?.user?.image) {
                try {
                    const url = await obterUrlImagem(session.user.image);
                    setAvatarImagem(url);
                } catch (error) {
                    console.error("Erro ao carregar imagem:", error);
                    setAvatarImagem(null);
                }
            }
        }
        fetchImage();
    }, [session])

    async function sair() {
        await authClient.signOut();
        router.push("/")
    }

    if (!isClient || isPending) {
        return (
            <div className="flex items-center gap-2 cursor-pointer text-muted">
                <Skeleton className="size-10 rounded-full" />
                <div className="grid flex-1 text-left text-sm gap-y-1">
                    <Skeleton className="w-full h-[1rem]" />
                    <Skeleton className="w-full h-[0.75rem]" />
                </div>
            </div>
        )
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-2 cursor-pointer text-muted">
                    <Avatar className="border-2 border-secondary size-10">
                        {avatarImagem ? (
                            <Image alt={session?.user.name || ''} src={avatarImagem} height={60} width={60} className="object-cover" />
                        ) : (
                            <Skeleton className="size-full" />
                        )}
                    </Avatar>

                    <div className="grid flex-1 text-left text-sm leading-tight gap-1">
                        <span className="truncate font-semibold">{session?.user.name}</span>
                        <span className="truncate text-xs text-muted">Administrador(a)</span>
                    </div>
                    <ChevronDown className="ml-auto size-4" />
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-54 rounded-lg text-primary"
                align="start"
                sideOffset={4}
            >
                <div className="text-primary dark:text-foreground flex gap-2 w-full items-center hover:text-primary text-sm px-2 py-1.5">
                    <Moon size={16} />
                    <Switch
                        checked={theme === 'light' ? true : false}
                        onCheckedChange={(checked) => setTheme(checked === true ? "light" : "dark")}
                    />
                    <Sun size={16} />
                </div>

                <DropdownMenuItem onClick={() => router.push("/professor/conta")} className="text-primary dark:text-foreground hover:text-primary">
                    <UserCog className="stroke-primary dark:stroke-foreground" />
                    Sua conta
                </DropdownMenuItem>

                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={sair} className="text-primary dark:text-foreground hover:text-primary">
                    <LogOut className="stroke-primary dark:stroke-foreground" />
                    Sair
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
