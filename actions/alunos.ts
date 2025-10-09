'use server'
import { prisma } from "@/lib/prisma";

// Função para listar alunos que fizeram login apenas com o Google
export async function ListarAlunosGoogle(busca?: string) {
    try {
        // Construir o where clause dinamicamente
        const whereClause = {
            accounts: {
                every: {
                    providerId: 'google'
                }
            },
            ...(busca && busca.trim() !== '' && {
                email: {
                    contains: busca.trim(),
                    mode: 'insensitive' as const, // Case-insensitive
                },
            }),
        }
        const alunos = await prisma.user.findMany({
            where: whereClause
        });
        return alunos;
    } catch (error) {
        console.error("Erro ao listar alunos do Google:", error);
        throw error;
    }
}


// Função para buscar um aluno pelo id, que tenha apenas providerId 'google'
export async function BuscarAlunoGooglePorId(id: string) {
    try {
        const aluno = await prisma.user.findFirst({
            where: {
                id: id,
                accounts: {
                    every: {
                        providerId: 'google'
                    }
                }
            }
        });
        return aluno;
    } catch (error) {
        console.error("Erro ao buscar aluno do Google por ID:", error);
        throw error;
    }
}
