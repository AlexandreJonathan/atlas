import { describe, expect, it } from "vitest";
import type { Goal } from "../../../types/goal";
import type { PlanningSnapshot } from "../../../types/planning";
import type { BudgetMonthSummary } from "../../budget-planner/utils/budgetMath";
import {
  buildFinancialPlanFromSnapshot,
  buildGoalForecasts,
  buildMonthlyProjections,
  computeContributionCapacity,
  computeMonthlySurplus,
} from "./planMath";

const snapshot: PlanningSnapshot = {
  saldo: 2000,
  receitasDoMes: 3000,
  despesasDoMes: 1200,
  rendaMensal: 5000,
  reservaMinima: 1000,
  totalDespesasFixas: 2000,
  totalPendenteAPagar: 500,
  diasRestantesNoMes: 15,
  goals: [
    { targetAmount: 6000, currentAmount: 0, targetDate: "2026-12-01" },
  ],
  hojeISO: "2026-07-15",
};

const goal: Goal = {
  id: "g1",
  userId: "u1",
  title: "Viagem",
  description: null,
  targetAmount: 6000,
  currentAmount: 0,
  targetDate: "2026-12-01",
  category: "travel",
  status: "active",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

describe("planMath", () => {
  it("calcula sobra mensal a partir dos insumos do engine", () => {
    const { monthlyIncome, monthlyExpenses, monthlySurplus } =
      computeMonthlySurplus(snapshot);
    expect(monthlyIncome).toBe(5000);
    expect(monthlyExpenses).toBe(2500);
    expect(monthlySurplus).toBe(2500);
  });

  it("limita capacidade de aporte pelo restante do Budget", () => {
    const budget: BudgetMonthSummary = {
      year: 2026,
      month: 7,
      categoryCount: 2,
      totalLimit: 2000,
      totalSpent: 1500,
      totalRemaining: 500,
      overallUsedPercent: 75,
      warningCount: 0,
      exceededCount: 0,
      hottest: null,
    };
    const capped = computeContributionCapacity(2500, budget);
    expect(capped.contributionCapacity).toBe(500);
    expect(capped.budgetRemaining).toBe(500);

    const open = computeContributionCapacity(2500, null);
    expect(open.contributionCapacity).toBe(2500);
  });

  it("projeta metas on-track e evolução mensal", () => {
    const forecasts = buildGoalForecasts([goal], 1200, "2026-07-15");
    expect(forecasts[0]?.onTrack).toBe(true);
    expect(forecasts[0]?.monthlyNeeded).toBeGreaterThan(0);

    const projections = buildMonthlyProjections({
      year: 2026,
      month: 7,
      startingProjectedBalance: 3500,
      monthlyIncome: 5000,
      monthlyFixedExpenses: 2000,
      contributionCapacity: 1000,
      horizonMonths: 3,
    });
    expect(projections).toHaveLength(3);
    expect(projections[0]?.projectedBalance).toBe(3500);
    expect(projections[1]?.projectedBalance).toBe(3500 + 3000);
  });

  it("compõe FinancialPlan sem duplicar o planningEngine", () => {
    const plan = buildFinancialPlanFromSnapshot({
      userId: "u1",
      planningSnapshot: snapshot,
      goals: [goal],
      budgetSummary: null,
      horizonMonths: 4,
      generatedAt: "2026-07-15T12:00:00.000Z",
    });

    expect(plan.configured).toBe(true);
    expect(plan.monthlySurplus).toBe(2500);
    expect(plan.projectedBalance).toBeGreaterThan(0);
    expect(plan.requiredMonthlySave).toBeGreaterThan(0);
    expect(plan.projections).toHaveLength(4);
    expect(plan.goalForecasts).toHaveLength(1);
    expect(plan.investmentCapacity).toBeGreaterThanOrEqual(0);
  });
});
