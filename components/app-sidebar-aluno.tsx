'use client'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenuButton,
} from "@/components/ui/sidebar"
import Link from "next/link"
import { FileChartLine, MonitorPlay } from "lucide-react"
import { usePathname } from "next/navigation"
import { RiUserStarLine } from "react-icons/ri";
import { MdOutlineDashboardCustomize } from "react-icons/md";
import { useTheme } from "next-themes"
import { ThemeSwitcher } from "./kibo-ui/theme-switcher"
import Image from "next/image"

export function AppSidebarAluno({ logo }: { logo: string }) {
  const { setTheme, theme } = useTheme()
  const path = usePathname()

  return (
    <Sidebar className="bg-primary border-none">
      <SidebarHeader className="max-h-16">
        <Link href="/aluno" className="w-full">
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
          isActive={path === '/aluno' ? true : false}
        >

          <Link href="/aluno" prefetch className="flex gap-2 items-center">
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
          isActive={path.includes("/aluno/aulas") ? true : false}
        >
          <Link href="/aluno/aulas/1" className="flex gap-2 items-center">
            <MonitorPlay />
            Aulas
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