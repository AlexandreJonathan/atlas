import { z } from "zod";
import { EXPENSE_CATEGORIES } from "../types/budget";

export const budgetCategoryLimitSchema = z.object({
  category: z.enum(EXPENSE_CATEGORIES, {
    message: "Selecione uma categoria",
  }),
  limitAmount: z
    .string()
    .min(1, "O limite é obrigatório")
    .refine((valor) => Number(valor) > 0, "Informe um valor maior que zero"),
  notes: z
    .string()
    .trim()
    .max(280, "A descrição deve ter no máximo 280 caracteres")
    .optional()
    .or(z.literal("")),
});
