'use client'
import { useEffect, useState } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { CirclePlay, Play, Video } from "lucide-react"
import clsx from "clsx"
import { listarVideoaulas } from "@/actions/videoaulas"
import { Videoaula } from "@/app/generated/prisma"
import { Skeleton } from "./ui/skeleton"
import Image from "next/image"

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"

const tags = Array.from({ length: 50 }).map(
    (_, i, a) => `Aula${a.length - i}`
)

interface ListaVideoaulasProps {
    aulaId: number
}

export function ListaVideoaulas({ aulaId }: ListaVideoaulasProps) {
    const [videoaulas, setVideoaulas] = useState<Videoaula[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const novasVideoaulas = async () => {
            setLoading(true)
            const aulas = await listarVideoaulas()

            setVideoaulas(aulas.data.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()))
            setLoading(false)
        }
        novasVideoaulas()
    }, [])


    return (
        <ScrollArea className="flex flex-col flex-1 w-full overflow-x-hidden">
            <div className="h-full pb-12 flex-1">
                {loading === true ? (
                    <>
                        {Array.from({ length: 10 }).map((_, index) => (
                            <div key={index} className="w-full space-y-1">
                                <Skeleton className="h-8 w-full" />
                                <Separator />
                            </div>
                        ))}
                    </>
                ) : (
                    <Accordion type="multiple" defaultValue={["item-1"]}>
                        {videoaulas.map((videoaula) => (
                            <AccordionItem key={videoaula.id} value={`item-${videoaula.id}`}>
                                <AccordionTrigger>
                                    <div className="flex items-center gap-4 w-full">
                                        <span className="min-w-0 flex max-md:flex-col md:items-center w-full md:justify-between">
                                            <span className="block font-semibold leading-snug text-foreground max-sm:text-sm truncate">
                                                Módulo {videoaula.id} - {videoaula.titulo}
                                            </span>
                                            {/* <span className="min-w-0 w-full max-w-sm">
                                                <span className="mb-1 flex items-center justify-between gap-3 text-xs text-muted-foreground">
                                                    <span className="truncate">{videoaula.titulo}</span>
                                                    <span>%</span>
                                                </span>
                                                <Progress
                                                        value={module.progress}
                                                        aria-label={`Progresso do módulo ${module.number}: ${module.progress} por cento`}
                                                        className="h-2 bg-primary/10"
                                                      /> 
                                            </span> */}
                                        </span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                    <div className="flex items-start gap-4">
                                        <span className="relative flex h-14 w-20 flex-shrink-0 justify-center items-center rounded-md bg-primary/8 text-primary transition-colors group-hover:bg-primary/12">
                                            <Play className="size-6 absolute fill-primary" />
                                            <Image
                                                src="/Sublogo1.svg"
                                                alt="Thumbnail"
                                                className="w-full h-auto object-cover rounded-md"
                                                width={100}
                                                height={50}
                                            />
                                        </span>
                                        <span className="flex flex-col min-w-0">
                                            <span className="text-sm font-semibold truncate">{videoaula.titulo}</span>
                                            <span className="text-xs text-muted-foreground break-words">{videoaula.descricao}</span>
                                        </span>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                )}
            </div>
        </ScrollArea >
    )
}