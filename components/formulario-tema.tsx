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

const formSchema = z.object({
  tema: z.string().min(3, "O tema deve ter pelo menos 3 caracteres"),
})

type FormValues = z.infer<typeof formSchema>

export function FormularioTema() {
  const [open, setOpen] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tema: "",
    },
  })

  async function onSubmit(values: FormValues) {
    try {
      // Adicione aqui a lógica para salvar o tema
      console.log('Novo tema:', values)

      form.reset()
      setOpen(false)
    } catch (error) {
      console.error('Erro ao criar tema:', error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary">
          <Plus />
          Novo Tema
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
              name="tema"
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