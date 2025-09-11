'use server'

import { prisma } from "@/lib/prisma";

// Função para listar alunos que fizeram login apenas com o Google
export async function ListarAlunosGoogle() {
    try {
        // Considerando que o model User tem um campo 'provider' ou similar para identificar o login via Google
        // Caso utilize outro campo, ajuste conforme necessário
        const alunos = await prisma.user.findMany({
            where: {
                accounts: {
                    every: {
                        providerId: 'google'
                    }
                }
            }
        });
        return alunos;
    } catch (error) {
        console.error("Erro ao listar alunos do Google:", error);
        throw error;
    }
}
