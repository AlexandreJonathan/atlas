import type { RecommendationRule } from "../../types/recommendation";
import { formatMoneyBRL, recommendation } from "./helpers";

/** Ritmo de metas e antecipação com capacidade real de aporte. */
export const GoalRecommendationRule: RecommendationRule = {
  id: "goals",
  evaluate(context) {
    const out = [];
    const capacity = context.plan?.contributionCapacity ?? 0;

    for (const forecast of context.goalForecasts) {
      if (forecast.remainingAmount <= 0) {
        out.push(
          recommendation({
            id: `rec-goal-done-${forecast.goalId}`,
            title: "Meta concluída",
            description: `Você concluiu a meta “${forecast.title}”.`,
            priority: 2,
            category: "metas",
            suggestedAction: "Celebre e defina a próxima meta em Smart Goals.",
            tone: "positiva",
            sourceRule: this.id,
          }),
        );
        continue;
      }

      if (!forecast.onTrack && forecast.monthlyNeeded > 0) {
        out.push(
          recommendation({
            id: `rec-goal-offtrack-${forecast.goalId}`,
            title: `Meta “${forecast.title}” fora do ritmo`,
            description: `Para manter o prazo, o ritmo necessário é ${formatMoneyBRL(forecast.monthlyNeeded)}/mês. Capacidade atual: ${formatMoneyBRL(capacity)}.`,
            priority: 2,
            category: "metas",
            suggestedAction: "Ajuste o prazo, aumente aportes ou revise o orçamento.",
            tone: "atencao",
            sourceRule: this.id,
          }),
        );
      }

      if (
        capacity > 0 &&
        forecast.monthsToDeadline != null &&
        forecast.monthlyNeeded > 0 &&
        capacity > forecast.monthlyNeeded
      ) {
        const monthsAtCapacity = Math.ceil(forecast.remainingAmount / capacity);
        const monthsSaved = forecast.monthsToDeadline - monthsAtCapacity;
        if (monthsSaved >= 1) {
          out.push(
            recommendation({
              id: `rec-goal-accelerate-${forecast.goalId}`,
              title: "Antecipe sua meta",
              description: `Se economizar ${formatMoneyBRL(capacity)} por mês, a meta “${forecast.title}” pode ser concluída cerca de ${monthsSaved} mês(es) antes.`,
              priority: 3,
              category: "metas",
              suggestedAction: `Registre um aporte em “${forecast.title}” com parte da capacidade mensal.`,
              tone: "positiva",
              sourceRule: this.id,
            }),
          );
        }
      }
    }

    if (context.goals.filter((g) => g.status === "active").length === 0) {
      // só sugere criar meta se o usuário já tem perfil/plano (evidência de uso)
      if (context.plan?.configured) {
        out.push(
          recommendation({
            id: "rec-goal-none",
            title: "Nenhuma meta ativa",
            description: "Seu planejamento está configurado, mas ainda não há metas ativas para acompanhar.",
            priority: 4,
            category: "metas",
            suggestedAction: "Crie uma meta em Smart Goals com valor e prazo.",
            tone: "informativa",
            sourceRule: this.id,
          }),
        );
      }
    }

    return out;
  },
};
