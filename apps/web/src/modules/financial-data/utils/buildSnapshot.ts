import { MOCK_INVESTMENTS, type MockInvestmentsSnapshot } from "../../../data/mockInvestments";
import type { OpenFinanceSnapshot } from "../../open-finance/types";
import type { FinancialDataErrors, FinancialSnapshot } from "../types";
import {
  deriveBillSlices,
  sumDespesas,
  sumDespesasDoMes,
  sumFixedExpenses,
  sumReceitas,
  sumReceitasDoMes,
} from "./aggregate";
import type { LedgerBundle } from "./loadLedger";

export function buildFinancialSnapshot(input: {
  userId: string;
  providerName: string;
  ledger: LedgerBundle;
  openFinance: OpenFinanceSnapshot | null;
  openFinanceError?: string;
  investments?: MockInvestmentsSnapshot;
}): FinancialSnapshot {
  const investments = input.investments ?? MOCK_INVESTMENTS;
  const { transactions, bills, goals, profile, fixedExpenses } = input.ledger;
  const billSlices = deriveBillSlices(bills);
  const receitas = sumReceitas(transactions);
  const despesas = sumDespesas(transactions);
  const saldo = receitas - despesas;
  const investimentosPatrimonio = investments.patrimonioInvestido;
  const errors: FinancialDataErrors = { ...input.ledger.errors };
  if (input.openFinanceError) {
    errors.openFinance = input.openFinanceError;
  }

  return {
    userId: input.userId,
    fetchedAt: new Date().toISOString(),
    providerName: input.providerName,
    saldo,
    patrimonio: saldo + investimentosPatrimonio,
    investimentosPatrimonio,
    receitas,
    despesas,
    receitasDoMes: sumReceitasDoMes(transactions),
    despesasDoMes: sumDespesasDoMes(transactions),
    quantoPossoGastar: saldo - billSlices.totalPendenteAPagar,
    transactions,
    bills,
    goals,
    profile,
    fixedExpenses,
    totalDespesasFixas: sumFixedExpenses(fixedExpenses),
    totalPendenteAPagar: billSlices.totalPendenteAPagar,
    contasVencidas: billSlices.contasVencidas,
    contasVencendoEmBreve: billSlices.contasVencendoEmBreve,
    accounts: input.openFinance?.accounts ?? [],
    cards: input.openFinance?.cards ?? [],
    openFinance: input.openFinance,
    investments,
    errors,
  };
}
