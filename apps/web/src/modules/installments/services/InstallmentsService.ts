import { analytics } from "../../../lib/analytics";
import { logger } from "../../../lib/logging";
import { createTransaction } from "../../../services/transactionsService";
import {
  createInstallmentPlan,
  deleteInstallmentPlan,
  getInstallmentPayment,
  getInstallmentPlan,
  listInstallmentPlans,
  markInstallmentPaymentPaid,
  refreshPlanStatusIfComplete,
  type NewInstallmentPlanInput,
} from "../../../services/installmentsService";
import type { InstallmentPlanWithPayments } from "../../../types/installment";
import {
  buildInstallmentSummary,
  buildPlanView,
  type InstallmentSummary,
  type PlanView,
} from "../utils/installmentMath";

/**
 * Porta de domínio Installment Intelligence — Repository via installmentsService.
 * Marcar parcela como paga cria/vincula despesa no ledger (anti double-count via transaction_id).
 */
export class InstallmentsService {
  async list(userId: string): Promise<InstallmentPlanWithPayments[]> {
    return listInstallmentPlans(userId);
  }

  async create(input: NewInstallmentPlanInput): Promise<InstallmentPlanWithPayments> {
    const plan = await createInstallmentPlan(input);
    analytics.track("installment_plan_created", {
      category: plan.category,
      installmentCount: plan.installmentCount,
      totalAmount: plan.totalAmount,
    });
    logger.info("Plano parcelado criado", {
      planId: plan.id,
      count: plan.installmentCount,
    });
    return plan;
  }

  /**
   * Marca parcela paga e garante lançamento de caixa vinculado.
   * Idempotente: se já estiver paga com transaction_id, não recria despesa.
   */
  async markPaid(
    paymentId: string,
    planId: string,
    userId: string,
  ): Promise<{ paymentId: string; transactionId: string | null }> {
    const payment = await getInstallmentPayment(paymentId, userId);

    if (payment.status === "paid" && payment.transactionId) {
      await refreshPlanStatusIfComplete(planId, userId);
      analytics.track("installment_payment_paid", {
        paymentId,
        planId,
        linked: true,
        idempotent: true,
      });
      return { paymentId, transactionId: payment.transactionId };
    }

    let transactionId = payment.transactionId;
    if (!transactionId) {
      const plan = await getInstallmentPlan(planId, userId);
      const description = `${plan.description} (${payment.sequence}/${plan.installmentCount})`;
      const tx = await createTransaction({
        userId,
        type: "despesa",
        description,
        amount: payment.amount,
        category: plan.category,
      });
      transactionId = tx.id;
      logger.info("Parcela vinculada a transação", {
        paymentId,
        transactionId,
        planId,
      });
    }

    await markInstallmentPaymentPaid(paymentId, userId, transactionId);
    await refreshPlanStatusIfComplete(planId, userId);
    analytics.track("installment_payment_paid", {
      paymentId,
      planId,
      linked: Boolean(transactionId),
    });
    return { paymentId, transactionId };
  }

  async remove(planId: string, userId: string): Promise<void> {
    await deleteInstallmentPlan(planId, userId);
    analytics.track("installment_plan_deleted", { planId });
  }

  summarize(
    plans: InstallmentPlanWithPayments[],
    todayISO?: string,
  ): InstallmentSummary {
    return buildInstallmentSummary(plans, todayISO);
  }

  views(plans: InstallmentPlanWithPayments[]): PlanView[] {
    return plans.map(buildPlanView);
  }
}

export const installmentsService = new InstallmentsService();
