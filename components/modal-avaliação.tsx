'use client'
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus } from "lucide-react"
import { useState } from "react"
import { Separator } from "@radix-ui/react-dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { TableCell, TableRow } from "./ui/table"
import { Essay, Student } from "@/lib/data"

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

  const totalScore = criteria.reduce((sum, item) => sum + item.score, 0)

  const handleScoreChange = (index: number, value: string) => {
    const newCriteria = [...criteria]
    newCriteria[index].score = Number(value)
    setCriteria(newCriteria)
  }

  const calculateTotalScore = (competencies: number[]) =>
    competencies.reduce((sum, score) => sum + score, 0);

  return (
    <Dialog open={isOpen} onOpenChange={() => setIsOpen(open => !open)}>
      <DialogTrigger asChild>
        <TableRow>
          <TableCell className='pl-4'>
            {essay.title}
          </TableCell>
          <TableCell>
            {new Date().toLocaleDateString('pt-BR')}
          </TableCell>
          {essay.competencies.map((score, index) => (
            <TableCell key={index}>{score}
            </TableCell>
          ))}
          <TableCell className="font-bold text-center">
            {calculateTotalScore(essay.competencies)}
          </TableCell>
        </TableRow>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-center">Detalhes da Avaliação</DialogTitle>
        </DialogHeader>
        <div>
          <Label>Tema</Label>
          <p className="text-xs text-muted-foreground">{essay.title}</p>
        </div>
        {criteria.map((criterion, index) => (
          <div key={index} className="flex justify-between items-center">
            <div>
              <Label>{criterion.name}</Label>
              <p className="text-xs text-muted-foreground">{criterion.description}</p>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-sm font-semibold">{essay.competencies[index]}</span>
              <span className="text-xs text-muted-foreground">/{criterion.maxScore}</span>
            </div>
          </div>
        ))}

        <Separator />

        <div className="flex flex-col justify-between items-center pt-4 gap-4 border-t">
          <div className="flex justify-between font-semibold w-full">
            <span>Nota Final:</span>
            <span>{calculateTotalScore(essay.competencies)}/1000</span>
          </div>
          <div className="flex justify-center gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsOpen(false)
              }}
              className="min-w-[100px]"
            >
              Ok
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}