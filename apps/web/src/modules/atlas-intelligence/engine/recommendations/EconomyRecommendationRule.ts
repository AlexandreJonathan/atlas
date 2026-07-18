import type { RecommendationRule } from "../../types/recommendation";
import { formatMoneyBRL, recommendation } from "./helpers";

/** Economia do mês e tendência vs mês anterior (quando houver dados). */
export const EconomyRecommendationRule: RecommendationRule = {
  id: "economy",
  evaluate(context) {
    const out = [];
    const economiaMes = context.receitasDoMes - context.despesasDoMes;

    if (
      context.receitasMesAnterior != null &&
      context.despesasMesAnterior != null
    ) {
      const economiaAnterior =
        context.receitasMesAnterior - context.despesasMesAnterior;
      if (economiaMes > economiaAnterior && economiaMes > 0) {
        out.push(
          recommendation({
            id: "rec-economy-trend-up",
            title: "Economia em alta",
            description: `Você economizou mais que no mês passado (${formatMoneyBRL(economiaMes)} neste mês vs ${formatMoneyBRL(economiaAnterior)} no anterior).`,
            priority: 3,
            category: "economia",
            suggestedAction: "Mantenha o ritmo e direcione o excedente a uma meta.",
            tone: "positiva",
            sourceRule: this.id,
          }),
        );
      }
    } else if (economiaMes > 0 && context.receitasDoMes > 0) {
      out.push(
        recommendation({
          id: "rec-economy-month",
          title: "Mês no azul",
          description: `Você economizou ${formatMoneyBRL(economiaMes)} neste mês (receitas − despesas registradas).`,
          priority: 3,
          category: "economia",
          suggestedAction: "Considere aportar parte desse valor em uma meta.",
          tone: "positiva",
          sourceRule: this.id,
        }),
      );
    }

    return out;
  },
};
