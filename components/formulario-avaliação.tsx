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

interface GradingCriteria {
  name: string
  description: string
  maxScore: number
  score: number
}

export function FormularioAvaliacoa() {
  const [studentName, setStudentName] = useState("")
  const [assignmentTitle, setAssignmentTitle] = useState("")
  const [criteria, setCriteria] = useState<GradingCriteria[]>([
    {
      name: "Grammar & Mechanics",
      description: "Spelling, punctuation, syntax",
      maxScore: 200,
      score: 0
    },
    {
      name: "Organization",
      description: "Structure, flow, transitions",
      maxScore: 200,
      score: 0
    },
    {
      name: "Content & Ideas",
      description: "Depth, relevance, creativity",
      maxScore: 200,
      score: 0
    },
    {
      name: "Style & Voice",
      description: "Tone, clarity, engagement",
      maxScore: 200,
      score: 0
    },
    {
      name: "Vocabulary",
      description: "Word choice, variety, precision",
      maxScore: 200,
      score: 0
    }
  ])

  const totalScore = criteria.reduce((sum, item) => sum + item.score, 0)

  const handleScoreChange = (index: number, value: string) => {
    const newCriteria = [...criteria]
    newCriteria[index].score = Number(value)
    setCriteria(newCriteria)
  }

  const handleSave = () => {
    // Add your save logic here
    console.log({
      studentName,
      assignmentTitle,
      criteria,
      totalScore
    })
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant='secondary'>
          <Plus />
          Nova Avaliação
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Adicionar Avaliação</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="studentName">Tema</Label>
            <Input
              id="studentName"
              placeholder="Enter student name"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="assignmentTitle">Assignment Title</Label>
            <Input
              id="assignmentTitle"
              placeholder="Enter assignment title"
              value={assignmentTitle}
              onChange={(e) => setAssignmentTitle(e.target.value)}
            />
          </div>

          <div className="space-y-4">
            {criteria.map((criterion, index) => (
              <div key={criterion.name} className="grid gap-2">
                <div className="flex justify-between items-center">
                  <div>
                    <Label>{criterion.name}</Label>
                    <p className="text-sm text-gray-500">{criterion.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      className="w-20"
                      value={criterion.score}
                      onChange={(e) => handleScoreChange(index, e.target.value)}
                      min={0}
                      max={criterion.maxScore}
                    />
                    <span className="text-sm text-gray-500">/{criterion.maxScore}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center pt-4 border-t">
            <div className="text-lg font-semibold">
              Total Score: {totalScore}/1000
            </div>
            <Button onClick={handleSave}>Save Grade</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}