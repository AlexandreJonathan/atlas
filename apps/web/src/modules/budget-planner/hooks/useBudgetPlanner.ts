import { useCallback, useEffect, useMemo, useState } from "react";
import { getFriendlyErrorMessage } from "../../../lib/errorMessages";
import { useAuth } from "../../../hooks/useAuth";
import type { ExpenseCategory } from "../../../types/budget";
import { useFinancialData } from "../../financial-data";
import { budgetPlannerService } from "../services/BudgetPlannerService";
import type { BudgetMonthSummary, CategorySpendView } from "../utils/budgetMath";
import {
  budgetMonthKey,
  getSharedBudgetState,
  loadSharedBudgetMonth,
  reloadSharedBudgetMonth,
  setSharedBudget,
  subscribeSharedBudget,
} from "../utils/budgetMonthStore";

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
 * Gastos vêm da FDL; limites do mês são compartilhados entre mounts (Home + Planner).
 */
export function useBudgetPlanner() {
  const { user } = useAuth();
  const userId = user?.id;
  const financial = useFinancialData();
  const transactions = financial.transacoes.transactions;
  const installmentPlans = useMemo(
    () => financial.snapshot?.installmentPlans ?? [],
    [financial.snapshot?.installmentPlans],
  );

  const period = useMemo(() => currentPeriod(), []);
  const key = userId
    ? budgetMonthKey(userId, period.year, period.month)
    : "";

  const [tick, setTick] = useState(0);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => subscribeSharedBudget(() => setTick((n) => n + 1)), []);

  const shared = getSharedBudgetState();
  const budget = key && shared.key === key ? shared.budget : null;
  const loading = Boolean(key) && (shared.key !== key || shared.loading || !shared.loaded);
  const error =
    key && shared.key === key && shared.error
      ? getFriendlyErrorMessage(shared.error, "Não foi possível carregar o orçamento.")
      : null;

  const reload = useCallback(async () => {
    if (!userId || !key) {
      return;
    }
    await reloadSharedBudgetMonth(key, () =>
      budgetPlannerService.getMonth(userId, period.year, period.month),
    );
  }, [userId, key, period.year, period.month]);

  useEffect(() => {
    if (!userId || !key) return;
    let active = true;
    Promise.resolve().then(() => {
      if (active) {
        void loadSharedBudgetMonth(key, () =>
          budgetPlannerService.getMonth(userId, period.year, period.month),
        );
      }
    });
    return () => {
      active = false;
    };
  }, [userId, key, period.year, period.month]);

  void tick;

  const views: CategorySpendView[] = useMemo(
    () => budgetPlannerService.buildViews(budget, transactions, installmentPlans),
    [budget, transactions, installmentPlans],
  );

  const summary: BudgetMonthSummary | null = useMemo(
    () =>
      budgetPlannerService.summarize(budget, transactions, installmentPlans),
    [budget, transactions, installmentPlans],
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
      if (!userId || !key) throw new Error("Usuário não autenticado.");
      setActionError(null);
      try {
        const next = await budgetPlannerService.setCategoryLimit({
          userId,
          year: period.year,
          month: period.month,
          ...input,
        });
        setSharedBudget(key, { budget: next, loaded: true, loading: false, error: null });
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
      if (!userId || !key) return;
      setActionError(null);
      try {
        const next = await budgetPlannerService.removeCategoryLimit(
          categoryId,
          userId,
          period.year,
          period.month,
        );
        setSharedBudget(key, { budget: next, loaded: true, loading: false, error: null });
      } catch (erro) {
        setActionError(
          getFriendlyErrorMessage(erro, "Não foi possível remover o limite."),
        );
      }
    },
  };
}
