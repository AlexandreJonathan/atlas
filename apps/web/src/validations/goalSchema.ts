import { z } from "zod";

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
  targetDate: z.string().optional(),
});

export const goalContributionSchema = z.object({
  amount: z
    .string()
    .min(1, "O valor é obrigatório")
    .refine((valor) => Number(valor) > 0, "Informe um valor maior que zero"),
});
