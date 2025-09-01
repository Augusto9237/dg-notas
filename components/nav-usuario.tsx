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
export function NavUsuario() {
    const { data: session } = authClient.useSession();
    const router = useRouter()

    async function sair() {
        await authClient.signOut();
        router.push("/")
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-2 cursor-pointer text-muted">
                    <Avatar className="border-2 border-secondary">
                        <AvatarImage src={session?.user? session.user.image! : "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541"} />
                        <AvatarFallback>DG</AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight ">
                        <span className="truncate font-semibold">{session?.user.name}</span>
                        <span className="truncate text-xs text-muted-foreground">Professor(a)</span>
                    </div>
                    <ChevronDown className="ml-auto size-4" />
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
