'use client'
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname, } from "next/navigation";
import { FileCheck2, LayoutGrid, MonitorPlay } from "lucide-react";
import Image from "next/image";
import { Card } from "./card";
import { RiUserStarLine } from "react-icons/ri";

interface FooterAlunoProps {
    className?: string;
}

export const FooterAluno = ({ className }: FooterAlunoProps) => {
    const pathname = usePathname();

    const routes = [
        {
            icon: <LayoutGrid className="h-5 w-5" />,
            href: "/aluno",
            label: "Home",
            active: pathname === "/aluno",
        },
        {
            icon: <FileCheck2 className="h-5 w-5" />,
            href: "/aluno/avaliacoes",
            label: "Avaliações",
            active: pathname === "/aluno/avaliacoes",
        },
        {
            icon: <Image src="/Símbolo4.svg" alt="logo" width={50} height={50} className="min-size-14.5 size-14.5 bg-primary -mt-10  rounded-full p-2 border border-4 shadow-lg shadow-primary/45 border-card" />,
            href: "/aluno/#",
            label: "",
            active: pathname === "/aluno/#",
        },
        {
            icon: <MonitorPlay className="h-5 w-5" />,
            href: "/aluno/aulas/1",
            label: "Aulas",
            active: pathname.includes("/aluno/aulas"),
        },
        {
            icon: <RiUserStarLine className="h-5 w-5" />,
            href: "/aluno/mentorias",
            label: "Mentorias",
            active: pathname === "/aluno/mentorias",
        },
    ];

    return (
        <footer className={cn("fixed inset-x-0 bottom-0 min-[1025px]:hidden", className)}>
            <Card className="p-0 bg-card rounded-t-xl rounded-b-none">
                <nav className="flex justify-between gap-1 w-full px-5 items-center">
                    {routes.map((route) => (
                        <Link
                            key={route.href}
                            href={route.href}
                            className={cn(
                                "flex flex-col py-2 items-center text-xs text-muted-foreground font-medium transition-colors border-b-3",
                                route.active ? "border-primary text-primary " : "border-card/0"
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
