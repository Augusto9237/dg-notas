'use client'

import { ListVideo } from "lucide-react"
import { Button } from "./ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet"
import { ListaVideoaulas } from "./lista-videoaulas"

export function MenuVideoaulas({ aulaId }: { aulaId: number }) {
    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button size='sm' variant='ghost' className="text-primary">
                    <ListVideo />
                </Button>
            </SheetTrigger>
            <SheetContent className="p-5">
                <SheetHeader className="p-0">
                    <SheetTitle>Conteúdos</SheetTitle>
                </SheetHeader>
                <ListaVideoaulas aulaId={Number(aulaId)} />
            </SheetContent>
        </Sheet>
    )
}