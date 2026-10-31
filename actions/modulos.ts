'use server'

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { updateTag } from "next/cache"
import { headers } from "next/headers"

interface DadosModulo {
  nome: string
  descricao: string
}

async function verificarAdministrador() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user || session.user.role !== "admin") {
    throw new Error("Usuário não autorizado")
  }
}

function validarDadosModulo(data: DadosModulo) {
  if (
    typeof data.nome !== "string" ||
    data.nome.trim().length < 3 ||
    typeof data.descricao !== "string" ||
    data.descricao.trim().length < 3
  ) {
    throw new Error("O nome e a descrição devem ter pelo menos 3 caracteres.")
  }
}

export async function adicionarModulo(data: DadosModulo) {
  await verificarAdministrador()
  validarDadosModulo(data)

  try {
    await prisma.modulo.create({
      data: {
        nome: data.nome.trim(),
        descricao: data.descricao.trim(),
      },
    })

    updateTag("listar-modulos")
    return true
  } catch (error) {
    console.error("Erro ao criar módulo:", error)
    return false
  }
}

export async function editarModulo(id: number, data: DadosModulo) {
  await verificarAdministrador()

  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("Identificador de módulo inválido.")
  }
  validarDadosModulo(data)

  try {
    await prisma.modulo.update({
      where: { id },
      data: {
        nome: data.nome.trim(),
        descricao: data.descricao.trim(),
      },
    })

    updateTag("listar-modulos")
    return true
  } catch (error) {
    console.error("Erro ao editar módulo:", error)
    return false
  }
}

export async function obterModulos() {
  const modulos = await prisma.modulo.findMany({
    orderBy: { id: "asc" },
    include: {
      videoaulas: true,
    },
  })
  return modulos
}
