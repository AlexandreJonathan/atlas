import type { z } from "zod";
import type { financialProfileSchema } from "../validations/financialProfileSchema";

export type FinancialProfile = {
  userId: string;
  monthlyIncome: number;
  minimumReserve: number;
  updatedAt: string;
};

export type FinancialProfileFormData = z.infer<typeof financialProfileSchema>;
