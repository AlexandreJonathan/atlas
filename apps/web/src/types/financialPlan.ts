import type { BudgetMonthSummary } from "../modules/budget-planner/utils/budgetMath";
import type { InstallmentPlanWithPayments } from "./installment";
import type { Goal } from "./goal";
import type { PlanningResult, PlanningSnapshot, RiscoFinanceiro } from "./planning";

/** Projeção mensal derivada (não persistida). */
export type MonthlyProjection = {
  year: number;
  month: number;
  label: string;
  projectedBalance: number;
  projectedIncome: number;
  projectedExpenses: number;
  projectedSurplus: number;
  projectedContribution: number;
};

/** Previsão por meta — usa ritmo do planningEngine + capacidade composta. */
export type GoalForecast = {
  goalId: string;
  title: string;
  remainingAmount: number;
  monthlyNeeded: number;
  monthsToDeadline: number | null;
  monthsAtCapacity: number | null;
  onTrack: boolean;
  etaLabel: string;
};

/**
 * Plano financeiro composto do mês.
 * Derivado de FDL + planningEngine + Budget + Smart Goals — sem tabela própria na v1.0.
 */
export type FinancialPlan = {
  id: string;
  userId: string;
  year: number;
  month: number;
  configured: boolean;
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlySurplus: number;
  contributionCapacity: number;
  investmentCapacity: number;
  projectedBalance: number;
  dailySpendAllowance: number;
  requiredMonthlySave: number;
  budgetRemaining: number;
  risk: RiscoFinanceiro;
  goalForecasts: GoalForecast[];
  projections: MonthlyProjection[];
  /** Compromisso de parcelas no mês corrente. */
  installmentCommitment: number;
  /** Meses com maior pressão de parcelas no horizonte. */
  pressureMonths: Array<{ label: string; amount: number }>;
  /** Valor mensal liberado após o fim das parcelas ativas. */
  releaseAfterInstallments: number;
  generatedAt: string;
};

/** Entradas tipadas do repositório/compositor (sem I/O). */
export type FinancialPlanBuildInput = {
  userId: string;
  planningSnapshot: PlanningSnapshot;
  planningResult: PlanningResult;
  goals: Goal[];
  budgetSummary: BudgetMonthSummary | null;
  installmentPlans?: InstallmentPlanWithPayments[];
  horizonMonths?: number;
  generatedAt?: string;
};
