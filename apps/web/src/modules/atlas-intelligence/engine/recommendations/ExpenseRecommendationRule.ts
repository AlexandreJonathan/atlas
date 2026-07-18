import { EXPENSE_CATEGORIES, EXPENSE_CATEGORY_LABELS } from "../../../../types/budget";
import type { RecommendationRule } from "../../types/recommendation";
import { formatMoneyBRL, percentDelta, recommendation } from "./helpers";

/** Comparativo de despesas por categoria vs mês anterior (só com histórico). */
export const ExpenseRecommendationRule: RecommendationRule = {
  id: "expenses",
  evaluate(context) {
    const out = [];

    for (const category of EXPENSE_CATEGORIES) {
      const current = context.spentByCategoryCurrent[category] ?? 0;
      const previous = context.spentByCategoryPrevious[category] ?? 0;
      if (current <= 0 || previous <= 0) continue;

      const delta = percentDelta(current, previous);
      if (delta == null || delta < 10) continue;

      const label = EXPENSE_CATEGORY_LABELS[category];
      out.push(
        recommendation({
          id: `rec-expense-up-${category}`,
          title: `Gasto maior em ${label}`,
          description: `Você gastou ${delta}% mais com ${label} este mês (${formatMoneyBRL(current)} vs ${formatMoneyBRL(previous)} no mês passado).`,
          priority: delta >= 25 ? 2 : 3,
          category: "despesas",
          suggestedAction: `Confira os lançamentos de ${label} e o limite no Orçamento.`,
          tone: "atencao",
          sourceRule: this.id,
        }),
      );
    }

    if (
      context.despesasDoMes > 0 &&
      context.receitasDoMes > 0 &&
      context.despesasDoMes > context.receitasDoMes
    ) {
      const gap = context.despesasDoMes - context.receitasDoMes;
      out.push(
        recommendation({
          id: "rec-expense-over-income",
          title: "Despesas acima das receitas",
          description: `Neste mês as despesas superam as receitas em ${formatMoneyBRL(gap)}.`,
          priority: 2,
          category: "despesas",
          suggestedAction: "Priorize contas essenciais e pause gastos variáveis.",
          tone: "atencao",
          sourceRule: this.id,
        }),
      );
    }

    return out;
  },
};
