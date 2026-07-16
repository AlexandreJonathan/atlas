import type { Bank, BankId } from "../types";

/** Catálogo oficial preparado para a Atlas (Missão 11). */
export const BANK_CATALOG: Omit<Bank, "status" | "lastSyncedAt">[] = [
  { id: "nubank", name: "Nubank", iconKey: "nubank" },
  { id: "inter", name: "Inter", iconKey: "inter" },
  { id: "c6", name: "C6 Bank", iconKey: "c6" },
  { id: "itau", name: "Itaú", iconKey: "itau" },
  { id: "santander", name: "Santander", iconKey: "santander" },
  { id: "bradesco", name: "Bradesco", iconKey: "bradesco" },
  { id: "banco_do_brasil", name: "Banco do Brasil", iconKey: "banco_do_brasil" },
  { id: "caixa", name: "Caixa", iconKey: "caixa" },
  { id: "pagbank", name: "PagBank", iconKey: "pagbank" },
  { id: "mercado_pago", name: "Mercado Pago", iconKey: "mercado_pago" },
  { id: "wise", name: "Wise", iconKey: "wise" },
];

export function getCatalogEntry(bankId: BankId) {
  return BANK_CATALOG.find((bank) => bank.id === bankId);
}
