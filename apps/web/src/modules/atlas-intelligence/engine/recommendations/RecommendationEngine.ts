import { analytics } from "../../../../lib/analytics";
import { logger } from "../../../../lib/logging";
import type {
  Recommendation,
  RecommendationContext,
  RecommendationRule,
} from "../../types/recommendation";
import { BillRecommendationRule } from "./BillRecommendationRule";
import { BudgetRecommendationRule } from "./BudgetRecommendationRule";
import { EconomyRecommendationRule } from "./EconomyRecommendationRule";
import { ExpenseRecommendationRule } from "./ExpenseRecommendationRule";
import { GoalRecommendationRule } from "./GoalRecommendationRule";
import { InvestmentRecommendationRule } from "./InvestmentRecommendationRule";
import { PlannerRecommendationRule } from "./PlannerRecommendationRule";
import { recommendation } from "./helpers";

const DEFAULT_RULES: RecommendationRule[] = [
  BillRecommendationRule,
  BudgetRecommendationRule,
  ExpenseRecommendationRule,
  GoalRecommendationRule,
  InvestmentRecommendationRule,
  PlannerRecommendationRule,
  EconomyRecommendationRule,
];

/**
 * Atlas Intelligence v2 — RecommendationEngine.
 * Regras locais, modulares, sem I/O e sem OpenAI.
 * Nunca inventa dados: cada regra só emite insight com evidência no contexto.
 */
export class RecommendationEngine {
  private readonly rules: RecommendationRule[];

  constructor(rules: RecommendationRule[] = DEFAULT_RULES) {
    this.rules = rules;
  }

  evaluate(context: RecommendationContext): Recommendation[] {
    const collected: Recommendation[] = [];

    for (const rule of this.rules) {
      try {
        collected.push(...rule.evaluate(context));
      } catch (erro) {
        logger.warning("RecommendationEngine: regra falhou", {
          rule: rule.id,
          error: erro instanceof Error ? erro.message : String(erro),
        });
      }
    }

    const deduped = dedupeById(collected);
    const ranked = rankRecommendations(deduped);

    if (ranked.length === 0) {
      ranked.push(
        recommendation({
          id: "rec-all-clear",
          title: "Tudo sob controle",
          description:
            "Nenhum alerta crítico no momento com os dados disponíveis. Continue acompanhando orçamento, metas e contas.",
          priority: 5,
          category: "comportamento",
          suggestedAction: "Explore o Planejamento para ver a evolução projetada.",
          tone: "positiva",
          sourceRule: "fallback",
        }),
      );
    }

    analytics.track("atlas_intelligence_recommendations_generated", {
      count: ranked.length,
      topCategory: ranked[0]?.category,
      topPriority: ranked[0]?.priority,
    });

    logger.info("RecommendationEngine: recomendações geradas", {
      count: ranked.length,
      top: ranked[0]?.id,
    });

    return ranked;
  }

  getTop(context: RecommendationContext, limit = 3): Recommendation[] {
    return this.evaluate(context).slice(0, limit);
  }
}

export function rankRecommendations(
  items: Recommendation[],
): Recommendation[] {
  return [...items].sort(
    (a, b) =>
      a.priority - b.priority || b.createdAt.localeCompare(a.createdAt),
  );
}

function dedupeById(items: Recommendation[]): Recommendation[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

export const recommendationEngine = new RecommendationEngine();

export {
  BillRecommendationRule,
  BudgetRecommendationRule,
  EconomyRecommendationRule,
  ExpenseRecommendationRule,
  GoalRecommendationRule,
  InvestmentRecommendationRule,
  PlannerRecommendationRule,
};
