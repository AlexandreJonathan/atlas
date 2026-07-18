import type {
  InstallmentPayment,
  InstallmentPlanWithPayments,
} from "../../../types/installment";
import type { ExpenseCategory } from "../../../types/budget";

export type InstallmentSummary = {
  planCount: number;
  activePlanCount: number;
  totalCommitted: number;
  remainingPayments: number;
  nextPayment: InstallmentPayment | null;
  nextPaymentPlanTitle: string | null;
  releaseMonthLabel: string | null;
  releaseAmount: number;
  currentMonthImpact: number;
};

export type PlanView = {
  plan: InstallmentPlanWithPayments;
  paidCount: number;
  remainingCount: number;
  remainingAmount: number;
  progressRatio: number;
  progressPercent: number;
  nextPayment: InstallmentPayment | null;
};

function parseYearMonth(dueDate: string): { year: number; month: number } {
  const [y, m] = dueDate.split("-").map(Number);
  return { year: y!, month: m! };
}

export function isPaymentInMonth(
  payment: InstallmentPayment,
  year: number,
  month: number,
): boolean {
  const ym = parseYearMonth(payment.dueDate);
  return ym.year === year && ym.month === month;
}

/** Parcelas pending sem transaction vinculada — comprometimento (não caixa). */
export function pendingUnlinkedPayments(
  payments: InstallmentPayment[],
): InstallmentPayment[] {
  return payments.filter(
    (p) => p.status === "pending" && p.transactionId == null,
  );
}

export function sumPendingByCategory(
  plans: InstallmentPlanWithPayments[],
  year: number,
  month: number,
): Partial<Record<ExpenseCategory, number>> {
  const totals: Partial<Record<ExpenseCategory, number>> = {};
  for (const plan of plans) {
    if (plan.status === "cancelled") continue;
    for (const payment of pendingUnlinkedPayments(plan.payments)) {
      if (!isPaymentInMonth(payment, year, month)) continue;
      totals[plan.category] = (totals[plan.category] ?? 0) + payment.amount;
    }
  }
  return totals;
}

export function sumPendingInMonth(
  plans: InstallmentPlanWithPayments[],
  year: number,
  month: number,
): number {
  const byCat = sumPendingByCategory(plans, year, month);
  return Object.values(byCat).reduce((a, b) => a + (b ?? 0), 0);
}

/** Mapa YYYY-MM → total de parcelas pending no horizonte. */
export function monthlyCommitmentMap(
  plans: InstallmentPlanWithPayments[],
  fromYear: number,
  fromMonth: number,
  horizonMonths: number,
): Record<string, number> {
  const map: Record<string, number> = {};
  for (let i = 0; i < horizonMonths; i += 1) {
    const idx = fromYear * 12 + (fromMonth - 1) + i;
    const year = Math.floor(idx / 12);
    const month = (idx % 12) + 1;
    const key = `${year}-${String(month).padStart(2, "0")}`;
    map[key] = sumPendingInMonth(plans, year, month);
  }
  return map;
}

export function buildPlanView(plan: InstallmentPlanWithPayments): PlanView {
  const paid = plan.payments.filter((p) => p.status === "paid");
  const remaining = plan.payments.filter((p) => p.status === "pending");
  const remainingAmount = remaining.reduce((a, p) => a + p.amount, 0);
  const progressRatio =
    plan.installmentCount > 0 ? paid.length / plan.installmentCount : 0;
  const nextPayment =
    remaining.slice().sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0] ??
    null;

  return {
    plan,
    paidCount: paid.length,
    remainingCount: remaining.length,
    remainingAmount,
    progressRatio,
    progressPercent: Math.round(progressRatio * 100),
    nextPayment,
  };
}

function monthLabel(year: number, month: number): string {
  const date = new Date(year, month - 1, 1);
  const label = date.toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function buildInstallmentSummary(
  plans: InstallmentPlanWithPayments[],
  todayISO = new Date().toISOString().slice(0, 10),
): InstallmentSummary {
  const active = plans.filter((p) => p.status === "active");
  const allPending = active.flatMap((p) =>
    pendingUnlinkedPayments(p.payments),
  );
  const totalCommitted = allPending.reduce((a, p) => a + p.amount, 0);
  const nextPayment =
    allPending.slice().sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0] ??
    null;

  let nextPaymentPlanTitle: string | null = null;
  if (nextPayment) {
    nextPaymentPlanTitle =
      active.find((p) => p.id === nextPayment.planId)?.description ?? null;
  }

  const [cy, cm] = todayISO.split("-").map(Number);
  const currentMonthImpact = sumPendingInMonth(active, cy!, cm!);

  // Liberação = mês após a última parcela pending (soma das parcelas desse último mês)
  let releaseMonthLabel: string | null = null;
  let releaseAmount = 0;
  if (allPending.length > 0) {
    const last = allPending
      .slice()
      .sort((a, b) => b.dueDate.localeCompare(a.dueDate))[0]!;
    const { year, month } = parseYearMonth(last.dueDate);
    releaseAmount = sumPendingInMonth(active, year, month);
    // Capacidade liberada a partir do mês seguinte
    const idx = year * 12 + month; // month is 1-based → next month
    const nextYear = Math.floor(idx / 12);
    const nextMonth = (idx % 12) + 1;
    releaseMonthLabel = monthLabel(nextYear, nextMonth);
  }

  return {
    planCount: plans.length,
    activePlanCount: active.length,
    totalCommitted,
    remainingPayments: allPending.length,
    nextPayment,
    nextPaymentPlanTitle,
    releaseMonthLabel,
    releaseAmount,
    currentMonthImpact,
  };
}

/** Meses com maior pressão (top N por compromisso). */
export function pressureMonths(
  plans: InstallmentPlanWithPayments[],
  fromYear: number,
  fromMonth: number,
  horizonMonths = 6,
  top = 3,
): Array<{ year: number; month: number; label: string; amount: number }> {
  const map = monthlyCommitmentMap(plans, fromYear, fromMonth, horizonMonths);
  return Object.entries(map)
    .map(([key, amount]) => {
      const [y, m] = key.split("-").map(Number);
      return {
        year: y!,
        month: m!,
        label: monthLabel(y!, m!),
        amount,
      };
    })
    .filter((row) => row.amount > 0)
    .sort((a, b) => b.amount - a.amount)
    .slice(0, top);
}

/** Planos que terminam em um mês específico (última parcela pending/paid nesse mês). */
export function plansEndingInMonth(
  plans: InstallmentPlanWithPayments[],
  year: number,
  month: number,
): InstallmentPlanWithPayments[] {
  return plans.filter((plan) => {
    if (plan.status === "cancelled") return false;
    const last = plan.payments
      .slice()
      .sort((a, b) => b.sequence - a.sequence)[0];
    if (!last) return false;
    return isPaymentInMonth(last, year, month);
  });
}
