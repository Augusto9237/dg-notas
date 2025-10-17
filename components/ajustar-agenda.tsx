'use client'

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { CalendarCog, Clock } from "lucide-react"
import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { Item, ItemActions, ItemContent, ItemHeader, ItemTitle } from "./ui/item"
import clsx from "clsx"

// Schema de validação
const agendaSchema = z.object({
  diasSemana: z.array(z.string()).min(2, "Selecione pelo menos 2 dias da semana").max(2, "Selecione no máximo 2 dias da semana"),
  horarios: z.array(z.string()).min(1, "Selecione pelo menos um horário")
})

type AgendaFormData = z.infer<typeof agendaSchema>

// Dados dos dias da semana
const diasSemana = [
  { value: "segunda", label: "Segunda-feira" },
  { value: "terca", label: "Terça-feira" },
  { value: "quarta", label: "Quarta-feira" },
  { value: "quinta", label: "Quinta-feira" },
  { value: "sexta", label: "Sexta-feira" },
]

// Gerar horários de 20 em 20 minutos entre 15h e 17h
const gerarHorarios = () => {
  const horarios = []
  for (let hora = 15; hora < 17; hora++) {
    for (let minuto = 0; minuto < 60; minuto += 20) {
      const horaFormatada = hora.toString().padStart(2, '0')
      const minutoFormatado = minuto.toString().padStart(2, '0')
      const valor = `${horaFormatada}:${minutoFormatado}`
      const label = `${horaFormatada}:${minutoFormatado}`
      horarios.push({ value: valor, label })
    }
  }
  return horarios
}

const horariosDisponiveis = gerarHorarios()

export function AjustarAgenda() {
  const [isOpen, setIsOpen] = useState(false)
  const [diasSelecionados, setDiasSelecionados] = useState<string[]>([])
  const [horariosSelecionados, setHorariosSelecionados] = useState<string[]>([])

  const form = useForm<AgendaFormData>({
    resolver: zodResolver(agendaSchema),
    defaultValues: {
      diasSemana: [],
      horarios: []
    }
  })

  const handleDiaChange = (dia: string, checked: boolean) => {
    if (checked) {
      if (diasSelecionados.length >= 2) {
        toast.error("Você pode selecionar apenas 2 dias da semana")
        return
      }
      setDiasSelecionados([...diasSelecionados, dia])
    } else {
      setDiasSelecionados(diasSelecionados.filter(d => d !== dia))
    }
  }

  const handleHorarioChange = (horario: string, checked: boolean) => {
    if (checked) {
      setHorariosSelecionados([...horariosSelecionados, horario])
    } else {
      setHorariosSelecionados(horariosSelecionados.filter(h => h !== horario))
    }
  }

  const onSubmit = (data: AgendaFormData) => {
    console.log("Configuração da agenda:", data)
    toast.success("Agenda configurada com sucesso!")
    setIsOpen(false)
    // Aqui você pode adicionar a lógica para salvar no banco de dados
  }

  const handleCancel = () => {
    setDiasSelecionados([])
    setHorariosSelecionados([])
    form.reset()
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <CalendarCog />
          Ajustes
        </Button>
      </DialogTrigger>
      <DialogContent >
        <DialogHeader>
          <DialogTitle className="text-center">
            Ajustar Agenda
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {/* Seleção de Dias da Semana */}
            <div className="space-y-2">
              <div>
                <FormLabel className="font-medium">
                  Dias da Semana
                </FormLabel>
                <FormDescription>
                  Selecione 2 dias da semana.
                </FormDescription>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {diasSemana.map((dia) => (
                  <div key={dia.value} className="flex flex-col items-center">
                    <label
                      htmlFor={dia.value}
                      className="text-xs font-medium text-nowrap leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {dia.label}     
                    </label>
                    <div className="p-2">
                    <Checkbox
                      id={dia.value}
                      checked={diasSelecionados.includes(dia.value)}
                      onCheckedChange={(checked) =>
                        handleDiaChange(dia.value, checked as boolean)
                      }
                    />
                  </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Seleção de Horários */}
          <div className="space-y-2">
            <div>
              <FormLabel className="font-medium flex items-center gap-2">
                Horários Disponíveis
              </FormLabel>
              <FormDescription>
                Selecione os horários de 15h às 17h (slots de 20min)
              </FormDescription>
            </div>
            <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto ">
              {horariosDisponiveis.map((horario) => (
                <Item key={horario.value} variant='muted' className={clsx(horariosSelecionados.includes(horario.value) && 'bg-primary/5 border-primary text-primary')}>
                  <ItemActions>
                    <Checkbox
                      id={horario.value}
                      checked={horariosSelecionados.includes(horario.value)}
                      onCheckedChange={(checked) =>
                        handleHorarioChange(horario.value, checked as boolean)
                      }
                    />
                  </ItemActions>
                  <ItemContent>
                    <ItemTitle>{horario.label}</ItemTitle>
                  </ItemContent>
                </Item>
              ))}
            </div>
          </div>

          <div className="flex justify-center gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              className="min-w-[100px]"
              onClick={handleCancel}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="min-w-[100px]"
              disabled={diasSelecionados.length !== 2 || horariosSelecionados.length === 0}
            >
              Salvar
            </Button>
          </div>
        </form>
      </Form>
    </DialogContent>
    </Dialog >
  )
}
