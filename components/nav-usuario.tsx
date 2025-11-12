"use client"
import {
    ChevronDown,
    LogOut,
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
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import { Skeleton } from "./ui/skeleton"
import { useEffect, useState } from "react"

export function NavUsuario() {
    const [isClient, setIsClient] = useState(false)
    const { data: session, isPending } = authClient.useSession();
    const router = useRouter()

    useEffect(() => {
        setIsClient(true)
    }, [])

    async function sair() {
        await authClient.signOut();
        router.push("/")
    }

    if (!isClient || isPending) {
        return (
            <div className="flex items-center gap-2 cursor-pointer text-muted">
                <Skeleton className="size-8 rounded-full" />
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
                    <Avatar className="border-2 border-secondary">
                        <AvatarImage src={session?.user ? session.user.image! : "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541"} className="object-cover" />
                        <AvatarFallback>DG</AvatarFallback>
                    </Avatar>

                    <div className="grid flex-1 text-left text-sm leading-tight">
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
                <DropdownMenuLabel className="font-normal text-primary">
                    <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-semibold">
                            {session?.user.name}
                        </span>
                        <span className="truncate text-xs">
                            {session?.user.email}
                        </span>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={sair} className="text-primary hover:text-primary">
                    <LogOut className="stroke-primary" />
                    Sair
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
