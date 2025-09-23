'use client'
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ChevronRight, Plus } from "lucide-react"
import { useState } from "react"
import { Separator } from "@radix-ui/react-dropdown-menu"
import { Essay, Student } from "@/lib/data"
import { Badge } from "./ui/badge"
import { Progress } from "./ui/progress"
import { Avaliacao, Criterio, CriterioAvaliacao, Prisma } from "@/app/generated/prisma"
import { Card } from "./ui/card"


type AvaliacaoProp = Prisma.AvaliacaoGetPayload<{
  include: {
    tema: true
  };
}>;

interface ModalAvaliacaoProps {
  avaliacao: AvaliacaoProp & { criterios: CriterioAvaliacao[] };
  criterios: Criterio[]
}

export function ModalAvaliacao({ avaliacao, criterios }: ModalAvaliacaoProps) {
  const [isOpen, setIsOpen] = useState(false) // Add this state for dialog control

  // Verificação de segurança
  if (!avaliacao || !avaliacao.tema) {
    return (
      <Button className="w-full relative bg-primary/10" size="sm" variant="outline" disabled>
        Avaliação Incompleta
      </Button>
    );
  }

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

  const calculateTotalScore = (competencies: number[]) =>
    competencies.reduce((sum, score) => sum + score, 0);

  return (
    <Dialog open={isOpen} onOpenChange={() => setIsOpen(open => !open)}>
      <DialogTrigger asChild>
        <Button className="w-full relative bg-primary/10" size="sm" variant="outline">
          Avaliação Completa
          <ChevronRight className="absolute right-3 top-2" />
        </Button>
      </DialogTrigger>
      <DialogContent className="gap-2 overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-center text-base mb-2">{avaliacao.tema.nome}</DialogTitle>
        </DialogHeader>
        {avaliacao.criterios.map((criterio) => {
          const criterioInfo = criterios.find(c => c.id === criterio.criterioId);
          if (!criterioInfo) return null;

          return (
            <Card key={criterio.id} className="p-4 gap-2">
              <div className="flex justify-between items-center">
                <p className="text-sm font-medium">
                  {criterioInfo.nome}
                </p>
                <Badge
                  className="text-xs"
                  variant={getGradeBadgeVariant(criterio.pontuacao, 200)}
                >
                  {criterio.pontuacao}/200
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">{criterioInfo.descricao}</p>
              <Progress value={criterio.pontuacao / 200 * 100} indicatorClassName={getGradeColor(criterio.pontuacao, 200)} />

            </Card>
          );
        })}
        <Separator />

        <div className="flex flex-col justify-between items-center pt-4 gap-4 border-t">
          <div className="flex justify-between font-semibold w-full text-primary">
            <span>Nota Final:</span>
            <span>{avaliacao.notaFinal}/1000</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}