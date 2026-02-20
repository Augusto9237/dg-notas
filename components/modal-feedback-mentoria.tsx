'use client'
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

import { Button } from "./ui/button";
import { IoChatbubbleEllipsesOutline } from "react-icons/io5";
import { User } from "@/app/generated/prisma";
import { Avatar } from "./ui/avatar";
import Image from "next/image";
import { obterUrlImagem } from "@/lib/obter-imagem";
import { useEffect, useState } from "react";

interface ModalFeedbackMentoriaProps {
    feedback: string
    professor: User
}


export function ModalFeedbackMentoria({ feedback, professor }: ModalFeedbackMentoriaProps) {
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    
    useEffect(() => {
        async function fetchImage() {
            if (professor?.image) {
                try {
                    const url = await obterUrlImagem(professor.image)
                    setAvatarUrl(url)
                } catch (error) {
                    console.error("Erro ao carregar imagem:", error)
                }
            }
        }
        fetchImage()
    }, [professor.image])
    return (
        <Dialog >
            <DialogTrigger asChild disabled={feedback.length === 0}>
                <Button className="w-full relative bg-primary/10" size="sm" variant='outline'>
                    <IoChatbubbleEllipsesOutline />
                    Feedback
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-card">
                <DialogHeader>
                    <DialogTitle className="text-center">Feedback</DialogTitle>
                </DialogHeader>
                <p>
                    "{feedback}"
                </p>
                <DialogFooter className="w-full flex flex-row items-center sm:justify-start">
                    <Avatar>
                        <Image alt={professor.name} src={avatarUrl || '/avatar-placeholder'} height={40} width={40} className="object-cover" />
                    </Avatar>
                    <div>
                        <p className="font-semibold text-sm">{professor.name}</p>
                        <p className="text-xs text-muted-foreground">{professor.especialidade}</p>
                    </div>
                </DialogFooter>
            </DialogContent >
        </Dialog >
    );
}