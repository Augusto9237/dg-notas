"use client"
import { User } from "@/app/generated/prisma"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardTitle,
    CardHeader,
    CardContent,
    CardFooter,
} from "@/components/ui/card"
import { authClient } from "@/lib/auth-client"
import { storage } from "@/lib/firebase"
import { ref, uploadBytes } from "firebase/storage"
import { Camera } from "lucide-react"
import React, { useRef, useState } from "react"
import { toast } from "sonner"

// Constantes
const CAMINHO_STORAGE_PERFIL = "perfil"
const EXTENSAO_IMAGEM = ".jpg"
const TAMANHO_MAXIMO_ARQUIVO_MB = 5
const TAMANHO_MAXIMO_ARQUIVO_BYTES = TAMANHO_MAXIMO_ARQUIVO_MB * 1024 * 1024

// Mensagens
const MENSAGENS = {
    SUCESSO_UPLOAD: "Foto de perfil atualizada com sucesso",
    ERRO_UPLOAD: "Erro ao atualizar foto de perfil",
    ERRO_ARQUIVO_INVALIDO: "Por favor, selecione uma imagem válida",
    ERRO_ARQUIVO_MUITO_GRANDE: `A imagem deve ter no máximo ${TAMANHO_MAXIMO_ARQUIVO_MB}MB`,
} as const

interface InputFotoPerfilProps {
    professor: User
    fotoPerfil: string | null
}

/**
 * Gera as iniciais do nome do professor (máximo 2 letras)
 */
function obterIniciaisNome(nome: string): string {
    return nome
        .split(" ")
        .map((palavra) => palavra.charAt(0))
        .join("")
        .toUpperCase()
        .slice(0, 2)
}

/**
 * Valida se o arquivo é uma imagem válida
 */
function validarArquivoImagem(arquivo: File): string | null {
    if (!arquivo.type.startsWith("image/")) {
        return MENSAGENS.ERRO_ARQUIVO_INVALIDO
    }

    if (arquivo.size > TAMANHO_MAXIMO_ARQUIVO_BYTES) {
        return MENSAGENS.ERRO_ARQUIVO_MUITO_GRANDE
    }

    return null
}

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

/**
 * Componente para upload e visualização de foto de perfil do professor
 */
export default function InputFotoPerfil({
    professor,
    fotoPerfil,
}: InputFotoPerfilProps) {
    const [urlPreview, setUrlPreview] = useState<string | null>(null)
    const [imagemSelecionada, setImagemSelecionada] = useState<File | null>(null)
    const [carregando, setCarregando] = useState(false)
    const referenciaInputArquivo = useRef<HTMLInputElement>(null)
    const { refetch } = authClient.useSession()

    const aoAlterarArquivo = async (
        evento: React.ChangeEvent<HTMLInputElement>
    ) => {
        const arquivo = evento.target.files?.[0]
        if (!arquivo) return

        const erroValidacao = validarArquivoImagem(arquivo)
        if (erroValidacao) {
            toast.error(erroValidacao)
            return
        }

        try {
            const urlPreviewGerada = await criarPreviewArquivo(arquivo)
            setUrlPreview(urlPreviewGerada)
            setImagemSelecionada(arquivo)
        } catch (erro) {
            toast.error(MENSAGENS.ERRO_ARQUIVO_INVALIDO)
        }
    }

    const aoClicarNoIcone = () => {
        referenciaInputArquivo.current?.click()
    }

    const aoCancelar = () => {
        setUrlPreview(null)
        setImagemSelecionada(null)
        if (referenciaInputArquivo.current) {
            referenciaInputArquivo.current.value = ""
        }
    }

    const salvarImagem = async () => {
        if (!imagemSelecionada || !professor?.id) return

        setCarregando(true)

        try {
            const caminhoArquivo = `${CAMINHO_STORAGE_PERFIL}/${professor.id}${EXTENSAO_IMAGEM}`
            const referenciaStorage = ref(storage, caminhoArquivo)
            await uploadBytes(referenciaStorage, imagemSelecionada)

            toast.success(MENSAGENS.SUCESSO_UPLOAD)
            setImagemSelecionada(null)
            setUrlPreview(null)
            await refetch()
        } catch (erro) {
            console.error("Erro ao fazer upload da imagem:", erro)
            toast.error(MENSAGENS.ERRO_UPLOAD)
        } finally {
            setCarregando(false)
        }
    }

    const urlImagemExibida = urlPreview || fotoPerfil || ""
    const nomeProfessor = professor?.name || ""
    const iniciais = obterIniciaisNome(nomeProfessor)
    const temPreviewPendente = Boolean(urlPreview && imagemSelecionada)

    return (
        <Card className="w-full items-center overflow-hidden">
            <CardHeader className="w-full justify-center mt-2">
                <CardTitle>Perfil</CardTitle>
            </CardHeader>
            <CardContent className="h-full p-0">
                <div className="flex flex-col items-center gap-5 justify-center flex-1 p-8 relative">
                    <input
                        type="file"
                        ref={referenciaInputArquivo}
                        onChange={aoAlterarArquivo}
                        className="hidden"
                        accept="image/*"
                        aria-label="Selecionar foto de perfil"
                    />
                    <div className="relative group w-full">
                        <Avatar className="size-full min-size-full min-h-full border-4 border-primary shadow-md shadow-foreground/20">
                            <AvatarImage
                                src={urlImagemExibida}
                                alt={nomeProfessor || "Avatar"}
                                className="object-cover"
                            />
                            <AvatarFallback className="text-2xl">
                                {iniciais}
                            </AvatarFallback>
                        </Avatar>
                        <div
                            className="absolute inset-0 bg-primary/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full cursor-pointer"
                            onClick={aoClicarNoIcone}
                            role="button"
                            tabIndex={0}
                            aria-label="Alterar foto de perfil"
                            onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                    e.preventDefault()
                                    aoClicarNoIcone()
                                }
                            }}
                        >
                            <Camera size={40} className="text-card" />
                        </div>
                    </div>

                    <div className="text-center space-y-2 p-2">
                        <CardTitle className="text-primary">
                            {nomeProfessor}
                        </CardTitle>
                        <Badge variant="secondary">
                            {professor?.especialidade}
                        </Badge>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="w-full">
                {temPreviewPendente && (
                    <div
                        className={`grid gap-5 w-full ${
                            carregando ? "grid-cols-1" : "grid-cols-2"
                        }`}
                    >
                        {!carregando && (
                            <Button variant="ghost" onClick={aoCancelar}>
                                Cancelar
                            </Button>
                        )}
                        <Button
                            disabled={carregando}
                            onClick={salvarImagem}
                            className={carregando ? "col-span-1" : ""}
                        >
                            {carregando ? "Salvando..." : "Salvar"}
                        </Button>
                    </div>
                )}
            </CardFooter>
        </Card>
    )
}