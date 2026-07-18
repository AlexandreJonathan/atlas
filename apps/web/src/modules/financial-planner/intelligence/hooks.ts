/**
 * Pontos de integração futuros com Atlas Intelligence (v1.1+).
 * NÃO gera recomendações automáticas nesta versão.
 */

import type { FinancialPlan } from "../../../types/financialPlan";

export type FinancialPlannerIntelligenceContext = {
  plan: FinancialPlan | null;
};

/** Serializa o plano para prompts futuros da Atlas IA. */
export function serializePlanForIntelligence(
  context: FinancialPlannerIntelligenceContext,
): string {
  const plan = context.plan;
  if (!plan) return "Plano financeiro: não configurado";

  const goals = plan.goalForecasts.slice(0, 8).map((g) => {
    return `- ${g.title}: falta ${g.remainingAmount} · precisa/mês ${g.monthlyNeeded.toFixed(0)} · ${g.etaLabel}`;
  });

  const months = plan.projections.slice(0, 6).map((p) => {
    return `- ${p.label}: saldo ${p.projectedBalance.toFixed(0)} · sobra ${p.projectedSurplus.toFixed(0)}`;
  });

  return [
    `Plano ${plan.month}/${plan.year}: renda ${plan.monthlyIncome} · despesas ${plan.monthlyExpenses} · sobra ${plan.monthlySurplus}`,
    `Capacidade aporte ${plan.contributionCapacity} · investimento ${plan.investmentCapacity} · guardar ${plan.requiredMonthlySave} · risco ${plan.risk}`,
    `Saldo projetado fim do mês: ${plan.projectedBalance}`,
    "Metas:",
    ...goals,
    "Projeções:",
    ...months,
  ].join("\n");
}

/**
 * Placeholder — retorna lista vazia até Financial Planner Insights (v1.1).
 */
export function suggestPlanInsights(
  context: FinancialPlannerIntelligenceContext,
): never[] {
  void context;
  return [];
}
