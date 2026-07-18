import { describe, expect, it } from "vitest";
import type { InstallmentPlanWithPayments } from "../../../types/installment";
import { buildPaymentSchedule } from "../../../lib/installmentSchedule";
import {
  buildInstallmentSummary,
  buildPlanView,
  monthlyCommitmentMap,
  sumPendingByCategory,
  sumPendingInMonth,
} from "./installmentMath";

function samplePlan(
  overrides: Partial<InstallmentPlanWithPayments> = {},
): InstallmentPlanWithPayments {
  const schedule = buildPaymentSchedule({
    firstDueDate: "2026-07-10",
    installmentCount: 3,
    installmentAmount: 100,
  });
  return {
    id: "p1",
    userId: "u1",
    description: "Notebook",
    category: "shopping",
    totalAmount: 300,
    installmentCount: 3,
    installmentAmount: 100,
    firstDueDate: "2026-07-10",
    cardLabel: "Visa final 1234",
    status: "active",
    createdAt: "2026-07-01T00:00:00.000Z",
    updatedAt: "2026-07-01T00:00:00.000Z",
    payments: schedule.map((s, i) => ({
      id: `pay-${i + 1}`,
      planId: "p1",
      userId: "u1",
      sequence: s.sequence,
      dueDate: s.dueDate,
      amount: s.amount,
      status: "pending" as const,
      paidAt: null,
      transactionId: null,
      createdAt: "2026-07-01T00:00:00.000Z",
      updatedAt: "2026-07-01T00:00:00.000Z",
    })),
    ...overrides,
  };
}

describe("installmentMath", () => {
  it("gera cronograma mensal a partir da primeira data", () => {
    const schedule = buildPaymentSchedule({
      firstDueDate: "2026-01-31",
      installmentCount: 3,
      installmentAmount: 50,
    });
    expect(schedule).toHaveLength(3);
    expect(schedule[0]?.dueDate).toBe("2026-01-31");
    expect(schedule[1]?.dueDate).toBe("2026-02-28");
    expect(schedule[2]?.dueDate).toBe("2026-03-31");
  });

  it("soma comprometimento pending do mês por categoria", () => {
    const plan = samplePlan();
    expect(sumPendingInMonth([plan], 2026, 7)).toBe(100);
    expect(sumPendingByCategory([plan], 2026, 8).shopping).toBe(100);
  });

  it("ignora parcela já vinculada a transaction no orçamento", () => {
    const plan = samplePlan();
    plan.payments[0] = {
      ...plan.payments[0]!,
      transactionId: "tx-1",
    };
    expect(sumPendingInMonth([plan], 2026, 7)).toBe(0);
  });

  it("monta resumo e progresso do plano", () => {
    const plan = samplePlan();
    plan.payments[0] = { ...plan.payments[0]!, status: "paid", paidAt: "2026-07-11" };
    const view = buildPlanView(plan);
    expect(view.paidCount).toBe(1);
    expect(view.remainingCount).toBe(2);
    expect(view.progressPercent).toBe(33);

    const summary = buildInstallmentSummary([plan], "2026-07-15");
    expect(summary.totalCommitted).toBe(200);
    expect(summary.remainingPayments).toBe(2);
    expect(summary.nextPayment?.sequence).toBe(2);

    const map = monthlyCommitmentMap([plan], 2026, 7, 3);
    expect(map["2026-07"]).toBe(0); // first paid / linked not — status paid
    expect(map["2026-08"]).toBe(100);
  });
});
