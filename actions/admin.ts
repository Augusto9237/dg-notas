'use server'

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { headers } from "next/headers";

type AtualizarContaProfessorParams = {
  email: string;
  name: string;
  telefone: string;
  especialidade: string;
  bio: string;
  image?: string;
}

export async function obterProfessorPorId(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId
      }
    })
    return user
  } catch (error) {
    return null
  }
}

export async function atualizarContaProfessor(userId: string, data: AtualizarContaProfessorParams, senhaAtual?: string, novaSenha?: string) {
  try {

    if (senhaAtual && novaSenha) {
      const passwordUpdate = await auth.api.changePassword({
        body: {
          newPassword: novaSenha,
          currentPassword: senhaAtual,
          revokeOtherSessions: true,
        },
        headers: await headers(),
      });
    }

    const user = await prisma.user.update({
      where: {
        id: userId
      },
      data: {
        email: data.email,
        name: data.name,
        telefone: data.telefone,
        especialidade: data.especialidade,
        bio: data.bio,
        image: data.image
      }
    })

    revalidatePath('/professor/conta')

    return {
      success: true,
      message: 'Usuário atualizado com sucesso',
      data: user
    }
  } catch (error) {
    return {
      success: false,
      message: 'Erro ao atualizar usuário',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }
  }
}

export async function banirUsuario(userId: string) {
  try {
    await auth.api.banUser({
      body: {
        userId: userId, // required
        banReason: "Spamming",
        banExpiresIn: 60 * 60 * 24 * 7,
      },
      // This endpoint requires session cookies.
      headers: await headers(),
    });
  }
  catch (error) {
    console.log(error)
  }
}
