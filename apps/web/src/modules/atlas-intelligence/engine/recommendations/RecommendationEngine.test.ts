import { describe, expect, it } from "vitest";
import type { Goal } from "../../../../types/goal";
import type { RecommendationContext } from "../../types/recommendation";
import { RecommendationEngine } from "./RecommendationEngine";
import { BudgetRecommendationRule } from "./BudgetRecommendationRule";
import { GoalRecommendationRule } from "./GoalRecommendationRule";
import { InvestmentRecommendationRule } from "./InvestmentRecommendationRule";

function baseContext(
  overrides: Partial<RecommendationContext> = {},
): RecommendationContext {
  return {
    hojeISO: "2026-07-15",
    saldo: 2000,
    patrimonio: 5000,
    receitasDoMes: 4000,
    despesasDoMes: 2500,
    receitasMesAnterior: 3800,
    despesasMesAnterior: 3000,
    contasProximas: [],
    contasVencidas: [],
    goals: [],
    goalForecasts: [],
    budgetSummary: null,
    budgetViews: [],
    plan: null,
    risco: "baixo",
    transactions: [],
    spentByCategoryCurrent: {},
    spentByCategoryPrevious: {},
    investimentosPatrimonio: 0,
    ...overrides,
  };
}

describe("RecommendationEngine", () => {
  it("alerta orçamento perto do limite com evidência real", () => {
    const engine = new RecommendationEngine([BudgetRecommendationRule]);
    const result = engine.evaluate(
      baseContext({
        budgetViews: [
          {
            category: "leisure",
            limitAmount: 1000,
            spentAmount: 850,
            remainingAmount: 150,
            usedRatio: 0.85,
            usedPercent: 85,
            alert: "warning",
            budgetCategoryId: "bc1",
          },
        ],
      }),
    );

    expect(result.some((r) => r.id === "rec-budget-warning-leisure")).toBe(true);
    expect(result[0]?.description).toContain("85%");
    expect(result[0]?.suggestedAction).toBeTruthy();
  });

  it("sugere antecipar meta só quando capacidade supera o ritmo", () => {
    const engine = new RecommendationEngine([GoalRecommendationRule]);
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

    const result = engine.evaluate(
      baseContext({
        goals: [goal],
        goalForecasts: [
          {
            goalId: "g1",
            title: "Viagem",
            remainingAmount: 6000,
            monthlyNeeded: 1200,
            monthsToDeadline: 5,
            monthsAtCapacity: 3,
            onTrack: true,
            etaLabel: "No ritmo",
          },
        ],
        plan: {
          id: "p1",
          userId: "u1",
          year: 2026,
          month: 7,
          configured: true,
          monthlyIncome: 5000,
          monthlyExpenses: 2000,
          monthlySurplus: 3000,
          contributionCapacity: 2000,
          investmentCapacity: 800,
          projectedBalance: 4000,
          dailySpendAllowance: 100,
          requiredMonthlySave: 1200,
          budgetRemaining: 500,
          risk: "baixo",
          goalForecasts: [],
          projections: [],
          generatedAt: "2026-07-15T00:00:00.000Z",
        },
      }),
    );

    const accelerate = result.find((r) => r.id === "rec-goal-accelerate-g1");
    expect(accelerate).toBeTruthy();
    expect(accelerate?.description).toMatch(/mês\(es\) antes/);
  });

  it("expõe capacidade de investimento do planner sem inventar valor", () => {
    const engine = new RecommendationEngine([InvestmentRecommendationRule]);
    const withCapacity = engine.evaluate(
      baseContext({
        plan: {
          id: "p1",
          userId: "u1",
          year: 2026,
          month: 7,
          configured: true,
          monthlyIncome: 5000,
          monthlyExpenses: 2000,
          monthlySurplus: 3000,
          contributionCapacity: 2000,
          investmentCapacity: 430,
          projectedBalance: 4000,
          dailySpendAllowance: 100,
          requiredMonthlySave: 500,
          budgetRemaining: 0,
          risk: "baixo",
          goalForecasts: [],
          projections: [],
          generatedAt: "2026-07-15T00:00:00.000Z",
        },
      }),
    );

    expect(withCapacity.some((r) => r.id === "rec-invest-capacity")).toBe(true);
    expect(withCapacity.find((r) => r.id === "rec-invest-capacity")?.description).toContain(
      "430",
    );

    const empty = engine.evaluate(baseContext({ plan: null }));
    expect(empty.some((r) => r.id === "rec-invest-capacity")).toBe(false);
  });

  it("fallback explicável quando nenhuma regra dispara", () => {
    const engine = new RecommendationEngine([]);
    const result = engine.getTop(baseContext(), 3);
    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe("rec-all-clear");
  });
});
