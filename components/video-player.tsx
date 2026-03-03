'use client'
import React, { useRef, useCallback, useState } from 'react'
import { Spinner } from './ui/spinner'
import { Button } from './ui/button'
import { Play } from 'lucide-react'
import Image from 'next/image'

interface VideoPlayerProps {
    videoUrl: string  // chave do R2: "videoaulas/123-Aula-1.mp4"
}

// Extrai a chave limpa de qualquer formato que possa estar salvo no banco
// Casos suportados:
//   "videoaulas/123.mp4"                                          → chave direta ✅
//   "14327823...cloudflarestorage.com/app-videos/videoaulas/123"  → legado sem http ✅
//   "https://pub-xxx.r2.dev/videoaulas/123.mp4"                  → URL pública ✅
//   "https://bucket.accountid.cloudflarestorage.com/..."         → URL privada ✅
function extrairChave(videoUrl: string): string {
    if (!videoUrl) return videoUrl

    const bucketName = process.env.NEXT_PUBLIC_R2_BUCKET_NAME || ''

    // Normaliza para URL completa para facilitar o parse
    const urlCompleta = videoUrl.startsWith("http") ? videoUrl : `https://${videoUrl}`

    try {
        const url = new URL(urlCompleta)

        // Pega só o pathname e remove a barra inicial
        let path = url.pathname.replace(/^\//, "")

        // Remove o nome do bucket se estiver no início do path
        // "app-videos/videoaulas/123.mp4" → "videoaulas/123.mp4"
        if (path.startsWith(`${bucketName}/`)) {
            path = path.substring(bucketName.length + 1)
        }

        // Decodifica espaços e caracteres especiais (%20 → " ")
        return decodeURIComponent(path)
    } catch {
        // Fallback: remove tudo antes do primeiro "videoaulas/"
        const match = videoUrl.match(/(videoaulas\/.+)/)
        if (match) return decodeURIComponent(match[1])
        return videoUrl
    }
}

export default function VideoPlayer({ videoUrl }: VideoPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null)
    const [urlAssinada, setUrlAssinada] = useState<string | null>(null)
    const [carregando, setCarregando] = useState(false)
    const [erro, setErro] = useState<string | null>(null)
    const [playerAtivo, setPlayerAtivo] = useState(false)
    const expiracaoRef = useRef<Date | null>(null)

    const buscarUrlAssinada = useCallback(async () => {
        setCarregando(true)
        setErro(null)

        try {
            const chave = extrairChave(videoUrl)
            console.log("🔑 Chave enviada para assinatura:", chave)

            const resposta = await fetch("/api/r2/video-url", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ chave }),
            })

            if (!resposta.ok) throw new Error("Não foi possível obter a URL do vídeo")

            const { url, expiraEm } = await resposta.json()
            setUrlAssinada(url)
            expiracaoRef.current = new Date(expiraEm)
        } catch (error) {
            console.error("Erro ao buscar URL assinada:", error)
            setErro("Não foi possível carregar o vídeo. Tente novamente.")
        } finally {
            setCarregando(false)
        }
    }, [videoUrl])

    const handlePlay = useCallback(async () => {
        setPlayerAtivo(true)

        const agora = new Date()
        const expiracaoProxima = expiracaoRef.current &&
            (expiracaoRef.current.getTime() - agora.getTime()) < 10 * 60 * 1000

        if (!urlAssinada || expiracaoProxima) {
            await buscarUrlAssinada()
        }
    }, [urlAssinada, buscarUrlAssinada])


    if (erro) {
        return (
            <div className="w-full aspect-video flex flex-col items-center justify-center gap-3 bg-muted text-muted-foreground rounded-md text-sm">
                <p>{erro}</p>
                <button
                    onClick={() => { setErro(null); setPlayerAtivo(false) }}
                    className="text-xs underline hover:no-underline"
                >
                    Tentar novamente
                </button>
            </div>
        )
    }

    if (!playerAtivo) {
        return (
            <div className="w-full aspect-video relative cursor-pointer group">
                <Image
                    src="/Sublogo1.svg"
                    alt="Thumbnail"
                    className="w-full h-full object-cover rounded-md"
                    width={0}
                    height={0}
                    sizes="100vw"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-md group-hover:bg-black/50 transition-colors">
                    {carregando ? (
                        <Spinner />
                    ) : (
                        <Button className='rounded-full size-12 hover:cursor-pointer' onClick={handlePlay}>
                            <Play />
                        </Button>
                    )}
                </div>
            </div>
        )
    }

    if (!urlAssinada) {
        return (
            <div className="w-full aspect-video flex items-center justify-center bg-muted rounded-md">
                <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            </div>
        )
    }

    return (
        <div className="w-full aspect-video">
            <video
                ref={videoRef}
                className="w-full h-full rounded-md"
                controls
                autoPlay
                controlsList="nodownload"
                preload="metadata"
                onContextMenu={(e) => e.preventDefault()}
                onError={(e) => {
                    const video = e.currentTarget
                    const source = video.querySelector('source')
                    console.error("❌ Erro no vídeo:", {
                        url: source?.src,
                        erro: video.error?.code,
                        mensagem: video.error?.message,
                        networkState: video.networkState,
                        readyState: video.readyState,
                    })
                    setErro("Erro ao reproduzir o vídeo. Tente novamente.")
                }}
            >
                <source src={urlAssinada} type="video/mp4" />
                Seu navegador não suporta reprodução de vídeo.
            </video>
        </div>
    )
}