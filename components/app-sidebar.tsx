'use client'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import Link from "next/link"
import { Logo } from "./ui/logo"
import { Users } from "lucide-react"

export function AppSidebar() {
  return (
    <Sidebar className="bg-primary">
      <SidebarHeader>
        <Link href="/" className="w-full">
          <Logo />
        </Link>
      </SidebarHeader>
      <SidebarContent className="p-4">
        <SidebarMenuButton asChild className="text-base text-muted hover:text-muted font-semibold hover:bg-background/5 ">
          <Link href="/" className="flex gap-2 items-center">
            <Users/>
            Alunos
          </Link>
        </SidebarMenuButton>
         <SidebarMenuButton asChild className="text-base text-muted hover:text-muted font-semibold hover:bg-background/5 ">
          <Link href="/mentorias " className="flex gap-2 items-center">
            <Users/>
            Mentorias
          </Link>
        </SidebarMenuButton>
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  )
}