import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../../services/transactionsService", () => ({
  createTransaction: vi.fn(),
}));

vi.mock("../../../services/installmentsService", () => ({
  createInstallmentPlan: vi.fn(),
  deleteInstallmentPlan: vi.fn(),
  getInstallmentPayment: vi.fn(),
  getInstallmentPlan: vi.fn(),
  listInstallmentPlans: vi.fn(),
  markInstallmentPaymentPaid: vi.fn(),
  refreshPlanStatusIfComplete: vi.fn(),
}));

vi.mock("../../../lib/analytics", () => ({
  analytics: { track: vi.fn() },
}));

vi.mock("../../../lib/logging", () => ({
  logger: { info: vi.fn(), warning: vi.fn(), error: vi.fn() },
}));

import { createTransaction } from "../../../services/transactionsService";
import {
  getInstallmentPayment,
  getInstallmentPlan,
  markInstallmentPaymentPaid,
  refreshPlanStatusIfComplete,
} from "../../../services/installmentsService";
import { InstallmentsService } from "./InstallmentsService";

const createTransactionMock = vi.mocked(createTransaction);
const getPaymentMock = vi.mocked(getInstallmentPayment);
const getPlanMock = vi.mocked(getInstallmentPlan);
const markPaidMock = vi.mocked(markInstallmentPaymentPaid);
const refreshMock = vi.mocked(refreshPlanStatusIfComplete);

describe("InstallmentsService.markPaid", () => {
  const service = new InstallmentsService();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("cria despesa e vincula transaction_id na parcela", async () => {
    getPaymentMock.mockResolvedValue({
      id: "pay-1",
      planId: "plan-1",
      userId: "u1",
      sequence: 2,
      dueDate: "2026-08-01",
      amount: 150,
      status: "pending",
      paidAt: null,
      transactionId: null,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    });
    getPlanMock.mockResolvedValue({
      id: "plan-1",
      userId: "u1",
      description: "Notebook",
      category: "shopping",
      totalAmount: 1500,
      installmentCount: 10,
      installmentAmount: 150,
      firstDueDate: "2026-07-01",
      cardLabel: "Nubank",
      status: "active",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    });
    createTransactionMock.mockResolvedValue({
      id: "tx-1",
      userId: "u1",
      type: "despesa",
      description: "Notebook (2/10)",
      amount: 150,
      category: "shopping",
      createdAt: "2026-07-18T00:00:00.000Z",
    });
    markPaidMock.mockResolvedValue({
      id: "pay-1",
      planId: "plan-1",
      userId: "u1",
      sequence: 2,
      dueDate: "2026-08-01",
      amount: 150,
      status: "paid",
      paidAt: "2026-07-18T00:00:00.000Z",
      transactionId: "tx-1",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-07-18T00:00:00.000Z",
    });

    const result = await service.markPaid("pay-1", "plan-1", "u1");

    expect(createTransactionMock).toHaveBeenCalledWith({
      userId: "u1",
      type: "despesa",
      description: "Notebook (2/10)",
      amount: 150,
      category: "shopping",
    });
    expect(markPaidMock).toHaveBeenCalledWith("pay-1", "u1", "tx-1");
    expect(refreshMock).toHaveBeenCalledWith("plan-1", "u1");
    expect(result.transactionId).toBe("tx-1");
  });

  it("não recria despesa quando parcela já está paga e vinculada", async () => {
    getPaymentMock.mockResolvedValue({
      id: "pay-1",
      planId: "plan-1",
      userId: "u1",
      sequence: 1,
      dueDate: "2026-07-01",
      amount: 150,
      status: "paid",
      paidAt: "2026-07-01T00:00:00.000Z",
      transactionId: "tx-existing",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-07-01T00:00:00.000Z",
    });

    const result = await service.markPaid("pay-1", "plan-1", "u1");

    expect(createTransactionMock).not.toHaveBeenCalled();
    expect(markPaidMock).not.toHaveBeenCalled();
    expect(refreshMock).toHaveBeenCalledWith("plan-1", "u1");
    expect(result.transactionId).toBe("tx-existing");
  });
});
