'use client'
import { useEffect, useState } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { CirclePlay, Video } from "lucide-react"
import clsx from "clsx"
import { listarVideoaulas } from "@/actions/videoaulas"
import { Videoaula } from "@/app/generated/prisma"

const tags = Array.from({ length: 50 }).map(
    (_, i, a) => `Aula${a.length - i}`
)

interface ListaVideoaulasProps {
    aulaId: number
}

export function ListaVideoaulas({ aulaId }: ListaVideoaulasProps) {
    const [videoaulas, setVideoaulas] = useState<Videoaula[]>([])

    useEffect(() => {
        const novasVideoaulas = async () => {
            const aulas = await listarVideoaulas()

            setVideoaulas(aulas.data.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()))
        }
        novasVideoaulas()
    }, [])


    return (
        <ScrollArea className="w-full h-full">
            <div className="h-full pb-12">
                {videoaulas.map((videoaula) => (
                    <Link href={`/aluno/aulas/${videoaula.id}`} key={videoaula.id}>
                        <div className={clsx("text-sm flex gap-2 items-center text-muted-foreground p-2 rounded-sm", aulaId === videoaula.id && 'text-primary font-semibold bg-primary/5')}>
                            {aulaId === videoaula.id ? <CirclePlay size={18} /> : <Video size={18} />}
                            {videoaula.titulo}
                        </div>
                        <Separator className="my-2" />
                    </Link>
                ))}
            </div>
        </ScrollArea>
    )
}
