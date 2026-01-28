'use client'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenuButton,
} from "@/components/ui/sidebar"
import Link from "next/link"
import { Logo } from "./ui/logo"
import { FileChartLine, LogOut, Moon, Sun, Users } from "lucide-react"
import { NavUsuario } from "./nav-usuario"
import { usePathname } from "next/navigation"
import { RiUserStarLine } from "react-icons/ri";
import { MdOutlineDashboardCustomize } from "react-icons/md";
import { Skeleton } from "./ui/skeleton"
import { authClient } from "@/lib/auth-client"
import { Button } from "./ui/button"
import { Switch } from "./ui/switch"
import { useTheme } from "next-themes"
import { ThemeSwitcher } from "./kibo-ui/theme-switcher"

export function AppSidebarAluno() {
  const { data: session, isPending } = authClient.useSession();
  const { setTheme, theme } = useTheme()
  const path = usePathname()

  return (
    <Sidebar className="bg-primary border-none">
      <SidebarHeader className="max-h-16">
        <Link href="/aluno" className="w-full">
          <Logo />
        </Link>
      </SidebarHeader>
      <SidebarContent className="p-4 gap-4">
        <SidebarMenuButton
          asChild
          className="text-base text-muted dark:text-foreground hover:text-muted font-semibold hover:bg-background/5"
          isActive={path === '/aluno' ? true : false}
        >

          <Link href="/aluno" className="flex gap-2 items-center">
            <MdOutlineDashboardCustomize />
            Início
          </Link>
        </SidebarMenuButton>


        <SidebarMenuButton
          asChild
          className="text-base text-muted dark:text-foreground hover:text-muted font-semibold hover:bg-background/5"
          isActive={path === '/aluno/avaliacoes' ? true : false}
        >
          <Link href="/aluno/avaliacoes" className="flex gap-2 items-center">
            <FileChartLine />
            Avaliações
          </Link>
        </SidebarMenuButton>

        <SidebarMenuButton
          asChild
          className="text-base text-muted dark:text-foreground hover:text-muted font-semibold hover:bg-background/5"
          isActive={path === '/aluno/mentorias' ? true : false}
        >
          <Link href="/aluno/mentorias " className="flex gap-2 items-center">
            <RiUserStarLine />
            Mentorias
          </Link>
        </SidebarMenuButton>
      </SidebarContent>
      <SidebarFooter className="p-5">
        <div className="w-full items-center text-center justify-center pb-2 max-[1025px]:hidden">
          <ThemeSwitcher className="w-20 mx-auto" defaultValue="system" onChange={setTheme} value={(theme as "light" | "dark" | "system" | undefined)} />
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}