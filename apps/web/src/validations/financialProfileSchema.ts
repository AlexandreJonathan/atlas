import { z } from "zod";

export const financialProfileSchema = z.object({
  monthlyIncome: z
    .string()
    .min(1, "A renda mensal é obrigatória")
    .refine((valor) => Number(valor) > 0, "Informe um valor maior que zero"),
  minimumReserve: z
    .string()
    .min(1, "A reserva mínima é obrigatória")
    .refine((valor) => Number(valor) >= 0, "Informe um valor maior ou igual a zero"),
});

// Derivados do schema completo (em vez de duplicar as regras) para os
// passos individuais do onboarding guiado (Sprint 6), que coletam renda e
// reserva mínima em telas separadas antes de salvar o perfil completo.
export const monthlyIncomeSchema = financialProfileSchema.pick({ monthlyIncome: true });
export const minimumReserveSchema = financialProfileSchema.pick({ minimumReserve: true });
