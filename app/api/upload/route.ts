import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { auth } from "@/lib/auth";

const R2_ENDPOINT = process.env.R2_ENDPOINT;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET = process.env.R2_BUCKET_NAME

if (!R2_ENDPOINT || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
  throw new Error("Missing R2 environment variables (R2_ENDPOINT, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY)");
}

const s3Client = new S3Client({
  region: "auto",
  endpoint: R2_ENDPOINT,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

export async function POST(request: Request) {
  const sessao = await auth.api.getSession({
    headers: request.headers,
  })
 
  if (!sessao?.user || sessao?.user.role !== 'admin') {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const { nomeArquivo, tipoArquivo } = await request.json();

    if (!nomeArquivo) {
      return NextResponse.json({ error: "nomeArquivo é obrigatório" }, { status: 400 });
    }

    const chave = `videoaulas/${Date.now()}-${nomeArquivo}`;

    const comando = new PutObjectCommand({
      Bucket: R2_BUCKET,  // ← Bucket correto
      Key: chave,
      ContentType: tipoArquivo || "video/mp4",
    });

    const uploadUrl = await getSignedUrl(s3Client, comando, {
      expiresIn: 3600,
    });

    const fileUrl = `${process.env.R2_ENDPOINT?.replace("https://", "")}/app-videos/${chave}`;

    return NextResponse.json({
      uploadUrl,
      fileUrl,
      chave,
      tipoArquivo: tipoArquivo || "video/mp4",
    });
  } catch (error) {
    console.error("Erro:", error);
    return NextResponse.json({ error: "Erro ao gerar URL de upload" }, { status: 500 });
  }
}
