import type { z } from "zod";
import type { transactionSchema } from "../validations/transactionSchema";

export type TransactionType = "receita" | "despesa";

export type Transaction = {
  id: string;
  userId: string;
  type: TransactionType;
  description: string;
  amount: number;
  createdAt: string;
};

export type TransactionFormData = z.infer<typeof transactionSchema>;
