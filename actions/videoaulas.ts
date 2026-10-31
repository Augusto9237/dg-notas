'use server'
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { cacheLife, cacheTag, updateTag } from "next/cache";
import { headers } from "next/headers";
import type { Prisma } from "@/app/generated/prisma";
import { TERMOS_CATEGORIAS_VIDEOAULA } from "@/lib/videoaula-categorias";
import type { CategoriaVideoaula } from "@/lib/videoaula-categorias";

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

interface VideoaulaModuloProps extends VideoaulaProps {
    moduloId: number;
    urlThumbnail: string;
    duracao: number;
}

export async function adicionarVideoaulaAoModulo(data: VideoaulaModuloProps) {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session?.user || session.user.role !== 'admin') {
        throw new Error('Usuário não autorizado');
    }

    if (
        !Number.isInteger(data.moduloId) ||
        data.moduloId <= 0 ||
        !data.titulo.trim() ||
        !data.descricao.trim() ||
        !data.urlVideo.trim() ||
        !data.urlThumbnail.trim() ||
        !Number.isInteger(data.duracao) ||
        data.duracao <= 0
    ) {
        throw new Error('Dados inválidos para adicionar videoaula ao módulo.');
    }

    try {
        await prisma.videoaula.create({
            data: {
                titulo: data.titulo,
                descricao: data.descricao,
                urlVideo: data.urlVideo,
                urlThumbnail: data.urlThumbnail,
                duracao: data.duracao,
                tags: [],
                modulo: {
                    connect: {
                        id: data.moduloId
                    }
                }
            }
        })

        updateTag('listar-videoaulas')
        return true
    } catch (error) {
        console.error("Erro ao adicionar videoaula ao módulo:", error)
        return false
    }
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


async function obterAulas(
    busca?: string,
    page: number = 1,
    limit: number = 12,
    categoria?: CategoriaVideoaula
) {
    'use cache'

    cacheLife('hours')

    cacheTag('listar-videoaulas')

    try {
        const conditions: Prisma.VideoaulaWhereInput[] = [];

        if (busca?.trim()) {
            conditions.push({
                OR: [
                    { titulo: { contains: busca.trim(), mode: 'insensitive' } },
                    { descricao: { contains: busca.trim(), mode: 'insensitive' } },
                ],
            });
        }

        if (categoria) {
            const termos = TERMOS_CATEGORIAS_VIDEOAULA[categoria];
            conditions.push({
                OR: termos.flatMap((termo) => [
                    { titulo: { contains: termo, mode: 'insensitive' } },
                    { descricao: { contains: termo, mode: 'insensitive' } },
                ]),
            });
        }

        const whereClause: Prisma.VideoaulaWhereInput =
            conditions.length > 1
                ? { AND: conditions }
                : conditions[0] ?? {};

        const skip = (page - 1) * limit;

        const [videoaulas, total] = await Promise.all([
            prisma.videoaula.findMany({
                where: whereClause,
                skip,
                take: limit,
                include: {
                    professor: {
                        select: {
                            name: true,
                            image: true,
                            especialidade: true,
                        },
                    },
                },
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

export async function listarVideoaulas(
    busca?: string,
    page: number = 1,
    limit: number = 12,
    categoria?: CategoriaVideoaula
) {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session?.user) {
        throw new Error('Usuário não autorizado');
    }

    return await obterAulas(busca, page, limit, categoria);
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
            },
            select: {
                id: true,
                titulo: true,
                descricao: true,
                urlVideo: true,
                professor: {
                    select: {
                        id: true,
                        name: true,
                        especialidade: true,
                        image: true
                    }
                }
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