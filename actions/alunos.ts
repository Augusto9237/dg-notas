'use server'
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

// Função para listar alunos que fizeram login apenas com o Google
export async function listarAlunosGoogle(busca?: string) {
    const session = await auth.api.getSession({
        headers: await headers()
    })
    if (!session) {
        throw new Error("Usuário não autenticado")
    }
    if (session.user.role !== 'admin') {
        throw new Error("Usuário não autorizado")
    }
    
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
                avaliacoesComoAluno: true
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

export async function alterarStatusMatriculaAluno(idAluno: string, matriculado: boolean) {
    const session = await auth.api.getSession({
        headers: await headers()
    })
    if (!session) {
        throw new Error("Usuário não autenticado")
    }
    if (session.user.role !== 'admin') {
        throw new Error("Usuário não autorizado")
    }
    try {
        await prisma.user.update({
            where: {
                id: idAluno
            }, data: {
                matriculado: matriculado
            }
        })
        revalidatePath('/professor/alunos')
    } catch (error) {
        console.error("Erro ao atualizar o status da matricula do aluno:", error);
        throw error;
    }
}