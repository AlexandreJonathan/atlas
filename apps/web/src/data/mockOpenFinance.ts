export type MockBank = {
  id: string;
  name: string;
  connected: boolean;
};

export type MockCard = {
  id: string;
  name: string;
  lastFour: string;
  limit: number;
  used: number;
};

export type MockAccount = {
  id: string;
  bankName: string;
  type: "corrente" | "poupanca";
  balance: number;
};

export type MockOpenFinanceSnapshot = {
  saldoConsolidado: number;
  banks: MockBank[];
  cards: MockCard[];
  accounts: MockAccount[];
};

/** Dados simulados — preparação para Open Finance; sem integração real. */
export const MOCK_OPEN_FINANCE: MockOpenFinanceSnapshot = {
  saldoConsolidado: 8432.5,
  banks: [
    { id: "bank-1", name: "Nubank", connected: true },
    { id: "bank-2", name: "Itaú", connected: true },
    { id: "bank-3", name: "Banco do Brasil", connected: false },
  ],
  cards: [
    { id: "card-1", name: "Nubank Roxinho", lastFour: "4521", limit: 5000, used: 1280.4 },
    { id: "card-2", name: "Itaú Click", lastFour: "8890", limit: 8000, used: 3200 },
  ],
  accounts: [
    { id: "acc-1", bankName: "Nubank", type: "corrente", balance: 3120.75 },
    { id: "acc-2", bankName: "Itaú", type: "corrente", balance: 4211.75 },
    { id: "acc-3", bankName: "Itaú", type: "poupanca", balance: 1100 },
  ],
};
