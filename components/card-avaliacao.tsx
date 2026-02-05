'use client'
import { Card, CardContent, CardFooter } from "./ui/card";
import { Badge } from "./ui/badge";
import { ModalAvaliacao } from "./modal-avaliação";
import { Progress } from "./ui/progress";
import { Avaliacao, Criterio, CriterioAvaliacao, Prisma, Tema } from "@/app/generated/prisma";
import clsx from "clsx";


interface CardAvaliacaoProps {
    avaliacao: (Avaliacao & {
        tema: Tema;
        criterios: CriterioAvaliacao[];
    });
    criterios: Criterio[];
}

const calculateTotalScore = (competencies: number[]) =>
    competencies.reduce((sum, score) => sum + score, 0);

const getGradeColor = (grade: number, maxGrade: number) => {
    const percentage = (grade / maxGrade) * 100;
    if (percentage >= 75) return "bg-primary";
    if (percentage >= 50) return "bg-secondary";
    if (percentage >= 25) return "bg-secondary-foreground";
    return "bg-red-500";
};

const getGradeBadgeVariant = (
    grade: number,
    maxGrade: number,
) => {
    const percentage = (grade / maxGrade) * 100;
    if (percentage >= 75) return "default";
    if (percentage >= 50) return "secondary";
    if (percentage >= 25) return "outline";
    return "destructive";
};

export function CardAvaliacao({ avaliacao, criterios }: CardAvaliacaoProps) {

    return (
        <Card
            className={clsx("cursor-pointer hover:shadow-md transition-shadow p-0 min-h-[164px] h-full max-h-[164px] gap-0 relative", avaliacao.status === 'ENVIADA' && "bg-linear-to-r from-primary/5 to-primary/10 border-primary/20")}
        >
            <CardContent className="p-4 relative h-full flex-1 flex flex-col justify-between">
                <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                        <h3 className="font-medium mb-1 text-sm leading-tight">
                            {avaliacao.tema.nome}
                        </h3>
                    </div>
                    <div className="text-right">
                        {avaliacao.status === 'CORRIGIDA' ? (
                            <>
                                <Badge
                                    className="mb-2"
                                    variant={getGradeBadgeVariant(avaliacao.notaFinal, 1000)}
                                >
                                    {avaliacao.notaFinal}/1000
                                </Badge>
                                <Progress value={(avaliacao.notaFinal / 1000) * 100} indicatorClassName={getGradeColor(avaliacao.notaFinal, 1000)} />
                            </>
                        ) : (
                            <Badge
                                className="mb-2"
                            >
                                Enviada
                            </Badge>
                        )}
                    </div>
                </div>
                <div className="flex justify-between w-full pb-10">
                    <p className="text-xs text-muted-foreground mb-2">
                        Profª Daniely Guedes
                    </p>
                    <p className="text-xs text-muted-foreground">
                        {new Date(avaliacao.createdAt).toLocaleDateString("pt-BR")}
                    </p>
                </div>
            </CardContent>
            <CardFooter className="px-4 pb-4 absolute inset-x-0 bottom-0">
                <ModalAvaliacao avaliacao={avaliacao} criterios={criterios} />
            </CardFooter>
        </Card>
    )
}