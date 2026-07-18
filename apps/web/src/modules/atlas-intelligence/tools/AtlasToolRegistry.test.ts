import { describe, expect, it, vi } from "vitest";
import { MOCK_INVESTMENTS } from "../../../data/mockInvestments";

vi.mock("../../financial-data", () => ({
  financialDataService: {
    ensureLoaded: vi.fn(),
    getMetas: vi.fn(() => []),
  },
}));

vi.mock("../../pluggy", () => ({
  fetchPluggySnapshot: vi.fn(),
  mapPluggyEdgeToOpenFinance: vi.fn(),
}));

import type { FinancialDataService } from "../../financial-data";
import type { FinancialSnapshot } from "../../financial-data/types";
import { AtlasToolRegistry, parseToolCall } from "./AtlasToolRegistry";

function makeSnapshot(): FinancialSnapshot {
  return {
    userId: "user-1",
    fetchedAt: "2026-07-17T12:00:00.000Z",
    providerName: "fake",
    saldo: 1500,
    patrimonio: 1500,
    investimentosPatrimonio: 0,
    receitas: 3000,
    despesas: 1500,
    receitasDoMes: 3000,
    despesasDoMes: 1500,
    quantoPossoGastar: 800,
    transactions: [
      {
        id: "t1",
        userId: "user-1",
        type: "receita",
        description: "Salário",
        amount: 3000,
        createdAt: "2026-07-01T10:00:00.000Z",
      },
    ],
    bills: [],
    goals: [
      {
        id: "g1",
        userId: "user-1",
        title: "Reserva",
        description: null,
        targetAmount: 10_000,
        currentAmount: 2500,
        targetDate: null,
        category: "emergency",
        status: "active",
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      },
    ],
    profile: null,
    fixedExpenses: [],
    totalDespesasFixas: 0,
    totalPendenteAPagar: 0,
    contasVencidas: [],
    contasVencendoEmBreve: [],
    accounts: [],
    cards: [],
    openFinance: null,
    investments: MOCK_INVESTMENTS,
    errors: {},
  };
}

function fakeService(snapshot: FinancialSnapshot): FinancialDataService {
  return {
    ensureLoaded: vi.fn(async () => snapshot),
    getMetas: vi.fn(() => snapshot.goals),
  } as unknown as FinancialDataService;
}

describe("AtlasToolRegistry — caminhos críticos", () => {
  it("parseToolCall rejeita tool fora da allowlist", () => {
    expect(
      parseToolCall({
        id: "call_1",
        function: { name: "deleteAllData", arguments: "{}" },
      }),
    ).toBeNull();
  });

  it("parseToolCall aceita tool conhecida", () => {
    const call = parseToolCall({
      id: "call_1",
      function: { name: "getFinancialSnapshot", arguments: "{}" },
    });
    expect(call).toEqual({
      id: "call_1",
      name: "getFinancialSnapshot",
      arguments: {},
    });
  });

  it("execute getFinancialSnapshot retorna números do FDS", async () => {
    const snapshot = makeSnapshot();
    const registry = new AtlasToolRegistry(fakeService(snapshot));
    const result = await registry.execute(
      { id: "c1", name: "getFinancialSnapshot", arguments: {} },
      "user-1",
    );

    expect(result.ok).toBe(true);
    expect(result.data).toMatchObject({
      saldo: 1500,
      patrimonio: 1500,
      receitasDoMes: 3000,
    });
  });

  it("execute getGoals lê metas do serviço", async () => {
    const snapshot = makeSnapshot();
    const registry = new AtlasToolRegistry(fakeService(snapshot));
    const result = await registry.execute(
      { id: "c2", name: "getGoals", arguments: {} },
      "user-1",
    );

    expect(result.ok).toBe(true);
    expect(result.data).toMatchObject({
      goals: [{ title: "Reserva", progressPct: 25 }],
    });
  });

  it("listDefinitions só expõe allowlist Atlas", () => {
    const registry = new AtlasToolRegistry(fakeService(makeSnapshot()));
    const names = registry.listDefinitions().map((d) => d.function.name);
    expect(names).toEqual([
      "getFinancialSnapshot",
      "getAccounts",
      "getTransactions",
      "getInvestments",
      "getGoals",
    ]);
  });
});
