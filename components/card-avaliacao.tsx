import { Essay } from "@/lib/data";
import { Card, CardContent, CardFooter } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ModalAvaliacao } from "./modal-avaliação";
import { Progress } from "./ui/progress";

interface CardAvaliacaoProps {
    essay: Essay;
}

const calculateTotalScore = (competencies: number[]) =>
    competencies.reduce((sum, score) => sum + score, 0);

const getGradeColor = (grade: number, maxGrade: number) => {
    const percentage = (grade / maxGrade) * 100;
    if (percentage >= 90) return "bg-primary";
    if (percentage >= 80) return "bg-secondary";
    if (percentage >= 70) return "bg-secondary-foreground";
    return "bg-red-500";
};

const getGradeBadgeVariant = (
    grade: number,
    maxGrade: number,
) => {
    const percentage = (grade / maxGrade) * 100;
    if (percentage >= 90) return "default";
    if (percentage >= 80) return "secondary";
    if (percentage >= 70) return "outline";
    return "destructive";
};

export function CardAvaliacao({ essay }: CardAvaliacaoProps) {
    return (
        <Card
            className="cursor-pointer hover:shadow-md transition-shadow p-0 min-h-[164px] h-full max-h-[164px] gap-0 relative"
        >
            <CardContent className="p-4 relative h-full">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <h3 className="font-medium mb-1 text-sm leading-tight">
                            {essay.title}
                        </h3>
                        <p className="text-xs text-muted-foreground mb-2">
                            Profª Daniely Guedes
                        </p>
                        <p className="text-xs text-muted-foreground">
                            {new Date().toLocaleDateString("pt-BR")}
                        </p>
                    </div>
                    <div className="text-right">
                        <Badge
                            className="mb-2"
                            variant={getGradeBadgeVariant(calculateTotalScore(essay.competencies), 1000)}
                        >
                            {calculateTotalScore(essay.competencies)}/1000
                        </Badge>
                        <Progress value={(calculateTotalScore(essay.competencies) / 1000) * 100} indicatorClassName={getGradeColor(calculateTotalScore(essay.competencies), 1000)} />
                    </div>
                </div>
            </CardContent>
            <CardFooter className="px-4 pb-4 absolute inset-x-0 bottom-0">
                <ModalAvaliacao essay={essay}/>
            </CardFooter>
        </Card>
    )
}