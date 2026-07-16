import { BANK_CATALOG } from "./bankCatalog";
import type {
  Bank,
  BankAccount,
  Balance,
  CreditCard,
  Investment,
  Loan,
  OpenFinanceSnapshot,
  Pix,
} from "../types";

const CONNECTED_IDS = new Set(["nubank", "itau", "inter"]);

function buildBanks(): Bank[] {
  return BANK_CATALOG.map((entry) => {
    const connected = CONNECTED_IDS.has(entry.id);
    return {
      ...entry,
      status: connected ? "connected" : "available",
      lastSyncedAt: connected ? "2026-07-15T18:30:00.000Z" : null,
    };
  });
}

const ACCOUNTS: BankAccount[] = [
  {
    id: "acc-nu-1",
    bankId: "nubank",
    bankName: "Nubank",
    name: "Conta Nubank",
    type: "checking",
    balance: 3120.75,
    currency: "BRL",
  },
  {
    id: "acc-itau-1",
    bankId: "itau",
    bankName: "Itaú",
    name: "Conta Corrente",
    type: "checking",
    balance: 4211.75,
    currency: "BRL",
  },
  {
    id: "acc-itau-2",
    bankId: "itau",
    bankName: "Itaú",
    name: "Poupança",
    type: "savings",
    balance: 1100,
    currency: "BRL",
  },
  {
    id: "acc-inter-1",
    bankId: "inter",
    bankName: "Inter",
    name: "Conta Digital",
    type: "checking",
    balance: 890.4,
    currency: "BRL",
  },
];

const CARDS: CreditCard[] = [
  {
    id: "card-nu-1",
    bankId: "nubank",
    bankName: "Nubank",
    name: "Nubank Roxinho",
    lastFour: "4521",
    limit: 5000,
    used: 1280.4,
    available: 3719.6,
    currency: "BRL",
  },
  {
    id: "card-itau-1",
    bankId: "itau",
    bankName: "Itaú",
    name: "Itaú Click",
    lastFour: "8890",
    limit: 8000,
    used: 3200,
    available: 4800,
    currency: "BRL",
  },
];

const INVESTMENTS: Investment[] = [
  {
    id: "inv-nu-1",
    bankId: "nubank",
    bankName: "Nubank",
    name: "Caixinhas",
    type: "fixed_income",
    balance: 2500,
    currency: "BRL",
  },
  {
    id: "inv-inter-1",
    bankId: "inter",
    bankName: "Inter",
    name: "CDB Liquidez Diária",
    type: "fixed_income",
    balance: 1800,
    currency: "BRL",
  },
];

const PIX: Pix[] = [
  {
    id: "pix-1",
    bankId: "nubank",
    direction: "in",
    amount: 350,
    counterpartName: "Maria Silva",
    occurredAt: "2026-07-14T14:22:00.000Z",
    description: "Repasse",
  },
];

const LOANS: Loan[] = [];

function balancesFromAccounts(accounts: BankAccount[]): Balance[] {
  const byBank = new Map<string, number>();
  for (const account of accounts) {
    byBank.set(account.bankId, (byBank.get(account.bankId) ?? 0) + account.balance);
  }
  const now = new Date().toISOString();
  return [...byBank.entries()].map(([bankId, available]) => ({
    bankId: bankId as Balance["bankId"],
    available,
    currency: "BRL" as const,
    updatedAt: now,
  }));
}

/** Snapshot inicial do MockOpenFinanceProvider (estado em memória mutável). */
export function createInitialMockSnapshot(): OpenFinanceSnapshot {
  const accounts = [...ACCOUNTS];
  return {
    banks: buildBanks(),
    accounts,
    cards: [...CARDS],
    investments: [...INVESTMENTS],
    balances: balancesFromAccounts(accounts),
    pix: [...PIX],
    loans: [...LOANS],
  };
}
