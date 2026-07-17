import { addDaysISO, getTodayISO } from "../../../lib/dateUtils";
import type { Bill } from "../../../types/bill";
import type { FixedExpense } from "../../../types/fixedExpense";
import type { Transaction } from "../../../types/transaction";

export const BILLS_DUE_SOON_DAYS = 7;

export function sumReceitas(transactions: Transaction[]): number {
  return transactions
    .filter((item) => item.type === "receita")
    .reduce((total, item) => total + item.amount, 0);
}

export function sumDespesas(transactions: Transaction[]): number {
  return transactions
    .filter((item) => item.type === "despesa")
    .reduce((total, item) => total + item.amount, 0);
}

export function sumReceitasDoMes(transactions: Transaction[], mesAtual = getTodayISO().slice(0, 7)): number {
  return transactions
    .filter((item) => item.type === "receita" && item.createdAt.slice(0, 7) === mesAtual)
    .reduce((total, item) => total + item.amount, 0);
}

export function sumDespesasDoMes(transactions: Transaction[], mesAtual = getTodayISO().slice(0, 7)): number {
  return transactions
    .filter((item) => item.type === "despesa" && item.createdAt.slice(0, 7) === mesAtual)
    .reduce((total, item) => total + item.amount, 0);
}

export function deriveBillSlices(bills: Bill[]) {
  const hoje = getTodayISO();
  const limite = addDaysISO(hoje, BILLS_DUE_SOON_DAYS);
  const contasPendentes = bills.filter((item) => item.status === "pendente");
  const contasVencidas = contasPendentes.filter((item) => item.dueDate < hoje);
  const contasVencendoEmBreve = contasPendentes.filter(
    (item) => item.dueDate >= hoje && item.dueDate <= limite,
  );
  const totalPendenteAPagar = contasPendentes
    .filter((item) => item.type === "a_pagar")
    .reduce((total, item) => total + item.amount, 0);

  return { contasVencidas, contasVencendoEmBreve, totalPendenteAPagar };
}

export function sumFixedExpenses(fixedExpenses: FixedExpense[]): number {
  return fixedExpenses.reduce((total, item) => total + item.amount, 0);
}
