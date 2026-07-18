import { z } from "zod";
import { GOAL_CATEGORIES } from "../types/goal";

export const goalSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "O nome da meta é obrigatório")
    .min(3, "O nome deve ter no mínimo 3 caracteres"),
  targetAmount: z
    .string()
    .min(1, "O valor da meta é obrigatório")
    .refine((valor) => Number(valor) > 0, "Informe um valor maior que zero"),
  targetDate: z
    .string()
    .min(1, "A data limite é obrigatória")
    .refine((value) => !Number.isNaN(Date.parse(value)), "Informe uma data válida"),
  category: z.enum(GOAL_CATEGORIES, { message: "Selecione uma categoria" }),
  description: z
    .string()
    .trim()
    .max(500, "A descrição deve ter no máximo 500 caracteres")
    .optional()
    .or(z.literal("")),
});

/** Schema leve para onboarding / atalhos (data e categoria opcionais). */
export const goalQuickSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "O nome da meta é obrigatório")
    .min(3, "O nome deve ter no mínimo 3 caracteres"),
  targetAmount: z
    .string()
    .min(1, "O valor da meta é obrigatório")
    .refine((valor) => Number(valor) > 0, "Informe um valor maior que zero"),
  targetDate: z.string().optional(),
  category: z.enum(GOAL_CATEGORIES).optional(),
  description: z.string().optional(),
});

export const goalContributionSchema = z.object({
  amount: z
    .string()
    .min(1, "O valor é obrigatório")
    .refine((valor) => Number(valor) > 0, "Informe um valor maior que zero"),
});
