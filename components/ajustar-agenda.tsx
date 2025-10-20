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
import { Label } from "./ui/label"
import { DiaSemana, SlotHorario } from "@/app/generated/prisma"
import { editarDiasSemana, editarSlotsHorario } from "@/actions/mentoria"

// Schema de validação
const agendaSchema = z.object({
  diasSemana: z.array(
    z.object({
      id: z.number(),
      status: z.boolean(),
    })
  ),
  horarios: z.array(
    z.object({
      id: z.number(),
      status: z.boolean(),
    })
  )
})

type AgendaFormData = z.infer<typeof agendaSchema>


interface AjustarAgendaProps {
  diasSemana: DiaSemana[]
  slotsHorario: SlotHorario[]
  onDiasChange?: (diasAtualizados: DiaSemana[]) => void
  onHorariosChange?: (horariosAtualizados: SlotHorario[]) => void
}

export function AjustarAgenda({
  diasSemana,
  slotsHorario,
  onDiasChange,
  onHorariosChange
}: AjustarAgendaProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [diasAtualizados, setDiasAtualizados] = useState<DiaSemana[]>(diasSemana)
  const [horariosAtualizados, setHorariosAtualizados] = useState<SlotHorario[]>(slotsHorario);

  const form = useForm<AgendaFormData>({
    resolver: zodResolver(agendaSchema),
    defaultValues: {
      diasSemana: diasSemana.map(dia => ({ id: dia.id, status: dia.status })),
      horarios: slotsHorario.map(horario => ({ id: horario.id, status: horario.status }))
    }
  })

  // Sincronizar estados quando as props mudarem
  useEffect(() => {
    setDiasAtualizados(diasSemana)
  }, [diasSemana])

  useEffect(() => {
    setHorariosAtualizados(slotsHorario)
  }, [slotsHorario])

  const handleDiaChange = (diaId: number, checked: boolean) => {
    const diasAtivos = diasAtualizados.filter(dia => dia.status)

    if (checked && diasAtivos.length >= 2) {
      toast.error("Você pode selecionar apenas 2 dias da semana")
      return
    }

    const novosDias = diasAtualizados.map(dia =>
      dia.id === diaId ? { ...dia, status: checked } : dia
    )

    setDiasAtualizados(novosDias)
  }

  const handleHorarioChange = (horarioId: number, checked: boolean) => {
    const novosHorarios = horariosAtualizados.map(horario =>
      horario.id === horarioId ? { ...horario, status: checked } : horario
    )

    setHorariosAtualizados(novosHorarios)
  }

  async function onSubmit(data: AgendaFormData) {
    // Chama as funções de callback se fornecidas
    if (onDiasChange) {
      onDiasChange(diasAtualizados)
    }
    if (onHorariosChange) {
      onHorariosChange(horariosAtualizados)
    }

    try {
      const alteracaoDias = diasAtualizados.some((diaAtual) => {
        const diaOriginal = diasSemana.find(dia => dia.id === diaAtual.id)
        return diaOriginal && diaOriginal.status !== diaAtual.status
      });

      const alteracaoHorarios = horariosAtualizados.some((horarioAtual) => {
        const horarioOriginal = slotsHorario.find(slot => slot.id === horarioAtual.id)
        return horarioOriginal && horarioOriginal.status !== horarioAtual.status
      });

      if (alteracaoDias) {
        await Promise.all(
          diasAtualizados.map(async (dia) => {
            const diaOriginal = diasSemana.find(d => d.id === dia.id)
            if (diaOriginal && diaOriginal.status !== dia.status) {
              await editarDiasSemana(dia.id, dia.status)
            }
          })
        );
      }

      if (alteracaoHorarios) {
        await Promise.all(
          horariosAtualizados.map(async (horario) => {
            await editarSlotsHorario(horario.id, horario.status)
          })
        )
      }
      toast.success('Agenda ajustada com sucesso');
      setIsOpen(false)

    } catch (error) {
      toast.error('Algo deu errado, tente novamente!')
    }
  }

  const handleCancel = () => {
    setDiasAtualizados(diasSemana)
    setHorariosAtualizados(slotsHorario)
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
            <FormField
              control={form.control}
              name='diasSemana'
              render={({ field }) => (
                <div className="space-y-2">
                  <div>
                    <FormLabel >
                      Dias da Semana
                    </FormLabel>
                    <FormDescription className="max-sm:text-xs">
                      Selecione 2 dias da semana.
                    </FormDescription>
                  </div>
                  <div className="grid grid-cols-5 max-sm:grid-cols-3 gap-2">
                    {diasSemana.map((semana) => (
                      <div key={semana.id} className="flex flex-col items-center gap-1">
                        <Label
                          htmlFor={semana.nome}
                          className={clsx("text-xs font-medium text-nowrap leading-none ",
                            diasAtualizados.find(d => d.id === semana.id)?.status && 'text-primary',
                            !diasAtualizados.find(d => d.id === semana.id)?.status && 'text-muted-foreground'
                          )}
                        >
                          {semana.nome}
                        </Label>
                        <div className="p-2">
                          <Checkbox
                            id={String(semana.id)}
                            checked={diasAtualizados.find(d => d.id === semana.id)?.status || false}
                            onCheckedChange={(checked) =>
                              handleDiaChange(semana.id, Boolean(checked))
                            }
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            />

            <FormField
              control={form.control}
              name='horarios'
              render={({ field }) => (
                <div className="space-y-2">
                  <div>
                    <FormLabel className="flex items-center gap-2">
                      Horários Disponíveis
                    </FormLabel>
                    <FormDescription className="max-sm:text-xs">
                      Selecione os horários de 15h às 17h (slots de 20min)
                    </FormDescription>
                  </div>
                  <div className="grid grid-cols-3 gap-4 max-h-48 overflow-y-auto ">
                    {slotsHorario.map((horario) => {
                      const horarioAtualizado = horariosAtualizados.find(h => h.id === horario.id)
                      return (
                        <Item
                          key={horario.id}
                          variant='muted'
                          size='sm'
                          className={clsx(
                            'max-sm:flex-col-reverse',
                            horarioAtualizado?.status && 'bg-primary/5 border-primary text-primary'
                          )}
                        >
                          <ItemActions>
                            <Checkbox
                              id={String(horario.id)}
                              checked={horarioAtualizado?.status || false}
                              onCheckedChange={(checked) =>
                                handleHorarioChange(horario.id, Boolean(checked))
                              }
                            />
                          </ItemActions>
                          <ItemContent>
                            <ItemTitle className="text-xs">{horario.nome}</ItemTitle>
                          </ItemContent>
                        </Item>
                      )
                    })}
                  </div>
                </div>
              )}
            />

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
                disabled={form.formState.isSubmitting}
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
