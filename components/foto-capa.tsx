'use client';
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Camera } from "lucide-react";
import { useContext, useRef, useState } from "react";
import { toast } from "sonner";
import { ContextoProfessor } from "@/context/contexto-professor";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "@/lib/firebase";
import { adicionarFotoCapa, adicionarLogo } from "@/actions/configuracoes";

// Constantes
const TAMANHO_MAXIMO_ARQUIVO_MB = 5
const TAMANHO_MAXIMO_ARQUIVO_BYTES = TAMANHO_MAXIMO_ARQUIVO_MB * 1024 * 1024
const TIPOS_IMAGEM_ACEITOS = ["image/jpeg", "image/png", "image/webp"]

// Mapeamento de MIME type para extensão de arquivo
const EXTENSOES_MIME: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
}

// Schema Zod para validação de arquivo de imagem
const schemaArquivoImagem = z.custom<File>(
    (valor) => valor instanceof File,
    { message: "Por favor, selecione uma imagem válida" }
).refine(
    (arquivo) => TIPOS_IMAGEM_ACEITOS.includes(arquivo.type),
    { message: "Formato inválido. Use JPEG, PNG ou WebP" }
).refine(
    (arquivo) => arquivo.size <= TAMANHO_MAXIMO_ARQUIVO_BYTES,
    { message: `A imagem deve ter no máximo ${TAMANHO_MAXIMO_ARQUIVO_MB}MB` }
)

// Schema Zod para validação do formulário completo
const schemaFotoCapa = z.object({
    fotoCapa: schemaArquivoImagem.optional(),
}).strict()

type FormFotoCapa = z.infer<typeof schemaFotoCapa>

/**
 * Cria uma URL de preview a partir de um arquivo
 */
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

export function FotoCapa() {
    const { configuracoes } = useContext(ContextoProfessor)

    const [previewFoto, setPreviewFoto] = useState<string | null>(configuracoes?.fotoCapa || "/foto-1.jpeg")
    const referenciaInputArquivo = useRef<HTMLInputElement>(null)

    const {
        handleSubmit,
        formState: { isSubmitting },
        watch,
        setValue,
    } = useForm<FormFotoCapa>({
        resolver: zodResolver(schemaFotoCapa),
        mode: "onChange",
    })

    const fotoSelecionada = watch("fotoCapa")
    const temAlteracao = Boolean(fotoSelecionada)

    // Atualizar preview ao selecionar arquivo
    const aoAlterarArquivo = async (evento: React.ChangeEvent<HTMLInputElement>) => {
        const arquivo = evento.target.files?.[0]
        if (!arquivo) return

        try {
            const urlPreviewGerada = await criarPreviewArquivo(arquivo)
            setPreviewFoto(urlPreviewGerada)
            setValue("fotoCapa", arquivo, { shouldValidate: true })
        } catch (erro) {
            toast.error("Erro ao processar imagem")
        }
    }

    const aoClicarNaFoto = () => {
        referenciaInputArquivo.current?.click()
    }

    const onSubmit = async (dados: FormFotoCapa) => {
        try {
            if (dados.fotoCapa) {
                const extensao = EXTENSOES_MIME[dados.fotoCapa.type] || "jpg"
                const caminhoArquivo = `configuracoes/foto-capa.${extensao}`
                const referenciaStorage = ref(storage, caminhoArquivo)
                await uploadBytes(referenciaStorage, dados.fotoCapa)
                const urlFotoCapa = await getDownloadURL(referenciaStorage)

                await adicionarFotoCapa(urlFotoCapa)
                toast.success("Imagem de capa atualizada com sucesso")
            }
        } catch (erro) {
            toast.error("Erro ao salvar imagem de capa")
        }
    }

    const cancelar = () => {
        setPreviewFoto(configuracoes?.fotoCapa || "/foto-1.jpeg")
        setValue("fotoCapa", undefined)
        if (referenciaInputArquivo.current) {
            referenciaInputArquivo.current.value = ""
        }
    }

    return (
        <Card className="h-full flex flex-col min-h-0">
            <CardHeader className="flex-shrink-0">
                <CardTitle>Imagem de Capa</CardTitle>
            </CardHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0">
                <CardContent className="flex flex-col gap-4 flex-1 min-h-0">
                    <div className="relative flex-1 min-h-0 flex flex-col items-center justify-center p-5 border-2 border-dashed border-muted hover:border-primary hover:bg-primary/5 rounded-lg overflow-hidden">
                        <input
                            type="file"
                            ref={referenciaInputArquivo}
                            onChange={aoAlterarArquivo}
                            className="hidden"
                            accept={TIPOS_IMAGEM_ACEITOS.join(",")}
                            aria-label="Selecionar imagem de capa"
                        />
                        {previewFoto && (
                            <Image
                                src={previewFoto}
                                alt="Imagem de Capa"
                                width={800}
                                height={900}
                                className="object-cover h-full w-full"
                            />
                        )}
                        <Button
                            type="button"
                            size='icon'
                            className="rounded-full absolute bottom-2 right-2"
                            onClick={aoClicarNaFoto}
                        >
                            <Camera />
                        </Button>
                    </div>

                    <div className="flex gap-4 flex-shrink-0">
                        <Button
                            type="button"
                            variant="ghost"
                            className="flex-1"
                            onClick={cancelar}
                            disabled={!temAlteracao || isSubmitting}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            variant={temAlteracao && !isSubmitting ? 'default' : 'ghost'}
                            className="flex-1"
                            disabled={!temAlteracao || isSubmitting}
                        >
                            {isSubmitting ? "Salvando..." : "Salvar"}
                        </Button>
                    </div>
                </CardContent>
            </form>
        </Card>
    )
}