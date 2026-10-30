'use client'

import { zodResolver } from "@hookform/resolvers/zod"
import { Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"
import * as z from "zod"
import {
  adicionarModulo,
  editarModulo,
} from "@/actions/modulos"
import type { Modulo } from "@/app/generated/prisma"
import { toast } from "sonner"
import { EditButton } from "./ui/edit-button"
import { Button } from "./ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form"
import { Input } from "./ui/input"
import { Textarea } from "./ui/textarea"

const esquemaFormulario = z.object({
  nome: z.string().trim().min(3, "O nome do módulo deve ter pelo menos 3 caracteres"),
  descricao: z.string().trim().min(3, "A descrição deve ter pelo menos 3 caracteres"),
})

type ValoresFormulario = z.infer<typeof esquemaFormulario>

interface FormularioModuloVideoaulaProps {
  modulo?: Modulo
}

export function FormularioModuloVideoaula({ modulo }: FormularioModuloVideoaulaProps) {
  const router = useRouter()
  const [estaAberto, setEstaAberto] = useState(false)
  const ehModoEdicao = !!modulo

  const formulario = useForm<ValoresFormulario>({
    resolver: zodResolver(esquemaFormulario),
    defaultValues: {
      nome: modulo?.nome ?? "",
      descricao: modulo?.descricao ?? "",
    },
  })

  function alterarEstado(open: boolean) {
    if (!open && formulario.formState.isSubmitting) return

    if (open) {
      formulario.reset({
        nome: modulo?.nome ?? "",
        descricao: modulo?.descricao ?? "",
      })
    }

    setEstaAberto(open)
  }

  async function aoEnviar(valores: ValoresFormulario) {
    try {
      const sucesso = modulo
        ? await editarModulo(modulo.id, valores)
        : await adicionarModulo(valores)

      if (!sucesso) {
        throw new Error("A operação não foi concluída.")
      }

      toast.success(
        modulo
          ? `O módulo "${valores.nome}" foi atualizado com sucesso.`
          : `O módulo "${valores.nome}" foi criado com sucesso.`
      )
      setEstaAberto(false)
      formulario.reset({ nome: "", descricao: "" })
      router.refresh()
    } catch (error) {
      console.error("Erro ao salvar módulo:", error)
      toast.error("Não foi possível salvar o módulo. Tente novamente.")
    }
  }

  return (
    <Dialog open={estaAberto} onOpenChange={alterarEstado}>
      <DialogTrigger asChild>
        {ehModoEdicao ? (
          <EditButton />
        ) : (
          <Button variant="outline">
            <Plus />
            <span>Novo módulo</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-center">
            {ehModoEdicao ? "Editar módulo" : "Adicionar módulo"}
          </DialogTitle>
        </DialogHeader>

        <Form {...formulario}>
          <form onSubmit={formulario.handleSubmit(aoEnviar)} className="space-y-4">
            <FormField
              control={formulario.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Digite o nome do módulo"
                      disabled={formulario.formState.isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={formulario.control}
              name="descricao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Digite a descrição do módulo"
                      disabled={formulario.formState.isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4 pt-4">
              <Button
                type="button"
                variant="ghost"
                disabled={formulario.formState.isSubmitting}
                onClick={() => alterarEstado(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={formulario.formState.isSubmitting}>
                {formulario.formState.isSubmitting ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
