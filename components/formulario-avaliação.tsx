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
import { Progress } from "./ui/progress"
import { Tema } from "@/app/generated/prisma"

interface CriteriosProps {
  nome: string
  descricao: string
  pontuacaoMaxima: number
  pontuacao: number
}

type FormValues = z.infer<typeof formSchema>

const formSchema = z.object({
  tema: z.string().min(1, "Tema é obrigatório"),
  criterios: z.array(
    z.object({
      nome: z.string(),
      descricao: z.string(),
      pontuacaoMaxima: z.number(),
      pontuacao: z.number().min(0).max(200)
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

interface FormularioAvaliacaoProps {
  temas: Tema[]
}

export function FormularioAvaliacao({ temas }: FormularioAvaliacaoProps) {
  const [isOpen, setIsOpen] = useState(false) // Add this state for dialog control
  const [criteria, setCriteria] = useState<CriteriosProps[]>(
    [
      {
        nome: "Gramática e norma culta",
        descricao: "Uso correto da norma culta: ortografia, pontuação e gramática.",
        pontuacaoMaxima: 200,
        pontuacao: 0
      },
      {
        nome: "Foco no tema e repertório sociocultural",
        descricao: "Manter-se no tema e usar repertório sociocultural relevante.",
        pontuacaoMaxima: 200,
        pontuacao: 0
      },
      {
        nome: "Argumentação consistente",
        descricao: "Defender o ponto de vista com argumentos claros e organizados.",
        pontuacaoMaxima: 200,
        pontuacao: 0
      },
      {
        nome: "Coesão e organização textual",
        descricao: "Usar conectivos e recursos linguísticos para dar fluidez ao texto.",
        pontuacaoMaxima: 200,
        pontuacao: 0
      },
      {
        nome: "Proposta de intervenção detalhada",
        descricao: "Apresentar solução viável e detalhada para o problema discutido.",
        pontuacaoMaxima: 200,
        pontuacao: 0
      }
    ]

  )

  const getGradeColor = (grade: number, maxGrade: number) => {
    const percentage = (grade / maxGrade) * 100;
    if (percentage >= 75) return "bg-primary";
    if (percentage >= 50) return "bg-secondary";
    if (percentage >= 25) return "bg-secondary-foreground";
    return "bg-red-500";
  };

  const totalScore = criteria.reduce((sum, item) => sum + item.pontuacao, 0)

  const handleScoreChange = (index: number, value: string) => {
    const newCriteria = [...criteria]
    newCriteria[index].pontuacao = Number(value)
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
                          <SelectItem key={index} value={String(tema.id)}>{tema.nome}</SelectItem>
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
                key={criterion.nome}
                control={form.control}
                name={`criterios.${index}.pontuacao`}
                render={({ field }) => (
                  <FormItem className="border-b-1 pb-2">
                    <div className="flex justify-between items-center">
                      <div className="space-y-1">
                        <FormLabel>{criterion.nome}</FormLabel>
                        <FormDescription className="text-xs">{criterion.descricao}</FormDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <FormControl>
                          <Input
                            type="number"
                            className="w-16.5"
                            {...field}
                            onChange={(e) => {
                              field.onChange(Number(e.target.value))
                              handleScoreChange(index, e.target.value)
                            }}
                            min={0}
                            max={criterion.pontuacaoMaxima}
                          />
                        </FormControl>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">0</span>
                      <span className="text-xs text-muted-foreground">{criterion.pontuacaoMaxima}</span>
                    </div>
                    <Progress value={(form.getValues().criterios[index].pontuacao / criterion.pontuacaoMaxima) * 100} indicatorClassName={getGradeColor(form.getValues().criterios[index].pontuacao, criterion.pontuacaoMaxima)} />
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}

            <div className="flex flex-col justify-between items-center pt-4 gap-4">
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