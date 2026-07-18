import type { RecommendationRule } from "../../types/recommendation";
import { formatMoneyBRL, recommendation } from "./helpers";

/** Capacidade de investimento derivada do Financial Planner. */
export const InvestmentRecommendationRule: RecommendationRule = {
  id: "investments",
  evaluate(context) {
    const out = [];
    const capacity = context.plan?.investmentCapacity ?? 0;

    if (capacity > 0) {
      out.push(
        recommendation({
          id: "rec-invest-capacity",
          title: "Capacidade para investir",
          description: `Você possui capacidade para investir ${formatMoneyBRL(capacity)} este mês (após o ritmo necessário de metas e reserva).`,
          priority: 3,
          category: "investimentos",
          suggestedAction: "Reserve esse valor em investimentos ou na meta de reserva.",
          tone: "positiva",
          sourceRule: this.id,
        }),
      );
    }

    if (context.investimentosPatrimonio > 0) {
      out.push(
        recommendation({
          id: "rec-invest-portfolio",
          title: "Carteira de investimentos",
          description: `Há ${formatMoneyBRL(context.investimentosPatrimonio)} em investimentos para acompanhar (somente leitura).`,
          priority: 5,
          category: "investimentos",
          suggestedAction: "Revise a carteira em Investimentos quando fizer um aporte.",
          tone: "informativa",
          sourceRule: this.id,
        }),
      );
    }

    return out;
  },
};
