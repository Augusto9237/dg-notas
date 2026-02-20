'use server'
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
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

        revalidatePath('/professor/videoaulas')
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

        revalidatePath('/professor/videoaulas')
        return true
    } catch (error) {
        console.log(error)
        return false
    }
}


export async function listarVideoaulas(busca?: string, page: number = 1, limit: number = 12) {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session?.user) {
        throw new Error('Usuário não autorizado');
    }

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

        const [videoaulas, total] = await Promise.all([
            prisma.videoaula.findMany({
                where: whereClause
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
        await prisma.videoaula.delete({
            where: {
                id: videoaulaId
            }
        })

        return true
    } catch (error) {
        console.log(error)

        return false
    }
}