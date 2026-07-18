import type { RecommendationRule } from "../../types/recommendation";
import { formatMoneyBRL, recommendation } from "./helpers";

/** Insights sobre compras parceladas e liberação futura de capacidade. */
export const InstallmentRecommendationRule: RecommendationRule = {
  id: "installments",
  evaluate(context) {
    const summary = context.installmentSummary;
    if (!summary || summary.activePlanCount === 0) return [];

    const out = [];

    if (summary.totalCommitted > 0) {
      out.push(
        recommendation({
          id: "rec-installments-committed",
          title: "Compromisso em parcelas",
          description: `Você possui ${formatMoneyBRL(summary.totalCommitted)} comprometidos em parcelas futuras.`,
          priority: 2,
          category: "despesas",
          suggestedAction: "Revise o cronograma em Parcelas e o impacto no Planejamento.",
          tone: "atencao",
          sourceRule: this.id,
        }),
      );
    }

    if (context.plansEndingSoon.length > 0) {
      const count = context.plansEndingSoon.length;
      const first = context.plansEndingSoon[0]!;
      const [y, m] = first.lastDueDate.split("-").map(Number);
      const label = new Date(y!, m! - 1, 1).toLocaleDateString("pt-BR", {
        month: "long",
      });
      out.push(
        recommendation({
          id: "rec-installments-ending",
          title: "Parcelas terminando",
          description: `Em ${label} terminam ${count} compra(s) parcelada(s).`,
          priority: 3,
          category: "economia",
          suggestedAction: "Planeje redirecionar o valor liberado para metas ou investimentos.",
          tone: "positiva",
          sourceRule: this.id,
        }),
      );
    }

    if (summary.releaseAmount > 0 && summary.releaseMonthLabel) {
      out.push(
        recommendation({
          id: "rec-installments-release",
          title: "Capacidade após o fim das parcelas",
          description: `Sua capacidade de investimento pode aumentar cerca de ${formatMoneyBRL(summary.releaseAmount)} após ${summary.releaseMonthLabel}.`,
          priority: 3,
          category: "investimentos",
          suggestedAction: "Reserve esse valor futuro no Planejamento ou em uma meta.",
          tone: "positiva",
          sourceRule: this.id,
        }),
      );
    }

    if (context.installmentPressure.length > 0) {
      const top = context.installmentPressure[0]!;
      const quarterPressure = context.installmentPressure
        .slice(0, 3)
        .reduce((a, r) => a + r.amount, 0);
      if (top.amount > 0) {
        out.push(
          recommendation({
            id: "rec-installments-pressure",
            title: "Pressão financeira à frente",
            description: `O próximo trimestre concentra cerca de ${formatMoneyBRL(quarterPressure)} em parcelas; o mês mais pressionado é ${top.label} (${formatMoneyBRL(top.amount)}).`,
            priority: 2,
            category: "comportamento",
            suggestedAction: "Ajuste o orçamento desses meses ou antecipe quitações se fizer sentido.",
            tone: "atencao",
            sourceRule: this.id,
          }),
        );
      }
    }

    return out;
  },
};
