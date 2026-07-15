import type { z } from "zod";
import type { billSchema } from "../validations/billSchema";

export type BillType = "a_pagar" | "a_receber";
export type BillStatus = "pendente" | "pago";

export type Bill = {
  id: string;
  userId: string;
  type: BillType;
  description: string;
  amount: number;
  dueDate: string;
  status: BillStatus;
  paidAt: string | null;
  createdAt: string;
};

export type BillFormData = z.infer<typeof billSchema>;
