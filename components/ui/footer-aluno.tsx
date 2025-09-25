'use client'
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, FileCheck2 } from "lucide-react";
import Image from "next/image";
import { Card } from "./card";
import { RiUserStarFill } from "react-icons/ri";

interface FooterAlunoProps {
    className?: string;
}

export const FooterAluno = ({ className }: FooterAlunoProps) => {
    const pathname = usePathname();

    const routes = [
        {
            icon: <FileCheck2 className="h-5 w-5" />,
            href: "/aluno",
            label: "Avaliações",
            active: pathname === "/aluno",
        },
        {
            icon: <RiUserStarFill className="h-5 w-5" />,
            href: "/aluno/mentorias",
            label: "Mentorias",
            active: pathname === "/aluno/mentorias",
        },
    ];

    return (
        <footer className={cn("fixed inset-x-0 bottom-0 px-2 pb-2", className)}>
            <Card className="backdrop-blur-lg p-0 border-none bg-card/70">
                <nav className="flex justify-between w-full px-5 relative">
                    <Image src="/Símbolo4.svg" alt="logo" width={100} height={100} className="absolute top-0 left-1/2 transform -translate-x-1/2 object-cover w-14 h-14 bg-primary rounded-full p-2 border border-secondary" />
                    {routes.map((route) => (
                        <Link
                            key={route.href}
                            href={route.href}
                            className={cn(
                                "flex flex-col p-2 items-center text-xs text-primary font-medium transition-colors border-b-3",
                                route.active ? "border-primary " : "border-card/0"
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
