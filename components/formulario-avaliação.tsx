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
import { Loader2, Plus } from "lucide-react"
import { useEffect, useState, useMemo, memo } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Separator } from "@radix-ui/react-dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Progress } from "./ui/progress"

import { AdicionarAvaliacao, EditarAvaliacao } from "@/actions/avaliacao"
import { toast } from "sonner"
import { Avaliacao, Criterio, CriterioAvaliacao, Tema } from "@/app/generated/prisma"
import { EditButton } from "./ui/edit-button"
import { Card } from "./ui/card"
import clsx from "clsx"

const formSchema = z.object({
  tema: z.string().min(1, "Tema é obrigatório"),
  criterios: z.record(z.string(), z.object({
    pontuacao: z.number().min(0).max(200)
  }))
})

type FormValues = z.infer<typeof formSchema>

interface FormularioAvaliacaoProps {
  temas: Tema[];
  criterios: Criterio[];
  alunoId: string;
  avaliacao?: Avaliacao & { criterios: CriterioAvaliacao[] };
}

export const FormularioAvaliacao = memo(function FormularioAvaliacao({ temas, criterios, alunoId, avaliacao }: FormularioAvaliacaoProps) {
  const [isOpen, setIsOpen] = useState(false)
  const isEditMode = !!avaliacao

  const defaultValues = useMemo(() => {
    if (isEditMode && avaliacao) {
      return {
        tema: String(avaliacao.temaId),
        criterios: avaliacao.criterios.reduce((acc, crit) => {
          acc[crit.criterioId] = { pontuacao: crit.pontuacao };
          return acc;
        }, {} as Record<string, { pontuacao: number }>)
      };
    }
    return {
      tema: "",
      criterios: {}
    };
  }, [isEditMode, avaliacao]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues
  })

  useEffect(() => {
    // Reset the form whenever the `avaliacao` prop changes
    form.reset(defaultValues);
  }, [avaliacao, form]); // Removed defaultValues from dependencies


  const getGradeColor = (grade: number, maxGrade: number) => {
    const percentage = (grade / maxGrade) * 100;
    if (percentage >= 75) return "bg-primary";
    if (percentage >= 50) return "bg-secondary";
    if (percentage >= 25) return "bg-secondary-foreground";
    return "bg-red-500";
  };

  const calcularNotaFinal = (criterios: Record<string, { pontuacao: number }>) => {
    return Object.values(criterios || {}).reduce((acc: number, curr: { pontuacao: number }) => acc + (curr?.pontuacao || 0), 0);
  };

  function transformarCriterios(criterios: Record<string, unknown>) {
    return Object.entries(criterios).map(([criterioId, data]) => {
      const criterioData = data as { pontuacao: number };
      return {
        criterioId: Number(criterioId),
        pontuacao: criterioData.pontuacao
      };
    });
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      if (!values.tema || !values.criterios) {
        throw new Error('Tema e critérios são obrigatórios');
      }

      const criteriosFormatados = transformarCriterios(values.criterios);
      const notaFinal = calcularNotaFinal(values.criterios);

      const dadosAvaliacao = {
        alunoId,
        temaId: Number(values.tema),
        criterios: criteriosFormatados,
        notaFinal
      };

      if (isEditMode && avaliacao) {
        await EditarAvaliacao(avaliacao.id, dadosAvaliacao);
        toast.success('Avaliação atualizada com sucesso');
      } else {
        await AdicionarAvaliacao(dadosAvaliacao);
        toast.success('Avaliação adicionada com sucesso');
      }

      setIsOpen(false);
      form.reset();

    } catch (error) {
      toast.error('Erro ao salvar a avaliação, tente novamente!')
      console.error('Erro ao enviar avaliação:', error);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => setIsOpen(open => !open)}>
      <DialogTrigger asChild>
        {isEditMode ?
          <EditButton /> :
          <Button variant="secondary">
            <Plus />
            <div className="max-sm:hidden flex gap-2">
              <span className="max-sm:hidden">Nova</span>
              Avaliação
            </div>
          </Button>
        }
      </DialogTrigger>
      <DialogContent className="max-sm:max-h-[94vh] max-sm:overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center max-sm:text-base">{isEditMode ? "Editar Avaliação" : "Adicionar Avaliação"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5">
            <FormField
              control={form.control}
              name="tema"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tema</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={String(field.value)}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder='Selecione um tema' />
                      </SelectTrigger>
                      <SelectContent>
                        {temas.map((tema) => (
                          <SelectItem key={tema.id} value={String(tema.id)}>{tema.nome}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <FormLabel>Competências</FormLabel>
              {criterios.map((criterion) => (
                <FormField
                  key={criterion.id}
                  control={form.control}
                  name={`criterios.${criterion.id}.pontuacao`}
                  render={({ field }) => {
                    const currentValue = field.value || 0;
                    return (
                      <FormItem>
                        <Card className="gap-2 p-4">
                          <div className="flex justify-between items-center">
                            <div className="space-y-1">
                              <FormLabel className="max-sm:text-sm">{criterion.id} - {criterion.nome}</FormLabel>
                              <FormDescription className="text-xs">{criterion.descricao}</FormDescription>
                            </div>
                            <div className="flex items-center gap-2">
                              <FormControl>
                                <Input
                                  type="number"
                                  className="w-16.5"
                                  value={currentValue}
                                  onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                                  min={0}
                                  max={200}
                                />
                              </FormControl>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-muted-foreground">0</span>
                            <span className="text-xs text-muted-foreground">200</span>
                          </div>
                          <Progress
                            value={(currentValue / 200) * 100}
                            indicatorClassName={getGradeColor(currentValue, 200)}
                          />
                          <FormMessage />
                        </Card>
                      </FormItem>
                    );
                  }}
                />
              ))}
            </div>

            <div className="flex flex-col justify-between items-center pt-4 gap-4 border-t border-muted">
              <div className="flex justify-between text-lg font-semibold w-full">
                <span>Nota Final:</span>
                <span>
                  {calcularNotaFinal(form.watch('criterios'))}/1000
                </span>
              </div>
              <div className="flex justify-center gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  className={clsx(form.formState.isSubmitting ? 'animate-fade-left animate-once hidden' : "min-w-[100px]")}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className={clsx(form.formState.isSubmitting ? 'animate-width-transition animate-once w-[216px]' : "min-w-[100px]")}
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {form.formState.isSubmitting ? 'Salvando' : 'Salvar'}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
});
