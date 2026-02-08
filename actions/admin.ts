'use server'

import { auth } from "@/lib/auth";
import { obterUrlImagem } from "@/lib/obter-imagem";
import { prisma } from "@/lib/prisma"
import { cacheLife, revalidatePath } from "next/cache"
import { headers } from "next/headers";

type AtualizarContaProfessorParams = {
  email: string;
  name: string;
  telefone: string;
  especialidade: string;
  bio: string;
  image?: string;
}

export async function obterProfessor() {
  'use cache: private'

  cacheLife('days')

  const session = await auth.api.getSession({
        headers: await headers()
    })
    if (!session?.user) {
        throw new Error('Usuário não autorizado');
    }
  try {
    const resultado = await prisma.user.findFirst({
      where: {
        role: 'admin'
      }
    })

    if (!resultado) {
        console.log("Nenhum professor (admin) encontrado na base de dados.");
        return null;
    }

    return {
      id: resultado.id,
      nome: resultado.name,
      email: resultado.email,
      telefone: resultado.telefone,
      especialidade: resultado.especialidade,
      bio: resultado.bio,
      image: resultado.image ? await obterUrlImagem(resultado.image) : null
    }
  } catch (error) {
    console.error("Erro ao obter professor:", error)
    return null
  }
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

export async function atualizarContaProfessor(userId: string, data: AtualizarContaProfessorParams, senhaAtual?: string, novaSenha?: string): Promise<{
  success: boolean;
  message: string;
  error?: undefined;
} | {
  success: boolean;
  message: string;
  error: string;
}> {
  try {
    if (senhaAtual && novaSenha) {
      try {
        await auth.api.changePassword({
          body: {
            newPassword: novaSenha,
            currentPassword: senhaAtual,
            revokeOtherSessions: true,
          },
          headers: await headers(),
        });
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
          }
        })

        revalidatePath('/professor/conta')

        return {
          success: true,
          message: senhaAtual && novaSenha ? 'Usuário e senha atualizados com sucesso' : 'Usuário atualizado com sucesso',
        }
      } catch (error) {
        // Se falhar ao mudar a senha, retorna o erro e não atualiza o perfil
        return {
          success: false,
          message: 'Erro ao alterar senha. Verifique se a senha atual está correta e se a nova senha atende aos requisitos.',
          error: error instanceof Error ? error.message : 'Erro desconhecido ao mudar senha'
        }
      }
    } else {
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
      }
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

    revalidatePath('/professor/alunos')

    return {
      success: true,
      message: 'Usuário banido com sucesso',
    }
  }
  catch (error) {
    return {
      success: false,
      message: `Erro ao banir usuário: ${error}`,
      error: error
    }
  }
}