"use client"
import * as React from "react"
import {
  BookOpen,
  Bot,
  Command,
  Frame,
  House,
  LifeBuoy,
  Map,
  PieChart,
  Play,
  Send,
  Settings2,
  SquareTerminal,
} from "lucide-react"
// import { NavMain } from "@/components/nav-main"
// import { NavProjects } from "@/components/nav-projects"
// import { NavSecondary } from "@/components/nav-secondary"
// import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { usePathname } from "next/navigation"
import Link from "next/link"
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Playground",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "History",
          url: "#",
        },
        {
          title: "Starred",
          url: "#",
        },
        {
          title: "Settings",
          url: "#",
        },
      ],
    },
    {
      title: "Models",
      url: "#",
      icon: Bot,
      items: [
        {
          title: "Genesis",
          url: "#",
        },
        {
          title: "Explorer",
          url: "#",
        },
        {
          title: "Quantum",
          url: "#",
        },
      ],
    },
    {
      title: "Documentation",
      url: "#",
      icon: BookOpen,
      items: [
        {
          title: "Introduction",
          url: "#",
        },
        {
          title: "Get Started",
          url: "#",
        },
        {
          title: "Tutorials",
          url: "#",
        },
        {
          title: "Changelog",
          url: "#",
        },
      ],
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "General",
          url: "#",
        },
        {
          title: "Team",
          url: "#",
        },
        {
          title: "Billing",
          url: "#",
        },
        {
          title: "Limits",
          url: "#",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Support",
      url: "#",
      icon: LifeBuoy,
    },
    {
      title: "Feedback",
      url: "#",
      icon: Send,
    },
  ],
  projects: [
    {
      name: "Design Engineering",
      url: "#",
      icon: Frame,
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: PieChart,
    },
    {
      name: "Travel",
      url: "#",
      icon: Map,
    },
  ],
}
export function AppSidebarMembro({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const path = usePathname()

  return (
    <Sidebar
      className="top-[70px] h-[calc(100svh-70px)]! bg-sidebar border-none shadow-none"
      {...props}
    >
      <SidebarContent className="bg-transparent p-5">
        <SidebarMenuButton
          asChild
          className="text-base text-foreground dark:text-foreground hover:text-foreground hover:bg-background/5 active:bg-primary/5 data-[active=true]:bg-background/5 data-[active=true]:text-primary"
          isActive={path === '/membro' ? true : false}
        >
          <Link href="/membro" className="flex gap-2 items-center">
            <House />
            Início
          </Link>
        </SidebarMenuButton>
        <SidebarMenuButton
          asChild
          className="text-base text-foreground dark:text-foreground hover:text-foreground hover:bg-background/5 active:bg-primary/5 data-[active=true]:bg-background/5 data-[active=true]:text-primary"
          isActive={path === '/membro/aulas' ? true : false}
        >
          <Link href="/membro/aulas" className="flex gap-2 items-center">
            <Play />
            Aulas
          </Link>
        </SidebarMenuButton>
      </SidebarContent>
    </Sidebar>
  )
}