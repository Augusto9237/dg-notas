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
import { FileChartLine, FileType, Users } from "lucide-react"
import { NavUsuario } from "./nav-usuario"
import { usePathname } from "next/navigation"
import { RiUserStarLine } from "react-icons/ri";
import { MdOutlineDashboardCustomize } from "react-icons/md";
import { Switch } from "./ui/switch"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export function AppSidebar() {
  const path = usePathname()
  const { setTheme, theme } = useTheme()

  return (
    <Sidebar className="bg-primary border-none">
      <SidebarHeader className="max-h-16">
        <Link href="/professor" className="w-full">
          <Logo />
        </Link>
      </SidebarHeader>
      <SidebarContent className="p-4 gap-4">
        <SidebarMenuButton
          asChild
          className="text-base text-muted dark:text-foreground hover:text-muted font-semibold hover:bg-background/5"
          isActive={path === '/professor' ? true : false}
        >

          <Link href="/professor" className="flex gap-2 items-center">
            <MdOutlineDashboardCustomize />
            Início
          </Link>
        </SidebarMenuButton>

        <SidebarMenuButton
          asChild
          className="text-base text-muted dark:text-foreground hover:text-muted font-semibold hover:bg-background/5"
          isActive={path === '/professor/alunos' ? true : false}
        >

          <Link href="/professor/alunos" className="flex gap-2 items-center">
            <Users />
            Alunos
          </Link>
        </SidebarMenuButton>

        <SidebarMenuButton
          asChild
          className="text-base text-muted dark:text-foreground hover:text-muted font-semibold hover:bg-background/5"
          isActive={path === '/professor/avaliacoes' ? true : false}
        >
          <Link href="/professor/avaliacoes" className="flex gap-2 items-center">
            <FileChartLine />
            Avaliações
          </Link>
        </SidebarMenuButton>

        <SidebarMenuButton
          asChild
          className="text-base text-muted dark:text-foreground hover:text-muted font-semibold hover:bg-background/5"
          isActive={path === '/professor/mentorias' ? true : false}
        >
          <Link href="/professor/mentorias " className="flex gap-2 items-center">
            <RiUserStarLine />
            Mentorias
          </Link>
        </SidebarMenuButton>
      </SidebarContent>
      <SidebarFooter className="p-5">
        <div className="text-card dark:text-foreground flex gap-2 w-full items-center justify-center text-sm p-2">
          <Moon size={16} />
          <Switch
            checked={theme === 'light' ? true : false}
            onCheckedChange={(checked) => setTheme(checked === true ? "light" : "dark")}
            className="data-[state=checked]:bg-background/50"
          />
          <Sun size={16} />
        </div>
        <NavUsuario />
      </SidebarFooter>
    </Sidebar>
  )
}