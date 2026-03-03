'use server'
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { cacheLife, cacheTag, updateTag } from "next/cache";
import { headers } from "next/headers";

const R2_ENDPOINT = process.env.R2_ENDPOINT!
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID!
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY!
const R2_BUCKET = process.env.R2_BUCKET_NAME || "dg-app-videos"

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

interface VideoaulaProps {
    titulo: string;
    descricao: string;
    urlVideo: string;
}
export async function adicionarVideoaula(data: VideoaulaProps) {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session?.user || session.user.role !== 'admin') {
        throw new Error('Usuário não autorizado');
    }

    try {
        await prisma.videoaula.create({
            data: {
                titulo: data.titulo,
                descricao: data.descricao,
                urlVideo: data.urlVideo
            }
        })

        updateTag('listar-videoaulas')
        return true
    } catch (error) {
        console.log(error)
        return false
    }
}



export async function editarVideoaula(id: number, data: VideoaulaProps) {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session?.user || session.user.role !== 'admin') {
        throw new Error('Usuário não autorizado');
    }

    try {
        await prisma.videoaula.update({
            where: {
                id: id
            },
            data: {
                titulo: data.titulo,
                descricao: data.descricao,
                urlVideo: data.urlVideo
            }
        })

        updateTag('listar-videoaulas')
        return true
    } catch (error) {
        console.log(error)
        return false
    }
}

async function obterAulas(busca?: string, page: number = 1, limit: number = 12) {
    'use cache'

    cacheLife('hours')

    cacheTag('listar-videoaulas')

    try {
        const whereClause = {
            // Só aplica o filtro se busca for fornecida e não vazia
            ...(busca && busca.trim() !== '' && {
                titulo: {
                    contains: busca.trim(),
                    mode: 'insensitive' as const, // Case-insensitive
                },
            }),
        };

        const skip = (page - 1) * limit;

        const [videoaulas, total] = await Promise.all([
            prisma.videoaula.findMany({
                where: whereClause,
                skip,
                take: limit,
            }),
            prisma.videoaula.count({
                where: whereClause,
            })
        ])

        return {
            data: videoaulas,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            }
        };

    } catch (error) {
        console.error("Erro ao listar Videoaulas:", error);
        throw error;
    }
}

export async function listarVideoaulas(busca?: string, page: number = 1, limit: number = 12) {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session?.user) {
        throw new Error('Usuário não autorizado');
    }

    return await obterAulas(busca, page, limit);
}

export async function listarVideoaulaPorId(videoaulaId: number) {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session?.user) {
        throw new Error('Usuário não autorizado');
    }

    try {
        const videoaula = await prisma.videoaula.findUnique({
            where: {
                id: videoaulaId
            }
        });
        return videoaula;
    } catch (error) {
        console.error("Erro ao buscar Videoaula por ID:", error);
        throw error;
    }
}


export async function deletarVideoaula(videoaulaId: number) {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session?.user || session.user.role !== 'admin') {
        throw new Error('Usuário não autorizado');
    }

    try {
        // 1. Deletar registro do banco de dados
        await prisma.videoaula.delete({
            where: {
                id: videoaulaId
            }
        })

        // 2. Se delete do banco foi bem-sucedido, deletar arquivo do R2
        try {
            const deletarVideo = new DeleteObjectCommand({
                Bucket: R2_BUCKET,
                Key: `videoaulas/${videoaulaId}.mp4`,
            })
            await s3.send(deletarVideo)
        } catch (s3Error) {
            // Log erro do S3, mas não falha a operação
            console.error("Erro ao deletar arquivo do R2:", s3Error)
        }

        updateTag('listar-videoaulas')
        return true
    } catch (error) {
        console.error("Erro ao deletar videoaula:", error)
        return false
    }
}