'use client'
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen } from "lucide-react";
import Image from "next/image";

interface FooterAlunoProps {
    className?: string;
}

export const FooterAluno = ({ className }: FooterAlunoProps) => {
    const pathname = usePathname();

    const routes = [
        {
            icon: <Home className="h-5 w-5" />,
            href: "/aluno",
            label: "Notas",
            active: pathname === "/aluno",
        },
        {
            icon: <BookOpen className="h-5 w-5" />,
            href: "/aluno/mentorias",
            label: "Mentorias",
            active: pathname === "/aluno/mentorias",
        },
    ];

    return (
        <footer className={cn("fixed inset-x-0 bottom-0 z-50", className)}>
            <div className="bg-primary shadow-md">
                <nav className="flex justify-between w-full py-2 px-12 relative">
                    <Image src="/Símbolo4.svg" alt="logo" width={100} height={100} className="absolute -top-4 left-1/2 transform -translate-x-1/2 object-cover w-16 h-16 bg-primary rounded-full p-2"/>
                    {routes.map((route) => (
                        <Link
                            key={route.href}
                            href={route.href}
                            className={cn(
                                "flex flex-col items-center text-xs font-medium transition-colors hover:text-background/50",
                                route.active ? "text-secondary hover:text-secondary/50" : "text-background"
                            )}
                        >
                            <div className="mb-1">{route.icon}</div>
                            {route.label}
                        </Link>
                    ))}
                </nav>
            </div>
        </footer>
    );
};
