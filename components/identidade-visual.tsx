'use client'
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Camera } from "lucide-react";
import { useContext, useRef, useState } from "react";
import { toast } from "sonner";
import { ContextoProfessor } from "@/context/contexto-professor";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { core, z } from "zod";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "@/lib/firebase";
import { adicionarLogo } from "@/actions/configuracoes";
import { FormularioCor } from "./formulario-cor";
import { Form, FormField, FormItem, FormControl, FormMessage, FormDescription } from "./ui/form";

// Constantes
const TAMANHO_MAXIMO_ARQUIVO_MB = 5
const TAMANHO_MAXIMO_ARQUIVO_BYTES = TAMANHO_MAXIMO_ARQUIVO_MB * 1024 * 1024
const TIPOS_IMAGEM_ACEITOS = ["image/png", "image/svg+xml", "image/x-icon"]

// Mapeamento de MIME type para extensão de arquivo
const EXTENSOES_MIME: Record<string, string> = {
    "image/png": "png",
    "image/svg+xml": "svg",
}

// Schema Zod para validação de arquivo de imagem
const schemaArquivoImagem = z.custom<File>(
    (valor) => valor instanceof File,
    { message: "Por favor, selecione uma imagem válida" }
).refine(
    (arquivo) => TIPOS_IMAGEM_ACEITOS.includes(arquivo.type),
    { message: "Formato inválido. Use PNG, JPEG, SVG ou WebP" }
).refine(
    (arquivo) => arquivo.size <= TAMANHO_MAXIMO_ARQUIVO_BYTES,
    { message: `A imagem deve ter no máximo ${TAMANHO_MAXIMO_ARQUIVO_MB}MB` }
)

// Schema Zod para validação do formulário completo
const schemaIdentidadeVisual = z.object({
    logoSistema: schemaArquivoImagem.optional(),
    logoAplicativo: schemaArquivoImagem.optional(),
    favicon: schemaArquivoImagem.optional(),
    coresSistema: z.array(z.object({
        id: z.number().optional(),
        cor: z.string(),
        valor: z.string(),
    })).length(4, "Selecione exatamente 4 cores para o sistema")
})

type FormIdentidadeVisual = z.infer<typeof schemaIdentidadeVisual>

// Labels das cores do sistema
const LABELS_CORES_SISTEMA = ["Primária 1", "Primária 2", "Secundária 1", "Secundária 2"]

function criarPreviewArquivo(arquivo: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const leitor = new FileReader()
        leitor.onloadend = () => {
            if (typeof leitor.result === "string") {
                resolve(leitor.result)
            } else {
                reject(new Error("Erro ao ler arquivo"))
            }
        }
        leitor.onerror = () => reject(new Error("Erro ao ler arquivo"))
        leitor.readAsDataURL(arquivo)
    })
}


export function IdentidadeVisual() {
    const { configuracoes } = useContext(ContextoProfessor)
    const [previewLogo, setPreviewLogo] = useState<string | null>(configuracoes?.logoSistema || null)
    const [previewIcone, setPreviewIcone] = useState<string | null>(configuracoes?.logoAplicativo || null)
    const [previewFavicon, setPreviewFavicon] = useState<string | null>(configuracoes?.favicon || null)
    const referenciaInputArquivoIcone = useRef<HTMLInputElement>(null)
    const referenciaInputArquivoLogo = useRef<HTMLInputElement>(null)
    const referenciaInputArquivoFavicon = useRef<HTMLInputElement>(null)

    const [editMode, setEditMode] = useState(false)

    const form = useForm<FormIdentidadeVisual>({
        resolver: zodResolver(schemaIdentidadeVisual),
        defaultValues: {
            coresSistema: configuracoes?.coresSistema || [{ cor: "", valor: "" }, { cor: "", valor: "" }, { cor: "", valor: "" }, { cor: "", valor: "" }],
        },
    })


    async function aoAlterarArquivo(
        evento: React.ChangeEvent<HTMLInputElement>,
        modo: "icone" | "logo" | "favicon"
    ) {
        const arquivo = evento.target.files?.[0]
        if (!arquivo) return

        try {
            const urlPreviewGerada = await criarPreviewArquivo(arquivo)
            switch (modo) {
                case "icone":
                    setPreviewIcone(urlPreviewGerada)
                    form.setValue("logoAplicativo", arquivo, { shouldValidate: true })
                    setEditMode(true)
                    break
                case "logo":
                    setPreviewLogo(urlPreviewGerada)
                    form.setValue("logoSistema", arquivo, { shouldValidate: true })
                    setEditMode(true)
                    break
                case "favicon":
                    setPreviewFavicon(urlPreviewGerada)
                    form.setValue("favicon", arquivo, { shouldValidate: true })
                    setEditMode(true)
                    break
                default:
                    setEditMode(false)
                    break
            }
        } catch (erro) {
            toast.error("Erro ao processar imagem")
        }
    }

    const aoClicarNoLogo = () => {
        referenciaInputArquivoLogo.current?.click()
    }

    const aoClicarNoIcone = () => {
        referenciaInputArquivoIcone.current?.click()
    }

    const aoClicarNoFavicon = () => {
        referenciaInputArquivoFavicon.current?.click()
    }

    const aoAlterarCor = (indice: number, novaCor: string) => {
        const novasCores = [...form.getValues("coresSistema")]
        const atual = novasCores[indice]
        novasCores[indice] = { ...atual, valor: novaCor }
        form.setValue("coresSistema", novasCores, { shouldValidate: true })
        setEditMode(true)
    }

    const onSubmit = async (dados: FormIdentidadeVisual) => {
        try {
            let urlLogoSistema = configuracoes?.logoSistema!
            let urlLogoAplicativo = configuracoes?.logoAplicativo!
            let urlFavicon = configuracoes?.favicon!

            if (dados.logoSistema) {
                const extensao = EXTENSOES_MIME[dados.logoSistema.type] || "bin"
                const caminhoArquivo = `configuracoes/logo-sistema.${extensao}`
                const referenciaStorage = ref(storage, caminhoArquivo)
                await uploadBytes(referenciaStorage, dados.logoSistema)
                urlLogoSistema = await getDownloadURL(referenciaStorage)
            }
            if (dados.logoAplicativo) {
                const extensao = EXTENSOES_MIME[dados.logoAplicativo.type] || "bin"
                const caminhoArquivo = `configuracoes/logo-aplicativo.${extensao}`
                const referenciaStorage = ref(storage, caminhoArquivo)
                await uploadBytes(referenciaStorage, dados.logoAplicativo)
                urlLogoAplicativo = await getDownloadURL(referenciaStorage)
            }
            if (dados.favicon) {
                const extensao = EXTENSOES_MIME[dados.favicon.type] || "bin"
                const caminhoArquivo = `configuracoes/favicon.${extensao}`
                const referenciaStorage = ref(storage, caminhoArquivo)
                await uploadBytes(referenciaStorage, dados.favicon)
                urlFavicon = await getDownloadURL(referenciaStorage)
            }

            await adicionarLogo(urlLogoAplicativo, urlLogoSistema, urlFavicon, dados.coresSistema)
            toast.success("Identidade visual atualizada com sucesso")
            setEditMode(false)
        } catch (erro) {
            toast.error("Erro ao salvar identidade visual")
        }
    }


    function cancelar() {
        setPreviewLogo(configuracoes?.logoSistema || null)
        setPreviewIcone(configuracoes?.logoAplicativo || null)
        form.setValue("logoSistema", undefined)
        form.setValue("logoAplicativo", undefined)
        form.setValue("favicon", undefined)
        form.setValue("coresSistema", configuracoes?.coresSistema || [{ cor: "", valor: "" }, { cor: "", valor: "" }, { cor: "", valor: "" }, { cor: "", valor: "" }])
        setEditMode(false)
    }


    return (
        <Card className="h-full flex flex-col min-h-0">
            <CardHeader className="flex-shrink-0">
                <CardTitle >Identidade Visual</CardTitle>
            </CardHeader>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0">
                    <CardContent className="flex flex-col gap-5 flex-1 min-h-0">
                        <FormField
                            control={form.control}
                            name="logoSistema"
                            render={({ field: { ref: _ref, value: _value, onChange, ...fieldProps } }) => (
                                <FormItem className="flex-1 min-h-0 flex flex-col">
                                    <FormControl className="flex-1 min-h-0">
                                        <div className="relative flex flex-col gap-4 items-center justify-center p-5 border-2 border-dashed border-muted hover:border-primary hover:bg-primary/5 rounded-lg">
                                            <input
                                                type="file"
                                                ref={referenciaInputArquivoLogo}
                                                onChange={(e) => {
                                                    onChange(e)
                                                    aoAlterarArquivo(e, "logo")
                                                }}
                                                className="hidden"
                                                accept={TIPOS_IMAGEM_ACEITOS.join(",")}
                                                aria-label="Selecionar logo do sistema"
                                                {...fieldProps}
                                            />
                                            {previewLogo && (
                                                <Image
                                                    src={previewLogo}
                                                    alt="Logo do sistema"
                                                    width={50}
                                                    height={50}
                                                    className="object-cover h-full max-h-15 w-[70%]"
                                                />
                                            )}
                                            <div className="text-center">
                                                <p className="font-semibold text-sm">Logo do Sistema</p>
                                                <p className="text-xs text-muted-foreground">PNG, SVG ou JPEG. Máx 5MB.</p>
                                            </div>
                                            <Button
                                                type="button"
                                                size='icon'
                                                className="rounded-full absolute bottom-2 right-2"
                                                onClick={aoClicarNoLogo}
                                            >
                                                <Camera />
                                            </Button>
                                        </div>
                                    </FormControl>
                                    <FormDescription>Selecione a logo do Sistema</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Logo do Aplicativo */}
                        <FormField
                            control={form.control}
                            name="logoAplicativo"
                            render={({ field: { ref: _refIcone, value: _valIcone, onChange, ...fieldProps } }) => (
                                <FormItem className="flex-1 min-h-0 flex flex-col">
                                    <FormControl className="flex-1 min-h-0">
                                        <div className="relative flex flex-col items-center justify-center p-5 border-2 border-dashed border-muted hover:border-primary hover:bg-primary/5 rounded-lg">
                                            <input
                                                type="file"
                                                ref={referenciaInputArquivoIcone}
                                                onChange={(e) => {
                                                    onChange(e)
                                                    aoAlterarArquivo(e, "icone")
                                                }}
                                                className="hidden"
                                                accept={TIPOS_IMAGEM_ACEITOS.join(",")}
                                                aria-label="Selecionar logo do aplicativo"
                                                {...fieldProps}
                                            />
                                            {previewIcone && (
                                                <Image
                                                    src={previewIcone}
                                                    alt="Logo do aplicativo"
                                                    width={32}
                                                    height={32}
                                                    className="object-contain h-full max-h-16 w-full"
                                                />
                                            )}
                                            <div className="text-center">
                                                <p className="font-semibold text-sm">Logo do Aplicativo</p>
                                                <p className="text-xs text-muted-foreground">PNG, SVG ou JPEG. Máx 5MB.</p>
                                            </div>
                                            <Button
                                                type="button"
                                                size='icon'
                                                className="rounded-full absolute bottom-2 right-2"
                                                onClick={aoClicarNoIcone}
                                            >
                                                <Camera />
                                            </Button>
                                        </div>
                                    </FormControl>
                                    <FormDescription>Selecione a logo do Aplicativo</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Favicon */}
                        <FormField
                            control={form.control}
                            name="favicon"
                            render={({ field: { ref: _refFav, value: _valFav, onChange, ...fieldProps } }) => (
                                <FormItem className="flex-1 min-h-0 flex flex-col">
                                    <FormControl className="flex-1 min-h-0">
                                        <div className="relative flex flex-col items-center justify-center p-5 border-2 border-dashed border-muted hover:border-primary hover:bg-primary/5 rounded-lg">
                                            <input
                                                type="file"
                                                ref={referenciaInputArquivoFavicon}
                                                onChange={(e) => {
                                                    onChange(e)
                                                    aoAlterarArquivo(e, "favicon")
                                                }}
                                                className="hidden"
                                                accept="image/x-icon"
                                                aria-label="Selecionar favicon do aplicativo"
                                                {...fieldProps}
                                            />
                                            {previewFavicon && (
                                                <Image
                                                    src={previewFavicon}
                                                    alt="Favicon do aplicativo"
                                                    width={32}
                                                    height={32}
                                                    className="object-contain h-full max-h-10 w-full"
                                                />
                                            )}
                                            <div className="text-center">
                                                <p className="font-semibold text-sm">Favicon</p>
                                                <p className="text-xs text-muted-foreground">Apenas ICO. Máx 5MB.</p>
                                            </div>
                                            <Button
                                                type="button"
                                                size='icon'
                                                className="rounded-full absolute bottom-2 right-2"
                                                onClick={aoClicarNoFavicon}
                                            >
                                                <Camera />
                                            </Button>
                                        </div>
                                    </FormControl>
                                    <FormDescription>Selecione o icone do Sistema/Aplicativo</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex flex-col gap-2 flex-shrink-0">
                            <label htmlFor="cores-sistema" className="text-sm font-medium">Cores do Sistema</label>
                            <div className="grid grid-cols-2 gap-4">
                                {form.watch("coresSistema").map((cor, indice) => (
                                    <FormularioCor
                                        key={indice}
                                        cor={cor.valor}
                                        label={cor.cor}
                                        onChange={(novasCor) => aoAlterarCor(indice, novasCor)}
                                    />
                                ))}
                            </div>
                            <FormDescription>Defina as cores do Sistema/Aplicativo</FormDescription>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Button
                                type="button"
                                variant="ghost"
                                className="flex-1"
                                onClick={cancelar}
                                disabled={!editMode || form.formState.isSubmitting}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                variant={editMode && !form.formState.isSubmitting ? 'default' : 'ghost'}
                                className="flex-1"
                                disabled={!editMode || form.formState.isSubmitting}
                            >
                                {form.formState.isSubmitting ? "Salvando..." : "Salvar"}
                            </Button>
                        </div>
                    </CardContent>
                </form>
            </Form>
        </Card>
    )
}