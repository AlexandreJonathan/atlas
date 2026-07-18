import type {
  BudgetAlertLevel,
  BudgetCategory,
  BudgetWithCategories,
  ExpenseCategory,
} from "../../../types/budget";
import type { InstallmentPlanWithPayments } from "../../../types/installment";
import type { Transaction } from "../../../types/transaction";
import { sumPendingByCategory } from "../../installments/utils/installmentMath";

export const BUDGET_WARNING_RATIO = 0.8;

export type CategorySpendView = {
  category: ExpenseCategory;
  limitAmount: number;
  spentAmount: number;
  remainingAmount: number;
  usedRatio: number;
  usedPercent: number;
  alert: BudgetAlertLevel;
  budgetCategoryId: string;
};

export type BudgetMonthSummary = {
  year: number;
  month: number;
  categoryCount: number;
  totalLimit: number;
  totalSpent: number;
  totalRemaining: number;
  overallUsedPercent: number;
  warningCount: number;
  exceededCount: number;
  hottest: CategorySpendView | null;
};

function monthBounds(year: number, month: number): { start: Date; end: Date } {
  const start = new Date(year, month - 1, 1, 0, 0, 0, 0);
  const end = new Date(year, month, 1, 0, 0, 0, 0);
  return { start, end };
}

export function isTransactionInMonth(
  tx: Transaction,
  year: number,
  month: number,
): boolean {
  const created = new Date(tx.createdAt);
  const { start, end } = monthBounds(year, month);
  return created >= start && created < end;
}

/** Soma despesas do mês por categoria (categoria null → other). */
export function sumSpentByCategory(
  transactions: Transaction[],
  year: number,
  month: number,
): Record<ExpenseCategory, number> {
  const totals = {} as Record<ExpenseCategory, number>;

  for (const tx of transactions) {
    if (tx.type !== "despesa") continue;
    if (!isTransactionInMonth(tx, year, month)) continue;
    const key = tx.category ?? "other";
    totals[key] = (totals[key] ?? 0) + tx.amount;
  }

  return totals;
}

export function alertLevel(usedRatio: number): BudgetAlertLevel {
  if (usedRatio >= 1) return "exceeded";
  if (usedRatio >= BUDGET_WARNING_RATIO) return "warning";
  return "ok";
}

export function buildCategorySpendViews(
  categories: BudgetCategory[],
  spentByCategory: Partial<Record<ExpenseCategory, number>>,
): CategorySpendView[] {
  return categories
    .map((row) => {
      const spentAmount = spentByCategory[row.category] ?? 0;
      const usedRatio =
        row.limitAmount > 0 ? Math.max(0, spentAmount / row.limitAmount) : 0;
      const remainingAmount = Math.max(0, row.limitAmount - spentAmount);
      return {
        category: row.category,
        limitAmount: row.limitAmount,
        spentAmount,
        remainingAmount,
        usedRatio,
        usedPercent: Math.round(usedRatio * 100),
        alert: alertLevel(usedRatio),
        budgetCategoryId: row.id,
      };
    })
    .sort((a, b) => b.usedRatio - a.usedRatio);
}

/** Une gastos de transactions + parcelas pending (sem double-count via transaction_id). */
export function mergeSpentByCategory(
  transactions: Transaction[],
  year: number,
  month: number,
  installmentPlans: InstallmentPlanWithPayments[] = [],
): Partial<Record<ExpenseCategory, number>> {
  const spent = sumSpentByCategory(transactions, year, month);
  const fromInstallments = sumPendingByCategory(
    installmentPlans.filter((p) => p.status !== "cancelled"),
    year,
    month,
  );
  const merged: Partial<Record<ExpenseCategory, number>> = { ...spent };
  for (const [key, value] of Object.entries(fromInstallments)) {
    const cat = key as ExpenseCategory;
    merged[cat] = (merged[cat] ?? 0) + (value ?? 0);
  }
  return merged;
}

export function buildBudgetMonthSummary(
  budget: BudgetWithCategories | null,
  transactions: Transaction[],
  installmentPlans: InstallmentPlanWithPayments[] = [],
): BudgetMonthSummary | null {
  if (!budget) return null;

  const spentByCategory = mergeSpentByCategory(
    transactions,
    budget.year,
    budget.month,
    installmentPlans,
  );
  const views = buildCategorySpendViews(budget.categories, spentByCategory);

  const totalLimit = views.reduce((acc, v) => acc + v.limitAmount, 0);
  const totalSpent = views.reduce((acc, v) => acc + v.spentAmount, 0);
  const totalRemaining = Math.max(0, totalLimit - totalSpent);
  const overallUsedPercent =
    totalLimit > 0 ? Math.round((totalSpent / totalLimit) * 100) : 0;

  return {
    year: budget.year,
    month: budget.month,
    categoryCount: views.length,
    totalLimit,
    totalSpent,
    totalRemaining,
    overallUsedPercent,
    warningCount: views.filter((v) => v.alert === "warning").length,
    exceededCount: views.filter((v) => v.alert === "exceeded").length,
    hottest: views[0] ?? null,
  };
}

/** Ponte leve com Smart Goals: quanto do orçamento ainda pode alimentar metas. */
export function budgetCapacityForGoals(
  summary: BudgetMonthSummary | null,
): number {
  if (!summary) return 0;
  return Math.max(0, summary.totalRemaining);
}

export function monthLabel(year: number, month: number): string {
  const date = new Date(year, month - 1, 1);
  const label = date.toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });
  return label.charAt(0).toUpperCase() + label.slice(1);
}
