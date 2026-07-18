import { getDiasRestantesNoMes, getTodayISO } from "../../../lib/dateUtils";
import type { BudgetMonthSummary } from "../../budget-planner/utils/budgetMath";
import type { Goal } from "../../../types/goal";
import type { PlanningSnapshot } from "../../../types/planning";
import type { FinancialProfile } from "../../../types/financialProfile";

type ComposeInput = {
  profile: FinancialProfile | null;
  saldo: number;
  receitasDoMes: number;
  despesasDoMes: number;
  totalDespesasFixas: number;
  totalPendenteAPagar: number;
  totalParcelasDoMes?: number;
  goals: Goal[];
  fixedExpensesError?: string | null;
  billsError?: string | null;
  goalsError?: string | null;
  installmentsError?: string | null;
  hojeISO?: string;
};

/**
 * Repositório de composição — não persiste FinancialPlan.
 * Monta o PlanningSnapshot a partir da FDL (mesmas regras de usePlanning).
 */
export class FinancialPlannerRepository {
  composePlanningSnapshot(input: ComposeInput): PlanningSnapshot | null {
    if (!input.profile) return null;

    const hojeISO = input.hojeISO ?? getTodayISO();

    return {
      saldo: input.saldo,
      receitasDoMes: input.receitasDoMes,
      despesasDoMes: input.despesasDoMes,
      rendaMensal: input.profile.monthlyIncome,
      reservaMinima: input.profile.minimumReserve,
      totalDespesasFixas: input.fixedExpensesError ? 0 : input.totalDespesasFixas,
      totalPendenteAPagar: input.billsError ? 0 : input.totalPendenteAPagar,
      totalParcelasDoMes: input.installmentsError
        ? 0
        : (input.totalParcelasDoMes ?? 0),
      diasRestantesNoMes: getDiasRestantesNoMes(hojeISO),
      goals: input.goalsError ? [] : input.goals,
      hojeISO,
    };
  }

  /** Normaliza budget summary nulo/vazio para o compositor. */
  normalizeBudgetSummary(
    summary: BudgetMonthSummary | null | undefined,
  ): BudgetMonthSummary | null {
    return summary ?? null;
  }
}

export const financialPlannerRepository = new FinancialPlannerRepository();
