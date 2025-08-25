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

import { Button } from "./ui/button"
import { useRouter } from "next/navigation"
export function NavUsuario() {
    // const { data: session } = authClient.useSession();
    const router = useRouter()

    // async function sair() {
    //     await authClient.signOut();
    //     router.push("/")
return (
    <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button
                variant="outline"
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-primary border-0 shadow-none hover:bg-transparent hover:text-primary"
            >
                <Avatar>
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">Danieley Guedes</span>
                    <span className="truncate text-xs">Professor(a)</span>
                </div>
                <ChevronDown className="ml-auto size-4" />
            </Button>
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
                            {/* {session?.user.name} */}
                            Danieley Guedes
                        </span>
                        <span className="truncate text-xs">
                            {/* {session?.user.email} */}
                            email.teste@email.com
                        </span>
                    </div>
                </div>
            </DropdownMenuLabel>
            {/* <DropdownMenuSeparator />
                <Link href="/aluno/assinatura">
                    <DropdownMenuItem>
                        <CreditCard />
                        Assinatura
                    </DropdownMenuItem>
                </Link> */}
            <DropdownMenuSeparator />
            <DropdownMenuItem >
                <LogOut />
                Sair
            </DropdownMenuItem>
        </DropdownMenuContent>
    </DropdownMenu>
)
}
