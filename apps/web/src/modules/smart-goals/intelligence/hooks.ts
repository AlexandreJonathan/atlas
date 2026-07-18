/**
 * Pontos de integração com Atlas Intelligence.
 * Sugestões automáticas vêm do RecommendationEngine (v2) — este stub
 * apenas serializa metas para contexto futuro do chat.
 */

import type { Goal } from "../../../types/goal";
import type { SmartGoalsSummary } from "../utils/goalMath";

export type SmartGoalsIntelligenceContext = {
  goals: Goal[];
  summary: SmartGoalsSummary;
};

/** Serializa metas para prompts futuros da Atlas IA. */
export function serializeGoalsForIntelligence(
  context: SmartGoalsIntelligenceContext,
): string {
  const lines = context.goals.slice(0, 12).map((goal) => {
    const pct =
      goal.targetAmount > 0
        ? Math.round((goal.currentAmount / goal.targetAmount) * 100)
        : 0;
    return `- ${goal.title} [${goal.category}/${goal.status}]: ${goal.currentAmount}/${goal.targetAmount} (${pct}%) prazo=${goal.targetDate ?? "—"}`;
  });

  return [
    `Metas: ${context.summary.total} · concluídas: ${context.summary.completed} · progresso geral: ${context.summary.overallProgressPercent}%`,
    context.summary.nearest
      ? `Mais próxima: ${context.summary.nearest.title}`
      : "Mais próxima: —",
    ...lines,
  ].join("\n");
}

/**
 * Delegado ao RecommendationEngine (GoalRecommendationRule) na Home.
 * Mantido para compatibilidade — retorna vazio de propósito.
 */
export function suggestGoalInsights(
  context: SmartGoalsIntelligenceContext,
): never[] {
  void context;
  return [];
}
