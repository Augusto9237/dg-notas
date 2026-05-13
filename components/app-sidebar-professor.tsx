'use client'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenuButton,
} from "@/components/ui/sidebar"
import Link from "next/link"
import { FileChartLine } from "lucide-react"
import { NavUsuario } from "./nav-usuario"
import { usePathname } from "next/navigation"
import { RiUserStarLine } from "react-icons/ri";
import { MdOutlineDashboardCustomize } from "react-icons/md";
import { useTheme } from "next-themes"
import { ThemeSwitcher } from "./kibo-ui/theme-switcher"
import Image from "next/image"

export function AppSidebarProfessor({ logo }: { logo: string }) {
  const path = usePathname()
  const { setTheme, theme } = useTheme()

  return (
    <Sidebar className="bg-primary border-none">
      <SidebarHeader className="max-h-16">
        <Link href="/professor" className="w-full">
          <Image
            src={logo}
            alt="Logo"
            width={224}
            height={56}
            priority
            className='w-56 h-14 object-cover'
          />
        </Link>
      </SidebarHeader>
      <SidebarContent className="p-4 gap-4">
        <SidebarMenuButton
          asChild
          className="text-base text-muted dark:text-foreground hover:text-muted font-semibold hover:bg-background/5"
          isActive={path === '/professor'}
        >

          <Link href="/professor" className="flex gap-2 items-center">
            <MdOutlineDashboardCustomize />
            Início
          </Link>
        </SidebarMenuButton>

        <SidebarMenuButton
          asChild
          className="text-base text-muted dark:text-foreground hover:text-muted font-semibold hover:bg-background/5"
          isActive={path === '/professor/avaliacoes'}
        >
          <Link href="/professor/avaliacoes" className="flex gap-2 items-center">
            <FileChartLine />
            Avaliações
          </Link>
        </SidebarMenuButton>

        <SidebarMenuButton
          asChild
          className="text-base text-muted dark:text-foreground hover:text-muted font-semibold hover:bg-background/5"
          isActive={path === '/professor/mentorias'}
        >
          <Link href="/professor/mentorias " className="flex gap-2 items-center">
            <RiUserStarLine />
            Mentorias
          </Link>
        </SidebarMenuButton>
      </SidebarContent>
      <SidebarFooter className="p-5">
        <div className="w-full items-center text-center justify-center pb-2 max-[1025px]:hidden">
          <ThemeSwitcher className="w-20 mx-auto" defaultValue="system" onChange={setTheme} value={(theme as "light" | "dark" | "system" | undefined)} />
        </div>
        <NavUsuario role="professor" />
      </SidebarFooter>
    </Sidebar>
  )
}