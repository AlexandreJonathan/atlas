/**
 * Serialização para Atlas Intelligence — regras ficam no RecommendationEngine.
 */

import type { InstallmentPlanWithPayments } from "../../../types/installment";
import type { InstallmentSummary } from "../utils/installmentMath";

export type InstallmentsIntelligenceContext = {
  plans: InstallmentPlanWithPayments[];
  summary: InstallmentSummary;
};

export function serializeInstallmentsForIntelligence(
  context: InstallmentsIntelligenceContext,
): string {
  const lines = context.plans.slice(0, 10).map((plan) => {
    const pending = plan.payments.filter((p) => p.status === "pending").length;
    return `- ${plan.description} [${plan.category}]: ${pending}/${plan.installmentCount} restantes · parcela ${plan.installmentAmount}`;
  });

  return [
    `Parcelas: comprometido ${context.summary.totalCommitted} · restantes ${context.summary.remainingPayments} · impacto mês ${context.summary.currentMonthImpact}`,
    context.summary.releaseMonthLabel
      ? `Liberação prevista: ${context.summary.releaseMonthLabel} (~${context.summary.releaseAmount})`
      : "Liberação prevista: —",
    ...lines,
  ].join("\n");
}
