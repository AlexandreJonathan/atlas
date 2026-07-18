/**
 * Pontos de integração futuros com Atlas Intelligence (v1.1+).
 * NÃO gera recomendações automáticas nesta versão.
 */

import type { Goal } from "../../../types/goal";
import type { BudgetWithCategories } from "../../../types/budget";
import type { BudgetMonthSummary, CategorySpendView } from "../utils/budgetMath";
import { budgetCapacityForGoals } from "../utils/budgetMath";

export type BudgetIntelligenceContext = {
  budget: BudgetWithCategories | null;
  summary: BudgetMonthSummary | null;
  views: CategorySpendView[];
  /** Opcional — ponte com Smart Goals para recomendações futuras. */
  goals?: Goal[];
};

/** Serializa orçamento (+ metas opcionais) para prompts futuros da Atlas IA. */
export function serializeBudgetForIntelligence(
  context: BudgetIntelligenceContext,
): string {
  const summary = context.summary;
  const lines = context.views.slice(0, 12).map((view) => {
    return `- ${view.category}: gasto ${view.spentAmount}/${view.limitAmount} (${view.usedPercent}%) alert=${view.alert}`;
  });

  const capacity = budgetCapacityForGoals(summary);
  const goalsNote =
    context.goals && context.goals.length > 0
      ? `Metas ativas: ${context.goals.filter((g) => g.status === "active").length} · capacidade orçamentária residual: ${capacity}`
      : `Capacidade orçamentária residual: ${capacity}`;

  return [
    summary
      ? `Orçamento ${summary.month}/${summary.year}: limite ${summary.totalLimit} · gasto ${summary.totalSpent} · uso ${summary.overallUsedPercent}% · alertas ${summary.warningCount + summary.exceededCount}`
      : "Orçamento: nenhum mês configurado",
    goalsNote,
    ...lines,
  ].join("\n");
}

/**
 * Placeholder — retorna lista vazia até Budget Insights (v1.1).
 */
export function suggestBudgetInsights(
  context: BudgetIntelligenceContext,
): never[] {
  void context;
  return [];
}
