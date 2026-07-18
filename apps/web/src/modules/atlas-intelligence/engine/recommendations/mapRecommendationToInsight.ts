import type { Insight, InsightCategory } from "../../types";
import type { Recommendation, RecommendationCategory } from "../../types/recommendation";

const CATEGORY_MAP: Record<RecommendationCategory, InsightCategory> = {
  economia: "economia",
  orcamento: "despesa",
  metas: "meta",
  investimentos: "investimento",
  contas: "conta",
  receitas: "economia",
  despesas: "despesa",
  comportamento: "geral",
};

/** Adapta Recommendation (v2) → Insight (contrato legado do provider/UI). */
export function mapRecommendationToInsight(rec: Recommendation): Insight {
  return {
    id: rec.id,
    title: rec.title,
    message: rec.description,
    priority: rec.priority,
    category: CATEGORY_MAP[rec.category],
    tone: rec.tone,
    suggestedAction: rec.suggestedAction,
    createdAt: rec.createdAt,
  };
}
