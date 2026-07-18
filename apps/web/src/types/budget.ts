import type { z } from "zod";
import type { budgetCategoryLimitSchema } from "../validations/budgetSchema";

/** Categorias de despesa compartilhadas entre transactions e Budget Planner. */
export const EXPENSE_CATEGORIES = [
  "housing",
  "food",
  "transport",
  "health",
  "leisure",
  "education",
  "shopping",
  "bills",
  "subscriptions",
  "other",
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  housing: "Moradia",
  food: "Alimentação",
  transport: "Transporte",
  health: "Saúde",
  leisure: "Lazer",
  education: "Educação",
  shopping: "Compras",
  bills: "Contas",
  subscriptions: "Assinaturas",
  other: "Outros",
};

export const BUDGET_STATUSES = ["active", "archived"] as const;
export type BudgetStatus = (typeof BUDGET_STATUSES)[number];

export type Budget = {
  id: string;
  userId: string;
  year: number;
  month: number;
  status: BudgetStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type BudgetCategory = {
  id: string;
  budgetId: string;
  userId: string;
  category: ExpenseCategory;
  limitAmount: number;
  createdAt: string;
  updatedAt: string;
};

/** Orçamento com limites (persistidos). Gastos são derivados das transactions. */
export type BudgetWithCategories = Budget & {
  categories: BudgetCategory[];
};

export type BudgetCategoryLimitFormData = z.infer<typeof budgetCategoryLimitSchema>;

export type BudgetAlertLevel = "ok" | "warning" | "exceeded";
