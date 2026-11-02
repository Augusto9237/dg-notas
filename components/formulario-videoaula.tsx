'use client'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { ChevronDown, ClosedCaption, FileVideoCamera, Pencil, Plus, X } from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
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
import { adicionarVideoaulaAoModulo, editarVideoaula } from "@/actions/videoaulas"
import { Dropzone, DropzoneContent, DropzoneEmptyState } from "./kibo-ui/dropzone";
import { Card, CardContent } from "./ui/card"
import { Progress } from "./ui/progress"
import clsx from "clsx"
import { useUploadR2 } from "@/hooks/use-upload-r2"
import { Textarea } from "./ui/textarea"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible"

const esquemaFormulario = z.object({
  moduloId: z.number().int().positive("Selecione um módulo"),
  titulo: z.string().min(3, "O titulo do video deve ter pelo menos 3 caracteres"),
  descricao: z.string().min(3, "A descrição deve ter pelo menos 3 caracteres"),
  criarExercicio: z.boolean(),
  exercicioTitulo: z.string(),
  exercicioEnunciado: z.string(),
  notaMaxima: z.number(),
}).superRefine((valores, contexto) => {
  if (!valores.criarExercicio) return

  if (valores.exercicioTitulo.trim().length < 3) {
    contexto.addIssue({
      code: "custom",
      path: ["exercicioTitulo"],
      message: "O título do exercício deve ter pelo menos 3 caracteres",
    })
  }

  if (valores.exercicioEnunciado.trim().length < 3) {
    contexto.addIssue({
      code: "custom",
      path: ["exercicioEnunciado"],
      message: "O enunciado deve ter pelo menos 3 caracteres",
    })
  }

  if (!Number.isInteger(valores.notaMaxima) || valores.notaMaxima < 1) {
    contexto.addIssue({
      code: "custom",
      path: ["notaMaxima"],
      message: "A nota máxima deve ser um número inteiro maior que zero",
    })
  }
})

type ValoresFormulario = z.infer<typeof esquemaFormulario>

interface FormularioTemaProps {
  aula?: VideoaulaComExercicio
  modulos?: {
    id: number
    titulo: string
  }[]
}

export type VideoaulaComExercicio = Videoaula & {
  exercicio: {
    id: number
    titulo: string
    enunciado: string
    notaMaxima: number
    disponivel: boolean
  } | null
}

async function obterMetadadosVideo(arquivo: File) {
  const url = URL.createObjectURL(arquivo)
  const video = document.createElement("video")
  video.preload = "metadata"
  video.muted = true

  try {
    const metadataLoaded = new Promise<void>((resolve, reject) => {
      video.addEventListener("loadedmetadata", () => resolve(), { once: true })
      video.addEventListener("error", () => reject(new Error("Não foi possível ler os dados do vídeo.")), { once: true })
    })
    video.src = url
    await metadataLoaded

    if (!Number.isFinite(video.duration) || video.duration <= 0 || !video.videoWidth || !video.videoHeight) {
      throw new Error("O arquivo não contém duração ou dimensões de vídeo válidas.")
    }

    const frameLoaded = new Promise<void>((resolve, reject) => {
      video.addEventListener("seeked", () => resolve(), { once: true })
      video.addEventListener("error", () => reject(new Error("Não foi possível gerar a miniatura do vídeo.")), { once: true })
    })
    video.currentTime = Math.min(1, video.duration / 2)
    await frameLoaded

    const canvas = document.createElement("canvas")
    canvas.width = 640
    canvas.height = Math.round(640 * video.videoHeight / video.videoWidth)
    const contexto = canvas.getContext("2d")
    if (!contexto) throw new Error("Não foi possível preparar a miniatura do vídeo.")
    contexto.drawImage(video, 0, 0, canvas.width, canvas.height)

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.85))
    if (!blob) throw new Error("Não foi possível gerar a miniatura do vídeo.")

    return {
      duracao: Math.ceil(video.duration),
      miniatura: new File([blob], "miniatura.jpg", { type: "image/jpeg" }),
    }
  } finally {
    video.pause()
    video.removeAttribute("src")
    URL.revokeObjectURL(url)
  }
}

export function FormularioVideoaula({ aula, modulos = [] }: FormularioTemaProps) {
  const router = useRouter()
  const [estaAberto, setEstaAberto] = useState(false)
  const [exercicioAberto, setExercicioAberto] = useState(false)
  const [arquivo, setArquivo] = useState<File[] | undefined>();
  const [visualizarArquivo, setVisualizarArquivo] = useState<string | undefined>();
  const ehModoEdicao = !!aula
  const temExercicio = !!aula?.exercicio

  const { progresso, uploadParaR2 } = useUploadR2()

  const formulario = useForm<ValoresFormulario>({
    resolver: zodResolver(esquemaFormulario),
    defaultValues: {
      moduloId: aula?.moduloId || 0,
      titulo: aula?.titulo || "",
      descricao: aula?.descricao || "",
      criarExercicio: !!aula?.exercicio,
      exercicioTitulo: aula?.exercicio?.titulo ?? "",
      exercicioEnunciado: aula?.exercicio?.enunciado ?? "",
      notaMaxima: aula?.exercicio?.notaMaxima ?? 100,
    },
  })
  const criarExercicio = formulario.watch("criarExercicio")

  useEffect(() => {
    if (estaAberto) {
      formulario.reset({
        moduloId: aula?.moduloId || 0,
        titulo: aula?.titulo || "",
        descricao: aula?.descricao || "",
        criarExercicio: temExercicio,
        exercicioTitulo: aula?.exercicio?.titulo ?? "",
        exercicioEnunciado: aula?.exercicio?.enunciado ?? "",
        notaMaxima: aula?.exercicio?.notaMaxima ?? 100,
      })
      setExercicioAberto(temExercicio)
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
    const arquivoSelecionado = arquivo?.[0]

    if (!arquivoSelecionado && !ehModoEdicao) {
      toast.error("Por favor, selecione um arquivo de vídeo antes de enviar.")
      return;
    }

    let metadadosVideo: Awaited<ReturnType<typeof obterMetadadosVideo>> | undefined
    if (arquivoSelecionado && !ehModoEdicao) {
      try {
        metadadosVideo = await obterMetadadosVideo(arquivoSelecionado)
      } catch (error) {
        toast.error("Não foi possível ler o vídeo selecionado.")
        console.error("Erro ao processar o vídeo:", error)
        return
      }
    }

    let urlVideo: string
    const nomeArquivoVideo = `${crypto.randomUUID()}.${arquivoSelecionado?.name.split('.').pop() || 'mp4'}`

    if (arquivoSelecionado) {
      try {
        const { urlPublica } = await uploadParaR2(arquivoSelecionado, nomeArquivoVideo)
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
        const sucesso = await editarVideoaula(aula!.id, {
          ...dados,
          exercicio: valores.criarExercicio
            ? {
              titulo: valores.exercicioTitulo,
              enunciado: valores.exercicioEnunciado,
              notaMaxima: valores.notaMaxima,
            }
            : undefined,
        })
        if (!sucesso) throw new Error("Falha ao editar")
        toast.success(
          valores.criarExercicio
            ? temExercicio
              ? `O exercício "${valores.exercicioTitulo}" foi atualizado com sucesso`
              : `O exercício "${valores.exercicioTitulo}" foi adicionado à videoaula`
            : "A videoaula foi atualizada com sucesso"
        )
      } else {
        if (!arquivoSelecionado) {
          throw new Error("O arquivo do vídeo não está disponível.")
        }

        if (!metadadosVideo) {
          throw new Error("Os dados do vídeo não foram carregados.")
        }
        const { urlPublica: urlThumbnail } = await uploadParaR2(
          metadadosVideo.miniatura,
          `miniatura-${nomeArquivoVideo}.jpg`
        )
        const sucesso = await adicionarVideoaulaAoModulo({
          ...dados,
          moduloId: valores.moduloId,
          urlThumbnail,
          duracao: metadadosVideo.duracao,
          exercicio: valores.criarExercicio
            ? {
              titulo: valores.exercicioTitulo,
              enunciado: valores.exercicioEnunciado,
              notaMaxima: valores.notaMaxima,
            }
            : undefined,
        })
        if (!sucesso) throw new Error("Falha ao adicionar")
        toast.success(
          valores.criarExercicio
            ? `A videoaula e o exercício "${valores.exercicioTitulo}" foram criados com sucesso`
            : `A videoaula "${valores.titulo}" foi adicionada com sucesso`
        )
      }

      formulario.reset({
        moduloId: 0,
        titulo: "",
        descricao: "",
        criarExercicio: false,
        exercicioTitulo: "",
        exercicioEnunciado: "",
        notaMaxima: 100,
      })
      setExercicioAberto(false)
      setArquivo(undefined)
      setVisualizarArquivo(undefined)
      setEstaAberto(false)
      router.refresh()
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
              name="moduloId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Módulo</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(Number(value))}
                    value={field.value > 0 ? field.value.toString() : ""}
                  >
                    <FormControl>
                      <SelectTrigger
                        className="w-full"
                        onBlur={field.onBlur}
                        ref={field.ref}
                        disabled={formulario.formState.isSubmitting}
                      >
                        <SelectValue placeholder="Selecione um módulo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectGroup>
                        {modulos.map((modulo) => (
                          <SelectItem key={modulo.id} value={modulo.id.toString()}>
                            {modulo.titulo}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
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
              <Collapsible
                open={exercicioAberto}
                onOpenChange={(open) => {
                  setExercicioAberto(open)
                  formulario.setValue("criarExercicio", temExercicio || open)
                }}
                className="rounded-md border px-4"
              >
                <div className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium">
                      {temExercicio ? "Exercício cadastrado" : "Exercício da aula"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {temExercicio
                        ? "Você pode revisar e atualizar as instruções."
                        : "Opcional. Adicione uma atividade para os alunos."}
                    </p>
                  </div>
                  <CollapsibleTrigger asChild>
                    <Button
                      type="button"
                      variant={exercicioAberto ? "ghost" : "outline"}
                      size="icon"
                      disabled={formulario.formState.isSubmitting}
                    >
                      {exercicioAberto ? (
                        <>
                          <X/>
                        </>
                      ) : temExercicio ? (
                        <>
                          <Pencil />
                        </>
                      ) : (
                        <>
                          <Plus />
                        </>
                      )}
                    </Button>
                  </CollapsibleTrigger>
                </div>

                <CollapsibleContent className="space-y-4 border-t py-4">
                  <div className="space-y-4">
                    <FormField
                      control={formulario.control}
                      name="exercicioTitulo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Título do exercício</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Ex.: Atividade sobre o conteúdo"
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
                      name="exercicioEnunciado"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Enunciado</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Descreva o que o aluno deve fazer"
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
                      name="notaMaxima"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nota máxima</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={1}
                              step={1}
                              disabled={formulario.formState.isSubmitting}
                              value={field.value || ""}
                              onChange={(event) => {
                                const valor = event.target.valueAsNumber
                                field.onChange(Number.isNaN(valor) ? 0 : valor)
                              }}
                              onBlur={field.onBlur}
                              name={field.name}
                              ref={field.ref}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CollapsibleContent>
              </Collapsible>

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
                    moduloId: aula?.moduloId || 0,
                    titulo: aula?.titulo || "",
                    descricao: aula?.descricao || "",
                    criarExercicio: temExercicio,
                    exercicioTitulo: aula?.exercicio?.titulo ?? "",
                    exercicioEnunciado: aula?.exercicio?.enunciado ?? "",
                    notaMaxima: aula?.exercicio?.notaMaxima ?? 100,
                  })
                  setExercicioAberto(false)
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