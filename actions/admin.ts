 'use server'

import { auth } from "@/lib/auth"

 export interface CreateUserData {
    name: string
    email: string
    password: string
    role?: "user" | "admin" | ("user" | "admin")[] | undefined
    data?: Record<string, any>
  }

export async function createUser(userData: CreateUserData) {
    try {
      // Validação básica
      if (!userData.email || !userData.password || !userData.name) {
        throw new Error('Nome, email e senha são obrigatórios')
      }

      // Validação de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(userData.email)) {
        throw new Error('Formato de email inválido')
      }

      // Validação de senha
      if (userData.password.length < 8) {
        throw new Error('Senha deve ter pelo menos 8 caracteres')
      }

      const newUser = await auth.api.createUser({
        body: {
            email: userData.email, // required
            password: userData.password, // required
            name: userData.name, // required
            role: userData.role,
            data: { customField: "customValue" },
        },
    });
    

      return {
        success: true,
        data: newUser,
        message: 'Usuário criado com sucesso'
      }
    } catch (error) {
      let errorMessage = 'Erro desconhecido';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      return {
        success: false,
        error: errorMessage,
        message: 'Erro ao criar usuário'
      }
    }
  }