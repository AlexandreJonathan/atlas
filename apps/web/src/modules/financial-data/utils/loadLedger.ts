import { getFriendlyErrorMessage } from "../../../lib/errorMessages";
import { listBills } from "../../../services/billsService";
import { getProfile } from "../../../services/financialProfileService";
import { listFixedExpenses } from "../../../services/fixedExpensesService";
import { listGoals } from "../../../services/goalsService";
import { listInstallmentPlans } from "../../../services/installmentsService";
import { listTransactions } from "../../../services/transactionsService";
import type { Bill } from "../../../types/bill";
import type { FinancialProfile } from "../../../types/financialProfile";
import type { FixedExpense } from "../../../types/fixedExpense";
import type { Goal } from "../../../types/goal";
import type { InstallmentPlanWithPayments } from "../../../types/installment";
import type { Transaction } from "../../../types/transaction";
import type { FinancialDataErrors } from "../types";

export type LedgerBundle = {
  transactions: Transaction[];
  bills: Bill[];
  goals: Goal[];
  profile: FinancialProfile | null;
  fixedExpenses: FixedExpense[];
  installmentPlans: InstallmentPlanWithPayments[];
  errors: FinancialDataErrors;
};

/**
 * Carrega o ledger Atlas (Supabase) com falha parcial por domínio —
 * preserva o isolamento de erros que os hooks antigos tinham.
 */
export async function loadAtlasLedger(userId: string): Promise<LedgerBundle> {
  const errors: FinancialDataErrors = {};

  const [txRes, billsRes, goalsRes, profileRes, fixedRes, installmentsRes] =
    await Promise.all([
      listTransactions(userId).then(
        (data) => ({ ok: true as const, data }),
        (erro: unknown) => {
          errors.transactions = getFriendlyErrorMessage(
            erro,
            "Não foi possível carregar suas movimentações.",
          );
          return { ok: false as const, data: [] as Transaction[] };
        },
      ),
      listBills(userId).then(
        (data) => ({ ok: true as const, data }),
        (erro: unknown) => {
          errors.bills = getFriendlyErrorMessage(
            erro,
            "Não foi possível carregar suas contas.",
          );
          return { ok: false as const, data: [] as Bill[] };
        },
      ),
      listGoals(userId).then(
        (data) => ({ ok: true as const, data }),
        (erro: unknown) => {
          errors.goals = getFriendlyErrorMessage(
            erro,
            "Não foi possível carregar suas metas.",
          );
          return { ok: false as const, data: [] as Goal[] };
        },
      ),
      getProfile(userId).then(
        (data) => ({ ok: true as const, data }),
        (erro: unknown) => {
          errors.profile = getFriendlyErrorMessage(
            erro,
            "Não foi possível carregar seu perfil financeiro.",
          );
          return { ok: false as const, data: null as FinancialProfile | null };
        },
      ),
      listFixedExpenses(userId).then(
        (data) => ({ ok: true as const, data }),
        (erro: unknown) => {
          errors.fixedExpenses = getFriendlyErrorMessage(
            erro,
            "Não foi possível carregar suas despesas fixas.",
          );
          return { ok: false as const, data: [] as FixedExpense[] };
        },
      ),
      listInstallmentPlans(userId).then(
        (data) => ({ ok: true as const, data }),
        (erro: unknown) => {
          errors.installments = getFriendlyErrorMessage(
            erro,
            "Não foi possível carregar suas parcelas.",
          );
          return { ok: false as const, data: [] as InstallmentPlanWithPayments[] };
        },
      ),
    ]);

  return {
    transactions: txRes.data,
    bills: billsRes.data,
    goals: goalsRes.data,
    profile: profileRes.data,
    fixedExpenses: fixedRes.data,
    installmentPlans: installmentsRes.data,
    errors,
  };
}
