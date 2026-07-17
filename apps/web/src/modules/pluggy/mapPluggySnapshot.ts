import type { OpenFinanceSnapshot } from "../open-finance/types";
import type { PluggyEdgeSnapshot } from "./types";

const EMPTY: OpenFinanceSnapshot = {
  banks: [],
  accounts: [],
  cards: [],
  investments: [],
  balances: [],
  pix: [],
  loans: [],
};

/**
 * Normaliza o payload da Edge para o snapshot Open Finance da Atlas.
 * Transações Pluggy ficam no DTO da Edge (não misturam no ledger Atlas).
 */
export function mapPluggyEdgeToOpenFinance(raw: PluggyEdgeSnapshot | null | undefined): OpenFinanceSnapshot {
  if (!raw) return structuredClone(EMPTY);

  return {
    banks: (raw.banks ?? []).map((bank) => ({
      id: bank.id,
      name: bank.name,
      iconKey: bank.iconKey || "unknown",
      status: bank.status === "connected" ? "connected" : bank.status,
      lastSyncedAt: bank.lastSyncedAt ?? null,
    })),
    accounts: (raw.accounts ?? []).map((account) => ({
      id: account.id,
      bankId: account.bankId,
      bankName: account.bankName,
      name: account.name,
      type: account.type,
      balance: Number(account.balance) || 0,
      currency: "BRL",
    })),
    cards: (raw.cards ?? []).map((card) => ({
      id: card.id,
      bankId: card.bankId,
      bankName: card.bankName,
      name: card.name,
      lastFour: card.lastFour,
      limit: Number(card.limit) || 0,
      used: Number(card.used) || 0,
      available: Number(card.available) || 0,
      currency: "BRL",
    })),
    investments: (raw.investments ?? []).map((inv) => ({
      id: inv.id,
      bankId: inv.bankId,
      bankName: inv.bankName,
      name: inv.name,
      type: inv.type,
      balance: Number(inv.balance) || 0,
      currency: "BRL",
    })),
    balances: (raw.balances ?? []).map((b) => ({
      bankId: b.bankId,
      available: Number(b.available) || 0,
      currency: "BRL",
      updatedAt: b.updatedAt,
    })),
    pix: raw.pix ?? [],
    loans: raw.loans ?? [],
  };
}
