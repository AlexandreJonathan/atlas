import { analytics } from "../../../lib/analytics";
import { logger } from "../../../lib/logging";
import { calcularPlanejamento } from "../../../lib/planningEngine";
import type { FinancialPlan, FinancialPlanBuildInput } from "../../../types/financialPlan";
import type { BudgetMonthSummary } from "../../budget-planner/utils/budgetMath";
import type { Goal } from "../../../types/goal";
import type { PlanningSnapshot } from "../../../types/planning";
import { financialPlannerRepository } from "../repository/FinancialPlannerRepository";
import { buildFinancialPlan } from "../utils/planMath";

/**
 * Porta de domínio Financial Planner.
 * Compõe planningEngine + Budget + Goals — sem persistir plano próprio.
 */
export class FinancialPlannerService {
  buildPlan(input: FinancialPlanBuildInput): FinancialPlan {
    const plan = buildFinancialPlan(input);
    logger.info("Financial Plan composto", {
      planId: plan.id,
      risk: plan.risk,
      surplus: plan.monthlySurplus,
    });
    return plan;
  }

  composeFromSources(input: {
    userId: string;
    profile: Parameters<
      typeof financialPlannerRepository.composePlanningSnapshot
    >[0]["profile"];
    saldo: number;
    receitasDoMes: number;
    despesasDoMes: number;
    totalDespesasFixas: number;
    totalPendenteAPagar: number;
    goals: Goal[];
    budgetSummary: BudgetMonthSummary | null;
    fixedExpensesError?: string | null;
    billsError?: string | null;
    goalsError?: string | null;
    hojeISO?: string;
    horizonMonths?: number;
  }): FinancialPlan | null {
    const planningSnapshot = financialPlannerRepository.composePlanningSnapshot({
      profile: input.profile,
      saldo: input.saldo,
      receitasDoMes: input.receitasDoMes,
      despesasDoMes: input.despesasDoMes,
      totalDespesasFixas: input.totalDespesasFixas,
      totalPendenteAPagar: input.totalPendenteAPagar,
      goals: input.goals,
      fixedExpensesError: input.fixedExpensesError,
      billsError: input.billsError,
      goalsError: input.goalsError,
      hojeISO: input.hojeISO,
    });

    if (!planningSnapshot) return null;

    const planningResult = calcularPlanejamento(planningSnapshot);
    return this.buildPlan({
      userId: input.userId,
      planningSnapshot,
      planningResult,
      goals: input.goals,
      budgetSummary: financialPlannerRepository.normalizeBudgetSummary(
        input.budgetSummary,
      ),
      horizonMonths: input.horizonMonths,
    });
  }

  /** Reexporta resultado do motor para testes/integrações. */
  runEngine(snapshot: PlanningSnapshot) {
    return calcularPlanejamento(snapshot);
  }

  trackOpened() {
    analytics.track("financial_planner_opened");
  }
}

export const financialPlannerService = new FinancialPlannerService();
