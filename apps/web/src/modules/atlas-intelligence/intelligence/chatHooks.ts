/**
 * Integração futura do chat com recomendações locais (v2.1+).
 * NÃO envia contexto financeiro à Edge — só texto derivado para prompt local/mock.
 * Trust boundary: nunca incluir isto como `context` no payload do agente.
 */

import type { Recommendation } from "../types/recommendation";

/** Serializa top recomendações para o chat mock / futuros system prompts no servidor. */
export function serializeRecommendationsForChat(
  recommendations: Recommendation[],
  limit = 5,
): string {
  if (recommendations.length === 0) {
    return "Recomendações locais: nenhuma no momento.";
  }

  const lines = recommendations.slice(0, limit).map((r) => {
    return `- [${r.category}/${r.priority}] ${r.title}: ${r.description} → ${r.suggestedAction}`;
  });

  return ["Recomendações locais (RecommendationEngine):", ...lines].join("\n");
}
