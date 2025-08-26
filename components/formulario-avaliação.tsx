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
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Separator } from "@radix-ui/react-dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"

interface GradingCriteria {
  name: string
  description: string
  maxScore: number
  score: number
}

type FormValues = z.infer<typeof formSchema>

const formSchema = z.object({
  tema: z.string().min(1, "Tema é obrigatório"),
  criterios: z.array(
    z.object({
      name: z.string(),
      description: z.string(),
      maxScore: z.number(),
      score: z.number().min(0).max(200)
    })
  )
})

const temas = [
  { tema: "Cidadania e Direitos Humanos" },
  { tema: "Educação" },
  { tema: "Saúde Pública" },
  { tema: "Meio Ambiente" },
  { tema: "Tecnologia e Sociedade" },
  { tema: "Cultura e Diversidade" },
  { tema: "Segurança Pública" },
  { tema: "Questões Sociais" },
  { tema: "Trabalho e Economia" },
  { tema: "Inclusão Social" }
]

export function FormularioAvaliacoa() {
  const [isOpen, setIsOpen] = useState(false) // Add this state for dialog control
  const [studentName, setStudentName] = useState("")
  const [assignmentTitle, setAssignmentTitle] = useState("")
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


  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tema: "",
      criterios: criteria
    }
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      console.log(values)
      
      // Reset form and close dialog on success
      form.reset()
      setIsOpen(false)
    } catch (error) {
      console.error('Error submitting form:', error)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => setIsOpen(open => !open)}>
      <DialogTrigger asChild>
        <Button variant="secondary">
          <Plus />
          Nova Avaliação
        </Button>
      </DialogTrigger>
      <DialogContent style={{ maxWidth: "600px" }}>
        <DialogHeader>
          <DialogTitle className="text-center">Adicionar Avaliação</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="tema"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tema</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} defaultValue={String(field.value)}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder='Selecione um tema' />
                      </SelectTrigger>
                      <SelectContent>
                        {temas.map((tema, index) => (
                          <SelectItem key={index} value={tema.tema}>{tema.tema}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />

            {criteria.map((criterion, index) => (
              <FormField
                key={criterion.name}
                control={form.control}
                name={`criterios.${index}.score`}
                render={({ field }) => (
                  <FormItem>
                    <div className="flex justify-between items-center">
                      <div>
                        <FormLabel>{criterion.name}</FormLabel>
                        <FormDescription className="text-xs">{criterion.description}</FormDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <FormControl>
                          <Input
                            type="number"
                            className="w-20"
                            {...field}
                            onChange={(e) => {
                              field.onChange(Number(e.target.value))
                              handleScoreChange(index, e.target.value)
                            }}
                            min={0}
                            max={criterion.maxScore}
                          />
                        </FormControl>
                        <span className="text-sm text-gray-500">/{criterion.maxScore}</span>
                      </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}

            <Separator />

            <div className="flex flex-col justify-between items-center pt-4 gap-4 border-t">
              <div className="flex justify-between text-lg font-semibold w-full">
                <span>Nota Final:</span>
                <span>{totalScore}/1000</span>
              </div>
              <div className="flex justify-center gap-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    form.reset()
                    setIsOpen(false)
                  }} 
                  className="min-w-[100px]"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  className="min-w-[100px]"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ? 'Salvando...' : 'Salvar'}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}