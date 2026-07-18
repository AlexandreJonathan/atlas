import { useMemo, useState } from "react";
import { getFriendlyErrorMessage } from "../../../lib/errorMessages";
import { useAuth } from "../../../hooks/useAuth";
import type { ExpenseCategory } from "../../../types/budget";
import { useFinancialData } from "../../financial-data";
import { installmentsService } from "../services/InstallmentsService";
import type { InstallmentSummary, PlanView } from "../utils/installmentMath";

export type CreateInstallmentInput = {
  description: string;
  category: ExpenseCategory;
  totalAmount: number;
  installmentCount: number;
  installmentAmount: number;
  firstDueDate: string;
  cardLabel?: string | null;
};

/**
 * Lê planos do snapshot FDL (sem list fetch paralelo).
 * Mutações invalidam o ledger — Budget/Planner/Intelligence atualizam juntos.
 */
export function useInstallments() {
  const { user } = useAuth();
  const userId = user?.id;
  const financial = useFinancialData();
  const [actionError, setActionError] = useState<string | null>(null);

  const plans = useMemo(
    () => financial.snapshot?.installmentPlans ?? [],
    [financial.snapshot?.installmentPlans],
  );
  const loading = financial.loading && financial.snapshot == null;
  const error =
    financial.snapshot?.errors.installments ??
    (financial.error && !financial.snapshot ? financial.error : null);

  const summary: InstallmentSummary = useMemo(
    () => installmentsService.summarize(plans),
    [plans],
  );

  const views: PlanView[] = useMemo(
    () => installmentsService.views(plans),
    [plans],
  );

  function invalidateFdl() {
    if (userId) financial.invalidate("ledger");
  }

  return {
    plans,
    views,
    summary,
    loading,
    error,
    actionError,
    reload: () => {
      invalidateFdl();
    },
    create: async (input: CreateInstallmentInput) => {
      if (!userId) throw new Error("Usuário não autenticado.");
      setActionError(null);
      try {
        await installmentsService.create({ userId, ...input });
        invalidateFdl();
      } catch (erro) {
        const message = getFriendlyErrorMessage(
          erro,
          "Não foi possível criar a compra parcelada.",
        );
        setActionError(message);
        throw erro;
      }
    },
    markPaid: async (paymentId: string, planId: string) => {
      if (!userId) return;
      setActionError(null);
      try {
        await installmentsService.markPaid(paymentId, planId, userId);
        invalidateFdl();
      } catch (erro) {
        setActionError(
          getFriendlyErrorMessage(
            erro,
            "Não foi possível marcar a parcela como paga.",
          ),
        );
      }
    },
    remove: async (planId: string) => {
      if (!userId) return;
      setActionError(null);
      try {
        await installmentsService.remove(planId, userId);
        invalidateFdl();
      } catch (erro) {
        setActionError(
          getFriendlyErrorMessage(erro, "Não foi possível remover o plano."),
        );
      }
    },
  };
}
