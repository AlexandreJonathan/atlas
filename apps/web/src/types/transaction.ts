import type { z } from "zod";
import type { transactionSchema } from "../validations/transactionSchema";
import type { ExpenseCategory } from "./budget";

export type TransactionType = "receita" | "despesa";

export type Transaction = {
  id: string;
  userId: string;
  type: TransactionType;
  description: string;
  amount: number;
  /** Categoria de despesa (Budget Planner). Null em receitas legadas. */
  category: ExpenseCategory | null;
  createdAt: string;
};

export type TransactionFormData = z.infer<typeof transactionSchema>;
