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
import { Videoaula } from "@/app/generated/prisma";
import { Avatar } from "./ui/avatar";
import Image from "next/image";
import { obterUrlImagem } from "@/lib/obter-imagem";
import { useEffect, useState } from "react";
import { Play } from "lucide-react";
import VideoPlayer from "./video-player";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

interface ModalVideoaulaProps {
    videoaula: Videoaula
}

export function ModalVisualizarVideoaula({ videoaula }: ModalVideoaulaProps) {
    const [aberto, setAberto] = useState(false)

    return (
        <Dialog open={aberto} onOpenChange={setAberto}>
            <DialogTrigger asChild >
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button size="icon" variant='outline' onClick={() => setAberto(true)}>
                            <Play />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent className="text-primary bg-background fill-background">
                        <p>Visualizar</p>
                    </TooltipContent>
                </Tooltip>
            </DialogTrigger>
            <DialogContent className="bg-card max-w-md w-full">
                <DialogHeader>
                    <DialogTitle className="text-center">Visualizar Videoaula</DialogTitle>
                </DialogHeader>
                <VideoPlayer videoUrl={videoaula.urlVideo} />
                <DialogFooter className="flex flex-col sm:flex-col sm:items-start gap-1">
                    <span className="font-semibold">{videoaula.titulo}</span>
                    <p className="text-sm">{videoaula.descricao}</p>
                </DialogFooter>
            </DialogContent >
        </Dialog >
    );
}