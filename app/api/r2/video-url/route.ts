// app/api/r2/video-url/route.ts
//
// Gera uma URL pré-assinada temporária para reprodução de vídeo.
// O aluno nunca acessa o R2 diretamente — sempre via esta rota.
//
// Fluxo:
// 1. Frontend envia a "chave" do vídeo (ex: videoaulas/123-aula.mp4)
// 2. Servidor verifica se o usuário está autenticado
// 3. Servidor gera URL assinada com expiração curta (2 horas)
// 4. Frontend usa a URL para reprodução — expira e não pode ser redistribuída

import { NextResponse } from "next/server"
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { auth } from "@/lib/auth"

const R2_ENDPOINT = process.env.R2_ENDPOINT!
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID!
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY!
const R2_BUCKET = process.env.R2_BUCKET_NAME || "dg-app-videos"

// Tempo de expiração da URL em segundos
// 2 horas — suficiente para assistir a aula, curto o suficiente para não vazar
const EXPIRACAO_SEGUNDOS = 60 * 60 * 2

export async function POST(request: Request) {
  try {
    // ── Autenticação ──────────────────────────────────────────────────────────
    // Garante que só alunos autenticados obtêm URLs de reprodução
    const sessao = await auth.api.getSession({
      headers: request.headers,
    })
    if (!sessao?.user) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      )
    }

    // ── Validação ─────────────────────────────────────────────────────────────
    const { chave } = await request.json()

    if (!chave || typeof chave !== "string") {
      return NextResponse.json(
        { error: "chave do vídeo é obrigatória" },
        { status: 400 }
      )
    }

    // Bloqueia tentativas de path traversal (ex: "../../secrets")
    if (chave.includes("..") || chave.includes("//")) {
      return NextResponse.json(
        { error: "chave inválida" },
        { status: 400 }
      )
    }

    // ── Geração da URL assinada ───────────────────────────────────────────────
    const s3 = new S3Client({
      region: "auto",
      endpoint: R2_ENDPOINT,
      credentials: {
        accessKeyId: R2_ACCESS_KEY_ID,
        secretAccessKey: R2_SECRET_ACCESS_KEY,
      },
      requestChecksumCalculation: "WHEN_REQUIRED",
      responseChecksumValidation: "WHEN_REQUIRED",
    })

    const comando = new GetObjectCommand({
      Bucket: R2_BUCKET,
      Key: chave,
      // Força o browser a reproduzir ao invés de baixar
      ResponseContentDisposition: "inline",
    })

    const urlAssinada = await getSignedUrl(s3, comando, {
      expiresIn: EXPIRACAO_SEGUNDOS,
    })

    // Loga o acesso para auditoria (opcional mas recomendado)
    console.log(`🎬 URL de vídeo gerada | usuário: ${sessao.user.email} | chave: ${chave}`)

    return NextResponse.json({
      url: urlAssinada,
      // Informa o frontend quando a URL expira para renovar automaticamente
      expiraEm: new Date(Date.now() + EXPIRACAO_SEGUNDOS * 1000).toISOString(),
    })
  } catch (error) {
    console.error("Erro ao gerar URL de vídeo:", error)
    return NextResponse.json(
      { error: "Erro ao gerar URL de reprodução" },
      { status: 500 }
    )
  }
}