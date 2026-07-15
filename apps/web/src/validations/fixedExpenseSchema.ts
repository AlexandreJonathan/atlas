import { z } from "zod";

export const fixedExpenseSchema = z.object({
  description: z
    .string()
    .trim()
    .min(1, "A descrição é obrigatória")
    .min(3, "A descrição deve ter no mínimo 3 caracteres"),
  amount: z
    .string()
    .min(1, "O valor é obrigatório")
    .refine((valor) => Number(valor) > 0, "Informe um valor maior que zero"),
});
