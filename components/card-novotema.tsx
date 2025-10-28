'use client'
import { Card, CardContent, CardFooter } from "./ui/card";
import { Badge } from "./ui/badge";
import { ModalAvaliacao } from "./modal-avaliação";
import { Progress } from "./ui/progress";
import { Avaliacao, Criterio, CriterioAvaliacao, Prisma, Tema } from "@/app/generated/prisma";
import { Button } from "./ui/button";
import { Upload } from "lucide-react";


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
                        Profª Daniely Guedes
                    </p>
                    <p className="text-xs text-muted-foreground">
                        {new Date(tema.createdAt).toLocaleDateString("pt-BR")}
                    </p>
                </div>
            </CardContent>
            <CardFooter className="px-4 pb-4 absolute inset-x-0 bottom-0">
                <Button className="w-full" size='sm'>
                    <Upload />
                    Enviar Redação
                </Button>
            </CardFooter>
        </Card>
    )
}