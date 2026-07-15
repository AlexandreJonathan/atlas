import type { z } from "zod";
import type { fixedExpenseSchema } from "../validations/fixedExpenseSchema";

export type FixedExpense = {
  id: string;
  userId: string;
  description: string;
  amount: number;
  createdAt: string;
};

export type FixedExpenseFormData = z.infer<typeof fixedExpenseSchema>;
