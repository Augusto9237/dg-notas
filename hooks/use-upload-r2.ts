'use client'
import { useState, useCallback } from "react"

interface ResultadoUpload {
  urlPublica: string
  chave: string
}

export function useUploadR2() {
  const [progresso, setProgresso] = useState(0)
  const [fazendoUpload, setFazendoUpload] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  const uploadParaR2 = useCallback(async (arquivo: File, nomeArquivo: string): Promise<ResultadoUpload> => {
    setFazendoUpload(true)
    setProgresso(0)
    setErro(null)

    try {
      // 1. Obter URL de upload do R2
      const respostaUrl = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nomeArquivo,
          tipoArquivo: arquivo.type || "video/mp4",
        }),
      })

      if (!respostaUrl.ok) throw new Error("Falha ao obter URL de upload do R2")

      const { uploadUrl, fileUrl, chave, tipoArquivo } = await respostaUrl.json()

      // 2. Fazer upload para a URL assinada usando XMLHttpRequest com streaming
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest()

        xhr.upload.addEventListener("progress", (evento) => {
          if (evento.lengthComputable) {
            setProgresso(Math.round((evento.loaded / evento.total) * 100))
          }
        })

        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve()
          } else {
            reject(new Error(`Upload falhou: ${xhr.status} — ${xhr.responseText}`))
          }
        })

        xhr.addEventListener("error", () => reject(new Error("Erro de rede durante o upload")))
        xhr.addEventListener("abort", () => reject(new Error("Upload cancelado")))

        xhr.open("PUT", uploadUrl)
        xhr.setRequestHeader("Content-Type", tipoArquivo)
        xhr.send(arquivo)
      })

      return { urlPublica: fileUrl, chave }
    } catch (error) {
      const mensagem = error instanceof Error ? error.message : "Erro desconhecido"
      setErro(mensagem)
      throw error
    } finally {
      setFazendoUpload(false)
    }
  }, [])

  return { progresso, fazendoUpload, erro, uploadParaR2 }
}
