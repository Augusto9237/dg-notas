'use client'

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Plus } from "lucide-react"
import { useState } from "react"
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
import { AdicionarTema } from "@/actions/avaliacao"
import { toast } from "sonner"

const formSchema = z.object({
  nome: z.string().min(3, "O tnomedeve ter pelo menos 3 caracteres"),
})

type FormValues = z.infer<typeof formSchema>

export function FormularioTema() {
  const [open, setOpen] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: "",
    },
  })

  async function onSubmit(values: FormValues) {
    try {
      const tema = await AdicionarTema(values.nome)
      toast.success(`O tema ${tema.nome} foi adicionado com sucesso`)
      form.reset()
      setOpen(false)
    } catch (error) {
      toast.error('Algo deu errado, tente novamente!')
      console.error('Erro ao criar tema:', error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary">
          <Plus />
          <span className="max-sm:hidden">Novo</span>
          Tema
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-center">Adicionar Novo Tema</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name='nome'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tema</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Digite o novo tema"
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
                {form.formState.isSubmitting ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}