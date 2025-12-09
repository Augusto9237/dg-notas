'use client'

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Plus } from "lucide-react"
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
import { Textarea } from "./ui/textarea"
import { enviarNotificacaoParaTodos } from "@/actions/notificacoes"


const esquemaFormulario = z.object({
  nome: z.string().min(3, "O nome do tema deve ter pelo menos 3 caracteres"),
})

type ValoresFormulario = z.infer<typeof esquemaFormulario>

interface FormularioTemaProps {
  tema?: Tema
}

export function FormularioTema({ tema }: FormularioTemaProps) {
  const [estaAberto, setEstaAberto] = useState(false)
  const ehModoEdicao = !!tema

  const formulario = useForm<ValoresFormulario>({
    resolver: zodResolver(esquemaFormulario),
    defaultValues: {
      nome: tema?.nome || "",
    },
  })

  useEffect(() => {
    if (estaAberto) {
      formulario.reset({
        nome: tema?.nome || "",
      })
    }
  }, [estaAberto, tema, formulario])

  async function aoEnviar(valores: ValoresFormulario) {
    try {
      if (ehModoEdicao) {
        const atualizarTema = await EditarTema(tema.id, valores.nome)
        toast.success(`O tema ${atualizarTema.nome} foi atualizado com sucesso`)
      } else {
        const novoTema = await AdicionarTema(valores.nome)
        toast.success(`O tema ${novoTema.nome} foi adicionado com sucesso`)

        // Envia notificações para todos os alunos
        try {
          const resultado = await enviarNotificacaoParaTodos(
            'user',
            'Novo tema disponível!',
            `O tema "${novoTema.nome}" foi adicionado`,
            '/aluno/avaliacoes'
          )

          if (resultado.successCount > 0) {
            toast.info(`📲 Notificações enviadas para ${resultado.successCount} aluno(s)`)
          }
        } catch (erroNotificacao) {
          console.error('Erro ao enviar notificações:', erroNotificacao)
          // Não bloqueia o fluxo se notificações falharem
          toast.warning('Tema adicionado, mas houve erro ao enviar notificações')
        }
      }
      formulario.reset()
      setEstaAberto(false)
    } catch (error) {
      toast.error("Algo deu errado, tente novamente!")
      console.error("Erro ao salvar tema:", error)
    }
  }

  return (
    <Dialog open={estaAberto} onOpenChange={setEstaAberto}>
      <DialogTrigger asChild>
        {ehModoEdicao ?
          <EditButton />
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
            {ehModoEdicao ? "Editar Tema" : "Adicionar Tema"}
          </DialogTitle>
        </DialogHeader>
        <Form {...formulario}>
          <form onSubmit={formulario.handleSubmit(aoEnviar)} className="space-y-4">
            <FormField
              control={formulario.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tema</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={ehModoEdicao ? "Edite o tema" : "Digite o novo tema"}
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
                  formulario.reset()
                  setEstaAberto(false)
                }}
                className="min-w-[100px]"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="min-w-[100px]"
                disabled={formulario.formState.isSubmitting}
              >
                {formulario.formState.isSubmitting ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
