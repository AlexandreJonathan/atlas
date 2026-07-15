import { useMemo } from "react";
import type { useBills } from "./useBills";
import type { useTransactions } from "./useTransactions";

type TransactionsSlice = Pick<
  ReturnType<typeof useTransactions>,
  "saldo" | "receitas" | "despesas" | "receitasDoMes" | "despesasDoMes" | "loading" | "error"
>;

type BillsSlice = Pick<ReturnType<typeof useBills>, "totalPendenteAPagar" | "loading" | "error">;

// Recebe os retornos já obtidos de useTransactions()/useBills() em vez de
// chamar esses hooks internamente — evita duas buscas duplicadas do mesmo
// dado quando os widgets (Dashboard, FinancialSummaryCards, painéis) também
// precisam desses hooks. Dashboard.tsx é o único ponto que chama
// useTransactions/useBills; este hook só deriva/compõe o que já foi
// carregado.
export function useFinancialSummary(transacoes: TransactionsSlice, contas: BillsSlice) {
  const quantoPossoGastar = useMemo(
    () => transacoes.saldo - contas.totalPendenteAPagar,
    [transacoes.saldo, contas.totalPendenteAPagar],
  );

  return {
    saldo: transacoes.saldo,
    receitas: transacoes.receitas,
    despesas: transacoes.despesas,
    receitasDoMes: transacoes.receitasDoMes,
    despesasDoMes: transacoes.despesasDoMes,
    quantoPossoGastar,
    loading: transacoes.loading || contas.loading,
    error: transacoes.error ?? contas.error,
  };
}
