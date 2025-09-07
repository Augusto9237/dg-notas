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

interface GradingCriteria {
  name: string
  description: string
  maxScore: number
  score: number
}


interface ModalAvaliacaoProps {
  essay: Essay;
}

export function ModalAvaliacao({ essay }: ModalAvaliacaoProps) {
  const [isOpen, setIsOpen] = useState(false) // Add this state for dialog control
  const [criteria, setCriteria] = useState<GradingCriteria[]>(
    [
      {
        name: "Gramática e norma culta",
        description: "Uso correto da norma culta: ortografia, pontuação e gramática.",
        maxScore: 200,
        score: 0
      },
      {
        name: "Foco no tema e repertório sociocultural",
        description: "Manter-se no tema e usar repertório sociocultural relevante.",
        maxScore: 200,
        score: 0
      },
      {
        name: "Argumentação consistente",
        description: "Defender o ponto de vista com argumentos claros e organizados.",
        maxScore: 200,
        score: 0
      },
      {
        name: "Coesão e organização textual",
        description: "Usar conectivos e recursos linguísticos para dar fluidez ao texto.",
        maxScore: 200,
        score: 0
      },
      {
        name: "Proposta de intervenção detalhada",
        description: "Apresentar solução viável e detalhada para o problema discutido.",
        maxScore: 200,
        score: 0
      }
    ]

  )

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
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-center text-base">{essay.title}</DialogTitle>
        </DialogHeader>
        {criteria.map((criterion, index) => (
          <div key={index} className="space-y-1">
            <div className="flex justify-between items-center">
              <p className="text-sm font-medium">
                {criterion.name}
              </p>
              <Badge
                className="text-xs"
                variant={getGradeBadgeVariant(essay.competencies[index], criterion.maxScore)}
              >
                {essay.competencies[index]}/{criterion.maxScore}
              </Badge>
            </div>
            <Progress value={(essay.competencies[index]/ criterion.maxScore) * 100} indicatorClassName={getGradeColor(essay.competencies[index], criterion.maxScore)} />
            <p className="text-xs text-muted-foreground">{criterion.description}</p>
          </div>
        ))}

        <Separator />

        <div className="flex flex-col justify-between items-center pt-4 gap-4 border-t">
          <div className="flex justify-between font-semibold w-full text-primary">
            <span>Nota Final:</span>
            <span>{calculateTotalScore(essay.competencies)}/1000</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}