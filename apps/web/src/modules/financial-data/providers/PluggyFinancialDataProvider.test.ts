import { beforeEach, describe, expect, it, vi } from "vitest";
import { MOCK_INVESTMENTS } from "../../../data/mockInvestments";

vi.mock("../../pluggy", () => ({
  fetchPluggySnapshot: vi.fn(),
  mapPluggyEdgeToOpenFinance: vi.fn(),
}));

vi.mock("../utils/loadLedger", () => ({
  loadAtlasLedger: vi.fn(),
}));

import { fetchPluggySnapshot, mapPluggyEdgeToOpenFinance } from "../../pluggy";
import { loadAtlasLedger } from "../utils/loadLedger";
import { PluggyFinancialDataProvider } from "./PluggyFinancialDataProvider";

const emptyLedger = {
  transactions: [],
  bills: [],
  goals: [],
  profile: null,
  fixedExpenses: [],
  installmentPlans: [],
  errors: {},
};

describe("PluggyFinancialDataProvider — caminhos críticos", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(loadAtlasLedger).mockResolvedValue(emptyLedger);
  });

  it("compõe ledger + Open Finance quando snapshot Pluggy OK", async () => {
    vi.mocked(fetchPluggySnapshot).mockResolvedValue({
      banks: [],
      accounts: [],
      cards: [],
      investments: [],
      balances: [],
      transactions: [],
      pix: [],
      loans: [],
      fetchedAt: "2026-07-17T12:00:00.000Z",
    });
    vi.mocked(mapPluggyEdgeToOpenFinance).mockReturnValue({
      banks: [{ id: "b1", name: "Banco", iconKey: "b1", status: "connected", lastSyncedAt: null }],
      accounts: [
        {
          id: "a1",
          bankId: "b1",
          bankName: "Banco",
          name: "Conta",
          type: "checking",
          balance: 50,
          currency: "BRL",
        },
      ],
      cards: [],
      investments: [],
      balances: [],
      pix: [],
      loans: [],
    });

    const provider = new PluggyFinancialDataProvider();
    const snapshot = await provider.fetchSnapshot("user-1");

    expect(provider.name).toBe("pluggy");
    expect(snapshot.providerName).toBe("pluggy");
    expect(snapshot.accounts).toHaveLength(1);
    expect(snapshot.accounts[0]?.balance).toBe(50);
    expect(snapshot.errors.openFinance).toBeUndefined();
  });

  it("fallback ledger-only quando Pluggy falha (não quebra UX)", async () => {
    vi.mocked(fetchPluggySnapshot).mockRejectedValue(new Error("pluggy down"));

    const provider = new PluggyFinancialDataProvider();
    const snapshot = await provider.fetchSnapshot("user-1");

    expect(snapshot.openFinance).toBeNull();
    expect(snapshot.errors.openFinance).toBeTruthy();
    expect(snapshot.investments).toEqual(MOCK_INVESTMENTS);
    expect(loadAtlasLedger).toHaveBeenCalledWith("user-1");
  });
});
