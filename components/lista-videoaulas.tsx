'use client'
import { useEffect, useState } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { CirclePlay, Video } from "lucide-react"
import clsx from "clsx"
import { listarVideoaulas } from "@/actions/videoaulas"
import { Videoaula } from "@/app/generated/prisma"
import { Skeleton } from "./ui/skeleton"

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
        <ScrollArea className="w-full h-full">
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
                    <>
                        {videoaulas.map((videoaula) => (
                            <Link href={`/aluno/aulas/${videoaula.id}`} key={videoaula.id} className="w-full oveflow-hidden">
                                <div className={clsx("text-sm flex gap-2 items-center text-muted-foreground p-2 rounded-sm text-nowrap truncate", aulaId === videoaula.id && 'text-primary font-semibold bg-primary/5')}>
                                    {aulaId === videoaula.id ? <CirclePlay className="size-4" /> : <Video className="size-4"/>}
                                    {videoaula.titulo}
                                </div>
                                <Separator className="my-2" />
                            </Link>
                        ))}
                    </>
                )}
            </div>
        </ScrollArea >
    )
}
