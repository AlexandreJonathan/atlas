import type { FinancialHubTotals, OpenFinanceSnapshot } from "../types";

/** Consolida totais do hub financeiro a partir do snapshot do provider. */
export function aggregateFinancialHub(snapshot: OpenFinanceSnapshot): FinancialHubTotals {
  const saldo = snapshot.accounts.reduce((total, account) => total + account.balance, 0);
  const investimentos = snapshot.investments.reduce((total, item) => total + item.balance, 0);
  const cartoesUsado = snapshot.cards.reduce((total, card) => total + card.used, 0);
  const cartoesLimite = snapshot.cards.reduce((total, card) => total + card.limit, 0);

  return {
    patrimonio: saldo + investimentos,
    saldo,
    cartoesUsado,
    cartoesLimite,
    contas: snapshot.accounts.length,
    investimentos,
  };
}

export function formatOpenFinanceMoney(valor: number): string {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function formatLastSynced(iso: string | null): string {
  if (!iso) return "Nunca";
  const date = new Date(iso);
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
