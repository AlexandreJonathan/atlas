import { z } from "zod";
import { EXPENSE_CATEGORIES } from "../types/budget";

export const transactionSchema = z.object({
  // .trim() garante que espaços em branco não contem para o mínimo de
  // caracteres, mantendo a mesma regra aplicada pela constraint do banco
  // (char_length(trim(description)) >= 3 — ver supabase/migrations).
  description: z
    .string()
    .trim()
    .min(1, "A descrição é obrigatória")
    .min(3, "A descrição deve ter no mínimo 3 caracteres"),
  amount: z
    .string()
    .min(1, "O valor é obrigatório")
    .refine((valor) => Number(valor) > 0, "Informe um valor maior que zero"),
  category: z.enum(EXPENSE_CATEGORIES).optional(),
});
