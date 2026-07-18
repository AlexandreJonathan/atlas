import { useEffect, useMemo, useState } from "react";
import { getTodayISO } from "../../../lib/dateUtils";
import { useAuth } from "../../../hooks/useAuth";
import type { FinancialPlan } from "../../../types/financialPlan";
import { useBudgetPlanner } from "../../budget-planner";
import { useFinancialData } from "../../financial-data";
import { financialPlannerService } from "../services/FinancialPlannerService";

const INTERVALO_ATUALIZACAO_MS = 5 * 60 * 1000;

/**
 * Compõe FDL + Budget Planner + metas (Smart Goals via FDL) num FinancialPlan.
 * Não duplica o motor — delega a FinancialPlannerService → planningEngine.
 */
export function useFinancialPlanner() {
  const { user } = useAuth();
  const userId = user?.id ?? "";
  const financial = useFinancialData();
  const budget = useBudgetPlanner();
  const [hojeISO, setHojeISO] = useState(() => getTodayISO());

  useEffect(() => {
    const intervalo = setInterval(
      () => setHojeISO(getTodayISO()),
      INTERVALO_ATUALIZACAO_MS,
    );
    return () => clearInterval(intervalo);
  }, []);

  const loading =
    financial.loading ||
    financial.perfil.loading ||
    financial.despesasFixas.loading ||
    financial.contas.loading ||
    financial.metas.loading ||
    budget.loading ||
    budget.transactionsLoading;

  const error =
    financial.perfil.error ||
    financial.error ||
    budget.error ||
    null;

  const plan: FinancialPlan | null = useMemo(() => {
    if (!userId || !financial.perfil.profile) return null;

    return financialPlannerService.composeFromSources({
      userId,
      profile: financial.perfil.profile,
      saldo: financial.resumo.saldo,
      receitasDoMes: financial.resumo.receitasDoMes,
      despesasDoMes: financial.resumo.despesasDoMes,
      totalDespesasFixas: financial.despesasFixas.totalDespesasFixas,
      totalPendenteAPagar: financial.contas.totalPendenteAPagar,
      totalParcelasDoMes: financial.snapshot?.totalParcelasDoMes ?? 0,
      goals: financial.metas.goals,
      budgetSummary: budget.summary,
      installmentPlans: financial.snapshot?.installmentPlans ?? [],
      fixedExpensesError: financial.despesasFixas.error,
      billsError: financial.contas.error,
      goalsError: financial.metas.error,
      installmentsError: financial.snapshot?.errors?.installments ?? null,
      hojeISO,
    });
  }, [
    userId,
    financial.perfil.profile,
    financial.resumo.saldo,
    financial.resumo.receitasDoMes,
    financial.resumo.despesasDoMes,
    financial.despesasFixas.totalDespesasFixas,
    financial.despesasFixas.error,
    financial.contas.totalPendenteAPagar,
    financial.contas.error,
    financial.metas.goals,
    financial.metas.error,
    financial.snapshot?.totalParcelasDoMes,
    financial.snapshot?.installmentPlans,
    financial.snapshot?.errors,
    budget.summary,
    hojeISO,
  ]);

  return {
    plan,
    configured: financial.perfil.profile !== null,
    loading,
    error,
    reload: () => {
      financial.invalidate("ledger");
      void budget.reload();
    },
    perfil: financial.perfil,
  };
}
