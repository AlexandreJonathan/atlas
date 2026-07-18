import type { RecommendationRule } from "../../types/recommendation";
import { formatMoneyBRL, recommendation } from "./helpers";

/** Sobra, risco e ritmo de poupança do Financial Planner. */
export const PlannerRecommendationRule: RecommendationRule = {
  id: "planner",
  evaluate(context) {
    const plan = context.plan;
    if (!plan?.configured) return [];

    const out = [];

    if (plan.risk === "alto") {
      out.push(
        recommendation({
          id: "rec-planner-risk-high",
          title: "Risco financeiro elevado",
          description: `O saldo projetado para o fim do mês é ${formatMoneyBRL(plan.projectedBalance)}. O risco está alto com base no seu planejamento.`,
          priority: 1,
          category: "comportamento",
          suggestedAction: "Abra o Planejamento e revise despesas fixas e contas pendentes.",
          tone: "critica",
          sourceRule: this.id,
        }),
      );
    }

    if (plan.monthlySurplus > 0) {
      out.push(
        recommendation({
          id: "rec-planner-surplus",
          title: "Sobra mensal disponível",
          description: `Sua sobra estrutural é ${formatMoneyBRL(plan.monthlySurplus)}. Capacidade de aporte: ${formatMoneyBRL(plan.contributionCapacity)}.`,
          priority: 3,
          category: "economia",
          suggestedAction: "Direcione parte da sobra para metas ou investimentos.",
          tone: "positiva",
          sourceRule: this.id,
        }),
      );
    } else if (plan.monthlySurplus < 0) {
      out.push(
        recommendation({
          id: "rec-planner-deficit",
          title: "Sobra mensal negativa",
          description: `Despesas comprometidas superam a renda em ${formatMoneyBRL(Math.abs(plan.monthlySurplus))}.`,
          priority: 1,
          category: "comportamento",
          suggestedAction: "Renegocie fixas ou aumente a renda no perfil financeiro.",
          tone: "critica",
          sourceRule: this.id,
        }),
      );
    }

    if (plan.requiredMonthlySave > 0) {
      out.push(
        recommendation({
          id: "rec-planner-save-pace",
          title: "Ritmo de poupança",
          description: `Para reserva e metas com prazo, o ritmo necessário é ${formatMoneyBRL(plan.requiredMonthlySave)}/mês.`,
          priority: 4,
          category: "economia",
          suggestedAction: "Acompanhe o ritmo em Planejamento e registre aportes nas metas.",
          tone: "informativa",
          sourceRule: this.id,
        }),
      );
    }

    return out;
  },
};
