import { Card, CardDescription, CardTitle } from "./ui/card";
import { SidebarTrigger } from "./ui/sidebar";
import type { ReactNode } from "react";

interface HeaderProps {
    title: string;
    description: string;
    children?: ReactNode;
}

export function HeaderTeacher({ title, description, children }: HeaderProps) {
    return (
        <header className='h-16 items-center flex gap-4 px-5 w-full absolute inset-0 bg-background backdrop:blur-sm border-b border-border'>
            <SidebarTrigger />
            <div className="w-full">
                <CardTitle className="md:text-lg leading-none">{title}</CardTitle>
                <CardDescription className="max-md:text-xs truncate">{description}</CardDescription>
            </div>
            <div className="">
                {children}
            </div>
        </header>
    )
}
