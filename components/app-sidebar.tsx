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
import { Lightbulb, Users } from "lucide-react"
import { NavUsuario } from "./nav-usuario"
import { usePathname } from "next/navigation"

import { GiTeamIdea } from "react-icons/gi";

export function AppSidebar() {
  const path = usePathname()

  return (
    <Sidebar className="bg-primary">
      <SidebarHeader>
        <Link href="/" className="w-full pt-1">
          <Logo />
        </Link>
      </SidebarHeader>
      <SidebarContent className="p-4 gap-4">
        <SidebarMenuButton
          asChild
          className="text-base text-muted hover:text-muted font-semibold hover:bg-background/5"
          isActive={path === '/professor/alunos' ? true : false}
        >
          <Link href="/professor/alunos" className="flex gap-2 items-center">
            <Users />
            Alunos
          </Link>
        </SidebarMenuButton>
        <SidebarMenuButton
          asChild
          className="text-base text-muted hover:text-muted font-semibold hover:bg-background/5"
          isActive={path === '/professor/mentorias' ? true : false}
        >
          <Link href="/professor/mentorias " className="flex gap-2 items-center">
            <GiTeamIdea />
            Mentorias
          </Link>
        </SidebarMenuButton>
      </SidebarContent>
      <SidebarFooter className="p-5">
        <NavUsuario />
      </SidebarFooter>
    </Sidebar>
  )
}