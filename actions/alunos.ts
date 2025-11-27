'use server'
import { prisma } from "@/lib/prisma";

// Função para listar alunos que fizeram login apenas com o Google
export async function listarAlunosGoogle(busca?: string) {
    try {
        // Construir o where clause dinamicamente
        const clasulaDeFiltro = {
            accounts: {
                every: {
                    providerId: 'google'
                }
            },
            banned: false, // Adicionado filtro para usuários não banidos
            ...(busca && busca.trim() !== '' && {
                email: {
                    contains: busca.trim(),
                    mode: 'insensitive' as const, // Case-insensitive
                },
            }),
        }
        const alunos = await prisma.user.findMany({
            where: clasulaDeFiltro,
            include: {
                Avaliacao: true
            }
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


export async function adicionarTelefone(id: string, telefone: string) {
    try {
        const aluno = await prisma.user.update({
            where: {
                id: id,
            },
            data: {
                telefone: telefone,
            },
        });
        return {
            success: true,
            message: 'Telefone adicionado com sucesso',
            aluno
        }
    } catch (error) {
        console.error("Erro ao adicionar telefone");
        throw error;
    }
}