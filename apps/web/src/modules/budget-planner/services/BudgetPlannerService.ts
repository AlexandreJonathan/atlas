import { analytics } from "../../../lib/analytics";
import { logger } from "../../../lib/logging";
import {
  deleteBudgetCategory,
  ensureMonthBudget,
  getBudgetForPeriod,
  upsertBudgetCategory,
  type UpsertBudgetCategoryInput,
} from "../../../services/budgetsService";
import type { BudgetWithCategories, ExpenseCategory } from "../../../types/budget";
import type { InstallmentPlanWithPayments } from "../../../types/installment";
import type { Transaction } from "../../../types/transaction";
import {
  buildBudgetMonthSummary,
  buildCategorySpendViews,
  mergeSpentByCategory,
  type BudgetMonthSummary,
  type CategorySpendView,
} from "../utils/budgetMath";

export type SetCategoryLimitInput = {
  userId: string;
  year: number;
  month: number;
  category: ExpenseCategory;
  limitAmount: number;
  notes?: string | null;
};

/**
 * Porta de domínio Budget Planner — Repository via budgetsService.
 * Gasto/restante são derivados das transactions (FDL), não persistidos.
 */
export class BudgetPlannerService {
  async getMonth(
    userId: string,
    year: number,
    month: number,
  ): Promise<BudgetWithCategories | null> {
    return getBudgetForPeriod(userId, year, month);
  }

  async ensureMonth(
    userId: string,
    year: number,
    month: number,
    notes?: string | null,
  ): Promise<BudgetWithCategories> {
    const budget = await ensureMonthBudget(userId, year, month, notes);
    analytics.track("budget_month_ensured", { year, month });
    logger.info("Orçamento mensal garantido", { budgetId: budget.id, year, month });
    return budget;
  }

  async setCategoryLimit(input: SetCategoryLimitInput): Promise<BudgetWithCategories> {
    const budget = await ensureMonthBudget(
      input.userId,
      input.year,
      input.month,
      input.notes,
    );

    const payload: UpsertBudgetCategoryInput = {
      budgetId: budget.id,
      userId: input.userId,
      category: input.category,
      limitAmount: input.limitAmount,
    };
    await upsertBudgetCategory(payload);

    analytics.track("budget_category_limit_set", {
      category: input.category,
      limitAmount: input.limitAmount,
      year: input.year,
      month: input.month,
    });
    logger.info("Limite de categoria definido", {
      category: input.category,
      budgetId: budget.id,
    });

    return (await getBudgetForPeriod(input.userId, input.year, input.month))!;
  }

  async removeCategoryLimit(
    categoryId: string,
    userId: string,
    year: number,
    month: number,
  ): Promise<BudgetWithCategories | null> {
    await deleteBudgetCategory(categoryId, userId);
    analytics.track("budget_category_limit_removed", { categoryId });
    return getBudgetForPeriod(userId, year, month);
  }

  buildViews(
    budget: BudgetWithCategories | null,
    transactions: Transaction[],
    installmentPlans: InstallmentPlanWithPayments[] = [],
  ): CategorySpendView[] {
    if (!budget) return [];
    const spent = mergeSpentByCategory(
      transactions,
      budget.year,
      budget.month,
      installmentPlans,
    );
    return buildCategorySpendViews(budget.categories, spent);
  }

  summarize(
    budget: BudgetWithCategories | null,
    transactions: Transaction[],
    installmentPlans: InstallmentPlanWithPayments[] = [],
  ): BudgetMonthSummary | null {
    return buildBudgetMonthSummary(budget, transactions, installmentPlans);
  }
}

export const budgetPlannerService = new BudgetPlannerService();
