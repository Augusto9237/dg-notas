'use client'

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Plus, Pencil } from "lucide-react"
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { AdicionarTema, EditarCriterio, EditarTema } from "@/actions/avaliacao"
import { toast } from "sonner"
import { Criterio, Tema } from "@/app/generated/prisma"
import { EditButton } from "./ui/edit-button"


const formSchema = z.object({
  nome: z.string().min(3, "O nome da competência deve ter pelo menos 3 caracteres"),
  descricao: z.string().min(3, "A descrição da competência deve ter pelo menos 3 caracteres"),
  pontuacaoMax: z.number().min(1, "A pontuação máxima deve ser maior que 0"),
})

type FormValues = z.infer<typeof formSchema>

interface FormularioCriterioProps {
  criterio?: Criterio
}

export function FormularioCriterio({ criterio }: FormularioCriterioProps) {
  const [open, setOpen] = useState(false)
  const isEditMode = !!criterio

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: criterio?.nome || "",
      descricao: criterio?.descricao || "",
      pontuacaoMax: criterio?.pontuacaoMax || 0,
    },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        nome: criterio?.nome || "",
        descricao: criterio?.descricao || "",
        pontuacaoMax: criterio?.pontuacaoMax || 0,
      })
    }
  }, [open, criterio, form])

  async function onSubmit(values: FormValues) {
    try {
      if (isEditMode) {

        const update = await EditarCriterio(
          criterio!.id,
          values.nome,
          values.descricao,
          values.pontuacaoMax,
        )

        toast.success(`O tema ${update.nome} foi atualizado com sucesso`)
      }
      form.reset()
      setOpen(false)
    } catch (error) {
      toast.error("Algo deu errado, tente novamente!")
      console.error("Erro ao salvar tema:", error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isEditMode ?
          <EditButton /> :
          <Button variant="secondary">
            <Plus />
            <span className="max-sm:hidden">Novo</span>
            Tema
          </Button>
        }
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-center">
            {isEditMode ? "Editar Competencia" : "Adicionar Novo Tema"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Digite o nome da competência"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="descricao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Digite a descrição da competência"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="pontuacaoMax"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pontuação máxima</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Digite a pontuação máxima da competência"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-center gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  form.reset()
                  setOpen(false)
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
                {form.formState.isSubmitting ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
