'use client'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { FileVideoCamera, Plus } from "lucide-react"
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
import { toast } from "sonner"
import { Videoaula } from "@/app/generated/prisma"
import { EditButton } from "./ui/edit-button"
import { adicionarVideoaula, editarVideoaula } from "@/actions/videoaulas"
import { Dropzone, DropzoneContent, DropzoneEmptyState } from "./kibo-ui/dropzone";
import { Card, CardContent } from "./ui/card"
import { Progress } from "./ui/progress"
import clsx from "clsx"
import { useUploadR2 } from "@/hooks/use-upload-r2"
import { Textarea } from "./ui/textarea"

const esquemaFormulario = z.object({
  titulo: z.string().min(3, "O titulo do video deve ter pelo menos 3 caracteres"),
  descricao: z.string().min(3, "A descrição deve ter pelo menos 3 caracteres"),
})

type ValoresFormulario = z.infer<typeof esquemaFormulario>

interface FormularioTemaProps {
  aula?: Videoaula
}

export function FormularioVideoaula({ aula }: FormularioTemaProps) {
  const [estaAberto, setEstaAberto] = useState(false)
  const [arquivo, setArquivo] = useState<File[] | undefined>();
  const [visualizarArquivo, setVisualizarArquivo] = useState<string | undefined>();
  const ehModoEdicao = !!aula

  const { progresso, uploadParaR2 } = useUploadR2()

  const formulario = useForm<ValoresFormulario>({
    resolver: zodResolver(esquemaFormulario),
    defaultValues: {
      titulo: aula?.titulo || "",
      descricao: aula?.descricao || ""
    },
  })

  useEffect(() => {
    if (estaAberto) {
      formulario.reset({
        titulo: aula?.titulo || "",
        descricao: aula?.descricao || "",
      })
      setArquivo(undefined)
      setVisualizarArquivo(undefined)
    }
  }, [estaAberto, aula, formulario])

  const handleDrop = (files: File[]) => {
    setArquivo(files);
    if (files.length > 0) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (typeof e.target?.result === "string") {
          setVisualizarArquivo(e.target?.result);
        }
      };
      reader.readAsDataURL(files[0]);
    }
  };

  async function aoEnviar(valores: ValoresFormulario) {
    const temArquivoNovo = arquivo && arquivo.length > 0

    if (!temArquivoNovo && !ehModoEdicao) {
      toast.error("Por favor, selecione um arquivo de vídeo antes de enviar.")
      return;
    }

    let urlVideo: string

    if (temArquivoNovo && arquivo![0]) {
      const extensao = arquivo![0].name.split('.').pop() || 'mp4'
      const nomeArquivo = `${valores.titulo}.${extensao}`

      try {
        const { urlPublica } = await uploadParaR2(arquivo![0], nomeArquivo)
        urlVideo = urlPublica
      } catch (error) {
        toast.error("Falha ao enviar o vídeo para o Cloudflare R2. Tente novamente.")
        console.error("Erro no upload:", error)
        return
      }
    } else if (ehModoEdicao && aula?.urlVideo) {
      urlVideo = aula.urlVideo
    } else {
      toast.error("Por favor, selecione um arquivo de vídeo antes de enviar.")
      return
    }

    try {
      const dados = {
        titulo: valores.titulo,
        descricao: valores.descricao,
        urlVideo,
      }

      if (ehModoEdicao) {
        const sucesso = await editarVideoaula(aula!.id, dados)
        if (!sucesso) throw new Error("Falha ao editar")
        toast.success("A videoaula foi atualizada com sucesso")
      } else {
        const sucesso = await adicionarVideoaula(dados)
        if (!sucesso) throw new Error("Falha ao adicionar")
        toast.success(`A videoaula "${valores.titulo}" foi adicionada com sucesso`)
      }

      formulario.reset({ titulo: "", descricao: "" })
      setArquivo(undefined)
      setVisualizarArquivo(undefined)
      setEstaAberto(false)
    } catch (error) {
      toast.error("Algo deu errado, tente novamente!")
      console.error("Erro ao salvar videoaula:", error)
    }
  }

  return (
    <Dialog
      open={estaAberto}
      onOpenChange={(open) => {
        // Prevenir fechamento enquanto está enviando
        if (!open && formulario.formState.isSubmitting) {
          return
        }
        setEstaAberto(open)
        if (!open) {
          setArquivo(undefined)
          setVisualizarArquivo(undefined)
        }
      }}
    >
      <DialogTrigger asChild>
        {ehModoEdicao ?
          <EditButton />
          :
          <Button variant="secondary">
            <Plus />
            <div className="max-sm:hidden flex gap-2">
              <span className="max-sm:hidden">Nova</span>
              Aula
            </div>
          </Button>
        }
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-center">
            {ehModoEdicao ? "Editar Aula" : "Adicionar Aula"}
          </DialogTitle>
        </DialogHeader>
        <Form {...formulario}>
          <form onSubmit={formulario.handleSubmit(aoEnviar)} className="space-y-4">
            <FormField
              control={formulario.control}
              name="titulo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Titulo</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={ehModoEdicao ? "Edite o título da videoaula" : "Digite o titulo da videoaula"}
                      {...field}
                      disabled={formulario.formState.isSubmitting}
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
                      placeholder={ehModoEdicao ? "Edite o tema" : "Digite a descrição da videoaula"}
                      disabled={formulario.formState.isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Dropzone
              accept={{ "videos": [".mp4"] }}
              onDrop={handleDrop}
              onError={() => toast.error('Formato de arquivo não suportado!')}
              src={arquivo}
              maxFiles={1}
              disabled={formulario.formState.isSubmitting}
              className="p-4"
            >
              <DropzoneEmptyState />
              <DropzoneContent>
                {arquivo && arquivo[0] && (
                  <Card className="py-4 rounded-md w-full">
                    <CardContent className="flex gap-2 items-center justify-start px-4">
                      <FileVideoCamera className="size-8" />
                      <div className="w-full">
                        <p className="text-start text-xs mb-2 truncate">{arquivo[0].name}</p>
                        <Progress value={progresso} className="w-full" />
                      </div>
                    </CardContent>
                  </Card>
                )}
              </DropzoneContent>
            </Dropzone>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <Button
                type="button"
                variant='ghost'
                className={clsx("w-full", formulario.formState.isSubmitting ? 'hidden' : '')}
                onClick={() => {
                  formulario.reset({
                    titulo: aula?.titulo || "",
                    descricao: aula?.descricao || "",
                  })
                  setArquivo(undefined)
                  setVisualizarArquivo(undefined)
                  setEstaAberto(false)
                }}

              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={formulario.formState.isSubmitting}
                className={clsx("w-full", formulario.formState.isSubmitting ? 'col-span-2' : '')}
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