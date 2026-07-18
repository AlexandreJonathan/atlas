import { EXPENSE_CATEGORY_LABELS } from "../../../../types/budget";
import type { RecommendationRule } from "../../types/recommendation";
import { formatMoneyBRL, recommendation } from "./helpers";

/** Limites de orçamento perto/acima do teto. */
export const BudgetRecommendationRule: RecommendationRule = {
  id: "budget",
  evaluate(context) {
    const out = [];
    for (const view of context.budgetViews) {
      const label = EXPENSE_CATEGORY_LABELS[view.category];
      if (view.alert === "exceeded") {
        out.push(
          recommendation({
            id: `rec-budget-exceeded-${view.category}`,
            title: `Orçamento de ${label} estourado`,
            description: `Você já usou ${view.usedPercent}% do limite de ${label} (${formatMoneyBRL(view.spentAmount)} de ${formatMoneyBRL(view.limitAmount)}).`,
            priority: 1,
            category: "orcamento",
            suggestedAction: `Revise gastos em ${label} ou ajuste o limite em Orçamento.`,
            tone: "critica",
            sourceRule: this.id,
          }),
        );
      } else if (view.alert === "warning") {
        out.push(
          recommendation({
            id: `rec-budget-warning-${view.category}`,
            title: `Orçamento de ${label} em alerta`,
            description: `Seu orçamento de ${label} atingiu ${view.usedPercent}%. Restam ${formatMoneyBRL(view.remainingAmount)}.`,
            priority: 2,
            category: "orcamento",
            suggestedAction: `Reduza novas despesas em ${label} até o fim do mês.`,
            tone: "atencao",
            sourceRule: this.id,
          }),
        );
      }
    }
    return out;
  },
};
