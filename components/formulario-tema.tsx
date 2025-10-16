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
import { AdicionarTema, EditarTema } from "@/actions/avaliacao"
import { toast } from "sonner"
import { Tema } from "@/app/generated/prisma"
import { EditButton } from "./ui/edit-button"


const formSchema = z.object({
  nome: z.string().min(3, "O nome do tema deve ter pelo menos 3 caracteres"),
})

type FormValues = z.infer<typeof formSchema>

interface FormularioTemaProps {
  tema?: Tema
}

export function FormularioTema({ tema }: FormularioTemaProps) {
  const [isOpen, setIsOpen] = useState(false)
  const isEditMode = !!tema

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: tema?.nome || "",
    },
  })

  useEffect(() => {
    if (isOpen) {
      form.reset({
        nome: tema?.nome || "",
      })
    }
  }, [isOpen, tema, form])

  async function onSubmit(values: FormValues) {
    try {
      if (isEditMode) {
        const updatedTema = await EditarTema(tema.id, values.nome)
        toast.success(`O tema ${updatedTema.nome} foi atualizado com sucesso`)
      } else {
        const newTema = await AdicionarTema(values.nome)
        toast.success(`O tema ${newTema.nome} foi adicionado com sucesso`)
      }
      form.reset()
      setIsOpen(false)
    } catch (error) {
      toast.error("Algo deu errado, tente novamente!")
      console.error("Erro ao salvar tema:", error)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {isEditMode ?
          <div>
            <Button className="max-md:hidden">
              <Pencil />
              Editar
            </Button>
            <div className="md:hidden">
              <EditButton/>
            </div>
          </div>

          :
          <Button variant="secondary">
            <Plus />
            <div className="max-sm:hidden flex gap-2">
              <span className="max-sm:hidden">Novo</span>
              Tema
            </div>
          </Button>
        }
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-center">
            {isEditMode ? "Editar Tema" : "Adicionar Tema"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tema</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={isEditMode ? "Edite o tema" : "Digite o novo tema"}
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
                {form.formState.isSubmitting ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
