import type { z } from "zod";
import type { ExpenseCategory } from "./budget";
import type { installmentPlanSchema } from "../validations/installmentSchema";

export const INSTALLMENT_PLAN_STATUSES = ["active", "completed", "cancelled"] as const;
export type InstallmentPlanStatus = (typeof INSTALLMENT_PLAN_STATUSES)[number];

export const INSTALLMENT_PAYMENT_STATUSES = ["pending", "paid", "skipped"] as const;
export type InstallmentPaymentStatus = (typeof INSTALLMENT_PAYMENT_STATUSES)[number];

export type InstallmentPlan = {
  id: string;
  userId: string;
  description: string;
  category: ExpenseCategory;
  totalAmount: number;
  installmentCount: number;
  installmentAmount: number;
  firstDueDate: string;
  cardLabel: string | null;
  status: InstallmentPlanStatus;
  createdAt: string;
  updatedAt: string;
};

export type InstallmentPayment = {
  id: string;
  planId: string;
  userId: string;
  sequence: number;
  dueDate: string;
  amount: number;
  status: InstallmentPaymentStatus;
  paidAt: string | null;
  transactionId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type InstallmentPlanWithPayments = InstallmentPlan & {
  payments: InstallmentPayment[];
};

export type InstallmentPlanFormData = z.infer<typeof installmentPlanSchema>;
