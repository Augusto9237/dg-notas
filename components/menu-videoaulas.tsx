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
            <SheetContent className="p-5 h-full flex flex-col bg-card">
                <SheetHeader className="p-0 shrink-0">
                    <SheetTitle>Conteúdos</SheetTitle>
                </SheetHeader>
                <div className="flex-1 min-h-0 min-w-0 overflow-hidden mt-4">
                    <ListaVideoaulas aulaId={Number(aulaId)} />
                </div>
            </SheetContent>
        </Sheet>
    )
}