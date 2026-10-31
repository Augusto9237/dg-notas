'use client'
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname, } from "next/navigation";
import { FileCheck2, LayoutGrid, MonitorPlay, TrendingUp } from "lucide-react";
import Image from "next/image";
import { Card } from "./card";
import { RiUserStarLine } from "react-icons/ri";

interface FooterAlunoProps {
    className?: string;
    logo: string;
}

export function FooterMembro({ className, logo }: FooterAlunoProps) {
    const pathname = usePathname();

    const routes = [
        {
            icon: <LayoutGrid className="h-5 w-5" />,
            href: "/membro",
            label: "Inicio",
            active: pathname === "/membro",
        },
        {
            icon: <TrendingUp className="h-5 w-5" />,
            href: "/aluno/avaliacoes",
            label: "Avaliações",
            active: pathname === "/aluno/avaliacoes",
        },
        {
            icon: <Image src={logo} alt="logo" width={50} height={50} className="min-size-14.5 size-14.5 bg-primary  rounded-full -mt-[9px] -mb-1.5 p-2 border-4 shadow-md dark:shadow-background border-card" />,
            href: "/membro",
            label: "",
        },
        {
            icon: <MonitorPlay className="h-5 w-5" />,
            href: "/membro/aulas",
            label: "Aulas",
            active: pathname === "/membro/aulas",
        },
        {
            icon: <RiUserStarLine className="h-5 w-5" />,
            href: "/membro/suporte",
            label: "Suporte",
            active: pathname === "/membro/suporte",
        },
    ];

    return (
        <footer className={cn("fixed inset-x-0 bottom-0 min-[1025px]:hidden px-5 pb-2", className)}>
            <Card className="p-0 bg-card rounded-xl border-none relative">
                <nav className="flex justify-between gap-2 w-full px-5 items-center ">
                    {routes.map((route) => (
                        <Link
                            key={route.href}
                            href={route.href}
                            className={cn(
                                "flex flex-col pt-2 pb-1 items-center text-xs text-muted-foreground font-medium transition-colors border-b-3",
                                route.active ? "border-primary text-primary" : "border-card/0"
                            )}
                        >
                            <div className="mt-[1px]">{route.icon}</div>
                            {route.label}
                        </Link>
                    ))}
                </nav>
            </Card>
        </footer>
    );
};
