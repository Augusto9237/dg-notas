'use client'
import { Card, CardContent, CardFooter } from "./ui/card";
import { Badge } from "./ui/badge";
import { ModalEnviarRedacao } from "./modal-enviar-redacao";
import { Prisma } from "@/app/generated/prisma";

type Tema = Prisma.TemaGetPayload<{
    include: {
        professor: true
    }
}>

interface CardNovoTemaProps {
    tema: Tema;
}


export function CardNovoTema({ tema }: CardNovoTemaProps) {

    return (
        <Card
            className="cursor-pointer bg-secondary/10 border-secondary hover:shadow-md transition-shadow p-0 min-h-[160px] h-full max-h-[160px] gap-0 relative"
        >
            <CardContent className="p-4 relative h-full flex-1 flex flex-col justify-between">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <h3 className="font-medium mb-1 text-sm leading-tight">
                            {tema.nome}
                        </h3>
                    </div>
                    <div className="text-right">
                        <Badge
                            variant='secondary'
                        >
                            Novo Tema
                        </Badge>
                    </div>
                </div>
                <div className="flex justify-between w-full pb-10">
                    <p className="text-xs text-muted-foreground mb-1">
                        {tema.professor.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                        {new Date(tema.createdAt).toLocaleDateString("pt-BR")}
                    </p>
                </div>
            </CardContent>
            <CardFooter className="px-4 pb-4 absolute inset-x-0 bottom-0">
                <ModalEnviarRedacao tema={tema} />
            </CardFooter>
        </Card>
    )
}