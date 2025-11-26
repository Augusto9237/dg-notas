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

export function NavUsuario() {
    const [isClient, setIsClient] = useState(false)
    const { data: session, isPending } = authClient.useSession();
    const [avatarImagem, setAvatarImagem] = useState<string | null>(null);

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
                        <AvatarImage src={avatarImagem ? avatarImagem : "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541"} className="object-cover" />
                        <AvatarFallback>DG</AvatarFallback>
                    </Avatar>

                    <div className="grid flex-1 text-left text-sm leading-tight gap-1">
                        <span className="truncate font-semibold">{session?.user.name}</span>
                        <span className="truncate text-xs text-muted">Professor(a)</span>
                    </div>
                    <ChevronDown className="ml-auto size-4" />
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-54 rounded-lg text-primary"
                align="start"
                sideOffset={4}
            >
                <DropdownMenuItem onClick={() => router.push("/professor/conta")} className="text-primary hover:text-primary">
                    <UserCog className="stroke-primary" />
                    Sua conta
                </DropdownMenuItem>

                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={sair} className="text-primary hover:text-primary">
                    <LogOut className="stroke-primary" />
                    Sair
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
