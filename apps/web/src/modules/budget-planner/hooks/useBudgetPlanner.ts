import { useCallback, useEffect, useMemo, useState } from "react";
import { getFriendlyErrorMessage } from "../../../lib/errorMessages";
import { useAuth } from "../../../hooks/useAuth";
import type { ExpenseCategory } from "../../../types/budget";
import type { BudgetWithCategories } from "../../../types/budget";
import { useFinancialData } from "../../financial-data";
import { budgetPlannerService } from "../services/BudgetPlannerService";
import type { BudgetMonthSummary, CategorySpendView } from "../utils/budgetMath";

export type SetBudgetCategoryInput = {
  category: ExpenseCategory;
  limitAmount: number;
  notes?: string | null;
};

function currentPeriod(now = new Date()) {
  return { year: now.getFullYear(), month: now.getMonth() + 1 };
}

/**
 * Hook da tela Budget Planner.
 * Gastos vêm da FDL (transactions); mutações de limite só tocam budgets.
 */
export function useBudgetPlanner() {
  const { user } = useAuth();
  const userId = user?.id;
  const financial = useFinancialData();
  const transactions = financial.transacoes.transactions;

  const period = useMemo(() => currentPeriod(), []);
  const [budget, setBudget] = useState<BudgetWithCategories | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!userId) {
      setBudget(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const row = await budgetPlannerService.getMonth(
        userId,
        period.year,
        period.month,
      );
      setBudget(row);
    } catch (erro) {
      setError(
        getFriendlyErrorMessage(erro, "Não foi possível carregar o orçamento."),
      );
    } finally {
      setLoading(false);
    }
  }, [userId, period.year, period.month]);

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (active) void reload();
    });
    return () => {
      active = false;
    };
  }, [reload]);

  const views: CategorySpendView[] = useMemo(
    () => budgetPlannerService.buildViews(budget, transactions),
    [budget, transactions],
  );

  const summary: BudgetMonthSummary | null = useMemo(
    () => budgetPlannerService.summarize(budget, transactions),
    [budget, transactions],
  );

  return {
    year: period.year,
    month: period.month,
    budget,
    views,
    summary,
    loading,
    error,
    actionError,
    transactionsLoading: financial.transacoes.loading,
    reload,
    setCategoryLimit: async (input: SetBudgetCategoryInput) => {
      if (!userId) throw new Error("Usuário não autenticado.");
      setActionError(null);
      try {
        const next = await budgetPlannerService.setCategoryLimit({
          userId,
          year: period.year,
          month: period.month,
          ...input,
        });
        setBudget(next);
      } catch (erro) {
        const message = getFriendlyErrorMessage(
          erro,
          "Não foi possível salvar o limite.",
        );
        setActionError(message);
        throw erro;
      }
    },
    removeCategoryLimit: async (categoryId: string) => {
      if (!userId) return;
      setActionError(null);
      try {
        const next = await budgetPlannerService.removeCategoryLimit(
          categoryId,
          userId,
          period.year,
          period.month,
        );
        setBudget(next);
      } catch (erro) {
        setActionError(
          getFriendlyErrorMessage(erro, "Não foi possível remover o limite."),
        );
      }
    },
  };
}
