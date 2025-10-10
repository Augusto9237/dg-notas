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
import { Users } from "lucide-react"
import { NavUsuario } from "./nav-usuario"
import { usePathname } from "next/navigation"
import { RiUserStarFill } from "react-icons/ri";

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
          isActive={path === '/professor' ? true : false}
        >
          <Link href="/professor" className="flex gap-2 items-center">
            <Users />
            Alunos
          </Link>
        </SidebarMenuButton>
        
        <SidebarMenuButton
          asChild
          className="text-base text-muted hover:text-muted font-semibold hover:bg-background/5"
          isActive={path === '/professor/temas' ? true : false}
        >
          <Link href="/professor/temas" className="flex gap-2 items-center">
            <Users />
            Temas
          </Link>
        </SidebarMenuButton>

        <SidebarMenuButton
          asChild
          className="text-base text-muted hover:text-muted font-semibold hover:bg-background/5"
          isActive={path === '/professor/mentorias' ? true : false}
        >
          <Link href="/professor/mentorias " className="flex gap-2 items-center">
            <RiUserStarFill />
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