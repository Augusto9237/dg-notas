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
export function NavUsuario() {
    const { data: session, isPending } = authClient.useSession();
    const router = useRouter()

    async function sair() {
        await authClient.signOut();
        router.push("/")
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-2 cursor-pointer text-muted">
                    {isPending === true ?
                        <>
                            <Skeleton className="size-8 rounded-full" />
                            <div className="grid flex-1 text-left text-sm gap-y-1">
                                <Skeleton className="w-full h-[1rem]" />
                                <Skeleton className="w-full h-[0.75rem]" />
                            </div>
                        </>
                        :
                        <>
                            <Avatar className="border-2 border-secondary">
                                <AvatarImage src={session?.user ? session.user.image! : "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541"}  className="object-cover"/>
                                <AvatarFallback>DG</AvatarFallback>
                            </Avatar>

                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-semibold">{session?.user.name}</span>
                                <span className="truncate text-xs text-muted-foreground">Professor(a)</span>
                            </div>
                        </>
                    }
                    {!isPending && <ChevronDown className="ml-auto size-4" />}
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-54 rounded-lg"
                align="start"
                sideOffset={4}
            >
                <DropdownMenuLabel className="p-0 font-normal">
                    <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                        <div className="grid flex-1 text-left text-sm leading-tight px-1">
                            <span className="truncate font-semibold">
                                {session?.user.name}
                            </span>
                            <span className="truncate text-xs">
                                {session?.user.email}
                            </span>
                        </div>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={sair} >
                    <LogOut />
                    Sair
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
