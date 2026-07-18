import { describe, expect, it, vi } from "vitest";
import { MOCK_INVESTMENTS } from "../../../data/mockInvestments";

vi.mock("../providers/PluggyFinancialDataProvider", () => ({
  PluggyFinancialDataProvider: class {
    readonly name = "pluggy";
    fetchSnapshot = async () => {
      throw new Error("not used in unit tests");
    };
  },
}));

vi.mock("../../pluggy", () => ({
  fetchPluggySnapshot: vi.fn(),
  mapPluggyEdgeToOpenFinance: vi.fn(),
}));

import type { FinancialDataProvider } from "../providers/FinancialDataProvider";
import type { FinancialSnapshot } from "../types";
import { FinancialDataService } from "./FinancialDataService";

function makeSnapshot(overrides: Partial<FinancialSnapshot> = {}): FinancialSnapshot {
  return {
    userId: "user-1",
    fetchedAt: "2026-07-17T12:00:00.000Z",
    providerName: "fake",
    saldo: 1000,
    patrimonio: 1000,
    investimentosPatrimonio: 0,
    receitas: 2000,
    despesas: 1000,
    receitasDoMes: 2000,
    despesasDoMes: 1000,
    quantoPossoGastar: 500,
    transactions: [],
    bills: [],
    goals: [],
    profile: null,
    fixedExpenses: [],
    installmentPlans: [],
    totalParcelasDoMes: 0,
    totalParcelasPendentes: 0,
    totalDespesasFixas: 0,
    totalPendenteAPagar: 0,
    contasVencidas: [],
    contasVencendoEmBreve: [],
    accounts: [],
    cards: [],
    openFinance: null,
    investments: MOCK_INVESTMENTS,
    errors: {},
    ...overrides,
  };
}

class FakeProvider implements FinancialDataProvider {
  readonly name = "fake";
  calls = 0;
  snapshot = makeSnapshot();

  fetchSnapshot = vi.fn(async (userId: string) => {
    this.calls += 1;
    return { ...this.snapshot, userId, fetchedAt: new Date().toISOString() };
  });
}

describe("FinancialDataService — caminhos críticos", () => {
  it("ensureLoaded cacheia o snapshot e não refetcha sem invalidate", async () => {
    const provider = new FakeProvider();
    const service = new FinancialDataService(provider);

    const first = await service.ensureLoaded("user-1");
    const second = await service.ensureLoaded("user-1");

    expect(first.saldo).toBe(1000);
    expect(second).toBe(first);
    expect(provider.fetchSnapshot).toHaveBeenCalledTimes(1);
  });

  it("sync força novo fetch mesmo com cache", async () => {
    const provider = new FakeProvider();
    const service = new FinancialDataService(provider);

    await service.ensureLoaded("user-1");
    provider.snapshot = makeSnapshot({ saldo: 2500 });
    const synced = await service.sync("user-1");

    expect(synced.saldo).toBe(2500);
    expect(provider.fetchSnapshot).toHaveBeenCalledTimes(2);
  });

  it("chamadas sync concorrentes deduplicam o fetch do provider", async () => {
    const provider = new FakeProvider();
    let resolveFetch!: (value: FinancialSnapshot) => void;
    provider.fetchSnapshot = vi.fn(
      () =>
        new Promise<FinancialSnapshot>((resolve) => {
          resolveFetch = resolve;
        }),
    );
    const service = new FinancialDataService(provider);

    const p1 = service.sync("user-1");
    const p2 = service.sync("user-1");
    expect(provider.fetchSnapshot).toHaveBeenCalledTimes(1);

    resolveFetch(makeSnapshot({ saldo: 42 }));
    const [a, b] = await Promise.all([p1, p2]);
    expect(a.saldo).toBe(42);
    expect(b.saldo).toBe(42);
    expect(provider.fetchSnapshot).toHaveBeenCalledTimes(1);
  });

  it("invalidate limpa o cache e agenda sync quando userId é informado", async () => {
    const provider = new FakeProvider();
    const service = new FinancialDataService(provider);

    await service.ensureLoaded("user-1");
    expect(service.getSnapshot()).not.toBeNull();

    provider.snapshot = makeSnapshot({ saldo: 9 });
    service.invalidate("all", "user-1");
    expect(service.getSnapshot()).toBeNull();

    await vi.waitFor(() => {
      expect(service.getSnapshot()?.saldo).toBe(9);
    });
    expect(provider.fetchSnapshot).toHaveBeenCalledTimes(2);
  });

  it("propaga erro do provider e registra estado de erro", async () => {
    const provider = new FakeProvider();
    provider.fetchSnapshot = vi.fn(async () => {
      throw new Error("provider down");
    });
    const service = new FinancialDataService(provider);

    await expect(service.ensureLoaded("user-1")).rejects.toThrow("provider down");
    expect(service.getState().error).toBe("provider down");
    expect(service.getSnapshot()).toBeNull();
  });
});
