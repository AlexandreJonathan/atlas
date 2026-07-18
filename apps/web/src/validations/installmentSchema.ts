import { z } from "zod";
import { EXPENSE_CATEGORIES } from "../types/budget";

export const installmentPlanSchema = z.object({
  description: z
    .string()
    .trim()
    .min(1, "A descrição é obrigatória")
    .min(3, "A descrição deve ter no mínimo 3 caracteres"),
  category: z.enum(EXPENSE_CATEGORIES, { message: "Selecione uma categoria" }),
  totalAmount: z
    .string()
    .min(1, "O valor total é obrigatório")
    .refine((v) => Number(v) > 0, "Informe um valor maior que zero"),
  installmentCount: z
    .string()
    .min(1, "Informe o número de parcelas")
    .refine((v) => {
      const n = Number(v);
      return Number.isInteger(n) && n >= 1 && n <= 120;
    }, "Informe entre 1 e 120 parcelas"),
  installmentAmount: z
    .string()
    .min(1, "O valor da parcela é obrigatório")
    .refine((v) => Number(v) > 0, "Informe um valor maior que zero"),
  firstDueDate: z
    .string()
    .min(1, "A data da primeira parcela é obrigatória")
    .refine((v) => !Number.isNaN(Date.parse(v)), "Informe uma data válida"),
  cardLabel: z
    .string()
    .trim()
    .max(80, "O nome do cartão deve ter no máximo 80 caracteres")
    .optional()
    .or(z.literal("")),
});
