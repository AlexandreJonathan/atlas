import { getMesesRestantes } from "../../../lib/dateUtils";
import { calcularPlanejamento } from "../../../lib/planningEngine";
import {
  budgetCapacityForGoals,
  type BudgetMonthSummary,
} from "../../budget-planner/utils/budgetMath";
import type {
  FinancialPlan,
  FinancialPlanBuildInput,
  GoalForecast,
  MonthlyProjection,
} from "../../../types/financialPlan";
import type { Goal } from "../../../types/goal";
import type { PlanningSnapshot } from "../../../types/planning";

export const DEFAULT_HORIZON_MONTHS = 6;

function formatMoneyShort(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });
}

function monthLabel(year: number, month: number): string {
  const date = new Date(year, month - 1, 1);
  const label = date.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" });
  return label.replace(".", "");
}

function advanceMonth(year: number, month: number, offset: number): { year: number; month: number } {
  const idx = year * 12 + (month - 1) + offset;
  return { year: Math.floor(idx / 12), month: (idx % 12) + 1 };
}

/**
 * Sobra mensal estrutural: renda do perfil − despesas fixas − contas pendentes.
 * Não reimplementa o motor — apenas expõe insumos já usados pelo planningEngine.
 */
export function computeMonthlySurplus(snapshot: PlanningSnapshot): {
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlySurplus: number;
} {
  const monthlyIncome = snapshot.rendaMensal;
  const monthlyExpenses = snapshot.totalDespesasFixas + snapshot.totalPendenteAPagar;
  return {
    monthlyIncome,
    monthlyExpenses,
    monthlySurplus: monthlyIncome - monthlyExpenses,
  };
}

/**
 * Capacidade de aporte = sobra positiva, limitada pelo restante do Budget (se houver).
 */
export function computeContributionCapacity(
  monthlySurplus: number,
  budgetSummary: BudgetMonthSummary | null,
): { contributionCapacity: number; budgetRemaining: number } {
  const budgetRemaining = budgetCapacityForGoals(budgetSummary);
  const surplusCapacity = Math.max(0, monthlySurplus);
  const hasBudgetLimits = Boolean(budgetSummary && budgetSummary.categoryCount > 0);
  const contributionCapacity = hasBudgetLimits
    ? Math.min(surplusCapacity, budgetRemaining)
    : surplusCapacity;
  return { contributionCapacity, budgetRemaining };
}

export function buildGoalForecasts(
  goals: Goal[],
  contributionCapacity: number,
  hojeISO: string,
): GoalForecast[] {
  return goals
    .filter((g) => g.status === "active" || g.status === "completed")
    .map((goal) => {
      const remainingAmount = Math.max(0, goal.targetAmount - goal.currentAmount);
      if (goal.status === "completed" || remainingAmount <= 0) {
        return {
          goalId: goal.id,
          title: goal.title,
          remainingAmount: 0,
          monthlyNeeded: 0,
          monthsToDeadline: goal.targetDate
            ? getMesesRestantes(goal.targetDate, hojeISO)
            : null,
          monthsAtCapacity: 0,
          onTrack: true,
          etaLabel: "Meta concluída",
        };
      }

      const monthsToDeadline = goal.targetDate
        ? getMesesRestantes(goal.targetDate, hojeISO)
        : null;
      const monthlyNeeded =
        monthsToDeadline != null ? remainingAmount / monthsToDeadline : 0;
      const monthsAtCapacity =
        contributionCapacity > 0
          ? Math.ceil(remainingAmount / contributionCapacity)
          : null;

      let onTrack = false;
      let etaLabel: string;

      if (monthsToDeadline != null) {
        onTrack =
          contributionCapacity > 0 && monthlyNeeded <= contributionCapacity + 1e-9;
        etaLabel = onTrack
          ? `No ritmo · ~${monthsToDeadline} mês(es)`
          : contributionCapacity > 0
            ? `Precisa ${formatMoneyShort(monthlyNeeded)}/mês · capacidade ${formatMoneyShort(contributionCapacity)}`
            : "Sem capacidade de aporte neste mês";
      } else if (monthsAtCapacity != null) {
        onTrack = true;
        etaLabel = `Sem prazo · ~${monthsAtCapacity} mês(es) no ritmo atual`;
      } else {
        etaLabel = "Defina prazo ou aumente a sobra mensal";
      }

      return {
        goalId: goal.id,
        title: goal.title,
        remainingAmount,
        monthlyNeeded,
        monthsToDeadline,
        monthsAtCapacity,
        onTrack,
        etaLabel,
      };
    })
    .sort((a, b) => {
      if (a.onTrack !== b.onTrack) return a.onTrack ? 1 : -1;
      return b.monthlyNeeded - a.monthlyNeeded;
    });
}

/**
 * Evolução mensal: mês 0 = saldo previsto do motor; meses seguintes
 * assumem renda do perfil e despesas fixas (mesma hipótese do engine).
 */
export function buildMonthlyProjections(input: {
  year: number;
  month: number;
  startingProjectedBalance: number;
  monthlyIncome: number;
  monthlyFixedExpenses: number;
  contributionCapacity: number;
  horizonMonths: number;
}): MonthlyProjection[] {
  const projections: MonthlyProjection[] = [];
  let balance = input.startingProjectedBalance;

  for (let i = 0; i < input.horizonMonths; i += 1) {
    const { year, month } = advanceMonth(input.year, input.month, i);
    const projectedIncome = input.monthlyIncome;
    const projectedExpenses = input.monthlyFixedExpenses;
    const projectedSurplus = projectedIncome - projectedExpenses;
    const projectedContribution = Math.min(
      Math.max(0, projectedSurplus),
      input.contributionCapacity,
    );

    if (i > 0) {
      balance += projectedSurplus;
    }

    projections.push({
      year,
      month,
      label: monthLabel(year, month),
      projectedBalance: balance,
      projectedIncome,
      projectedExpenses,
      projectedSurplus,
      projectedContribution,
    });
  }

  return projections;
}

export function buildFinancialPlan(input: FinancialPlanBuildInput): FinancialPlan {
  const { planningSnapshot: snapshot, planningResult } = input;
  const horizon = input.horizonMonths ?? DEFAULT_HORIZON_MONTHS;
  const generatedAt = input.generatedAt ?? new Date().toISOString();
  const { year, month } = (() => {
    const [y, m] = snapshot.hojeISO.split("-").map(Number);
    return { year: y, month: m };
  })();

  const { monthlyIncome, monthlyExpenses, monthlySurplus } =
    computeMonthlySurplus(snapshot);
  const { contributionCapacity, budgetRemaining } = computeContributionCapacity(
    monthlySurplus,
    input.budgetSummary,
  );
  const investmentCapacity = Math.max(
    0,
    contributionCapacity - planningResult.quantoPrecisaGuardar,
  );

  return {
    id: `${input.userId}-${year}-${String(month).padStart(2, "0")}`,
    userId: input.userId,
    year,
    month,
    configured: true,
    monthlyIncome,
    monthlyExpenses,
    monthlySurplus,
    contributionCapacity,
    investmentCapacity,
    projectedBalance: planningResult.saldoPrevistoFimDoMes,
    dailySpendAllowance: planningResult.quantoPossoGastarHoje,
    requiredMonthlySave: planningResult.quantoPrecisaGuardar,
    budgetRemaining,
    risk: planningResult.risco,
    goalForecasts: buildGoalForecasts(
      input.goals,
      contributionCapacity,
      snapshot.hojeISO,
    ),
    projections: buildMonthlyProjections({
      year,
      month,
      startingProjectedBalance: planningResult.saldoPrevistoFimDoMes,
      monthlyIncome,
      monthlyFixedExpenses: snapshot.totalDespesasFixas,
      contributionCapacity,
      horizonMonths: horizon,
    }),
    generatedAt,
  };
}

/** Atalho testável: motor + composição numa única chamada. */
export function buildFinancialPlanFromSnapshot(
  input: Omit<FinancialPlanBuildInput, "planningResult">,
): FinancialPlan {
  const planningResult = calcularPlanejamento(input.planningSnapshot);
  return buildFinancialPlan({ ...input, planningResult });
}
