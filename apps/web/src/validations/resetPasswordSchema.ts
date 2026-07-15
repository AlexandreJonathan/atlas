import { z } from "zod";

export const resetPasswordSchema = z
  .object({
    senha: z
      .string()
      .min(1, "A senha é obrigatória")
      .min(6, "A senha deve ter no mínimo 6 caracteres"),
    confirmarSenha: z.string().min(1, "Confirme a nova senha"),
  })
  .refine((dados) => dados.senha === dados.confirmarSenha, {
    message: "As senhas não coincidem",
    path: ["confirmarSenha"],
  });
