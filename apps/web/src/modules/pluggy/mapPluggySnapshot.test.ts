import { describe, expect, it } from "vitest";
import { mapPluggyEdgeToOpenFinance } from "./mapPluggySnapshot";

describe("mapPluggyEdgeToOpenFinance — PluggyProvider mapper", () => {
  it("retorna vazio para null/undefined", () => {
    expect(mapPluggyEdgeToOpenFinance(null).accounts).toEqual([]);
    expect(mapPluggyEdgeToOpenFinance(undefined).banks).toEqual([]);
  });

  it("normaliza balances numéricos e status connected", () => {
    const mapped = mapPluggyEdgeToOpenFinance({
      banks: [
        {
          id: "1",
          name: "Nubank",
          iconKey: "",
          status: "connected",
          lastSyncedAt: "2026-07-01T00:00:00.000Z",
        },
      ],
      accounts: [
        {
          id: "a1",
          bankId: "1",
          bankName: "Nubank",
          name: "Conta",
          type: "CHECKING",
          balance: "123.45" as unknown as number,
        },
      ],
      cards: [],
      investments: [
        {
          id: "i1",
          bankId: "1",
          bankName: "Nubank",
          name: "CDB",
          type: "FIXED",
          balance: 1000,
        },
      ],
      balances: [{ bankId: "1", available: "10" as unknown as number }],
      transactions: [],
      pix: [],
      loans: [],
      fetchedAt: "2026-07-17T00:00:00.000Z",
    });

    expect(mapped.banks[0]?.status).toBe("connected");
    expect(mapped.banks[0]?.iconKey).toBe("unknown");
    expect(mapped.accounts[0]?.balance).toBe(123.45);
    expect(mapped.investments[0]?.balance).toBe(1000);
    expect(mapped.balances[0]?.available).toBe(10);
  });
});
