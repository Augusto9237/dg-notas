import { z } from "zod"

export const signUpSchema = z.object({
  name: z
    .string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(50, "Nome deve ter no máximo 50 caracteres")
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, "Nome deve conter apenas letras"),
  email: z
    .string()
    .min(1, "Email é obrigatório")
    .email("Email deve ter um formato válido"),
  password: z
    .string()
    .min(8, "Senha deve ter pelo menos 8 caracteres")
    .max(100, "Senha deve ter no máximo 100 caracteres")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Senha deve conter pelo menos uma letra minúscula, uma maiúscula e um número"
    ),
  confirmPassword: z
    .string()
    .min(1, "Confirmação de senha é obrigatória"),
  image: z
    .instanceof(File)
    .optional()
    .refine(
      (file) => !file || file.size <= 5 * 1024 * 1024,
      "Imagem deve ter no máximo 5MB"
    )
    .refine(
      (file) => !file || file.type.startsWith("image/"),
      "Arquivo deve ser uma imagem"
    ),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Senhas não coincidem",
  path: ["confirmPassword"],
})

export type SignUpFormData = z.infer<typeof signUpSchema>
