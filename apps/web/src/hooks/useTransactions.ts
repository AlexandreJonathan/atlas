import { useCallback, useEffect, useMemo, useState } from "react";
import { getTodayISO } from "../lib/dateUtils";
import { getFriendlyErrorMessage } from "../lib/errorMessages";
import {
  createTransaction,
  deleteTransaction,
  listTransactions,
} from "../services/transactionsService";
import type { ExpenseCategory } from "../types/budget";
import type { Transaction, TransactionType } from "../types/transaction";
import { useAuth } from "./useAuth";

type NovaTransacao = {
  type: TransactionType;
  description: string;
  amount: number;
  category?: ExpenseCategory | null;
};

export function useTransactions() {
  const { user } = useAuth();
  const userId = user?.id;

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const buscarTransacoes = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const dados = await listTransactions(id);
      setTransactions(dados);
    } catch (erro) {
      setError(getFriendlyErrorMessage(erro, "Não foi possível carregar suas movimentações."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!userId) {
      return;
    }

    // O disparo é adiado em uma microtask para que as atualizações de estado
    // de "buscarTransacoes" ocorram fora da fase de execução síncrona do
    // efeito (exigência do react-hooks/set-state-in-effect).
    let ativo = true;
    Promise.resolve().then(() => {
      if (ativo) buscarTransacoes(userId);
    });

    return () => {
      ativo = false;
    };
  }, [userId, buscarTransacoes]);

  async function recarregar() {
    if (!userId) return;
    await buscarTransacoes(userId);
  }

  async function adicionar(input: NovaTransacao) {
    if (!userId) {
      throw new Error("Usuário não autenticado.");
    }

    const nova = await createTransaction({ userId, ...input });
    setTransactions((atual) => [nova, ...atual]);
  }

  async function remover(id: string) {
    if (!userId) return;
    setActionError(null);

    try {
      await deleteTransaction(id, userId);
      setTransactions((atual) => atual.filter((item) => item.id !== id));
    } catch (erro) {
      // Erro isolado em "actionError" (e não em "error") para não esconder
      // a lista já carregada — essa falha é apenas da ação de remover.
      setActionError(getFriendlyErrorMessage(erro, "Não foi possível remover a movimentação."));
    }
  }

  // Agregados derivados memoizados (mesmo padrão de useBills/useGoals/
  // useFixedExpenses) — evitam recalcular os filtros/reduces sobre a lista
  // inteira em renders que não alteraram "transactions".
  const receitas = useMemo(
    () => transactions.filter((item) => item.type === "receita").reduce((total, item) => total + item.amount, 0),
    [transactions],
  );

  const despesas = useMemo(
    () => transactions.filter((item) => item.type === "despesa").reduce((total, item) => total + item.amount, 0),
    [transactions],
  );

  const saldo = receitas - despesas;

  // "Mês atual" derivado do prefixo "YYYY-MM" de createdAt — suficiente para
  // o uso atual (alimenta a recomendação "gastos acima da renda do mês");
  // uma janela com fuso horário mais precisa pode ser revisitada se
  // necessário (ver roadmap/backlog.md).
  const mesAtual = getTodayISO().slice(0, 7);

  const receitasDoMes = useMemo(
    () =>
      transactions
        .filter((item) => item.type === "receita" && item.createdAt.slice(0, 7) === mesAtual)
        .reduce((total, item) => total + item.amount, 0),
    [transactions, mesAtual],
  );

  const despesasDoMes = useMemo(
    () =>
      transactions
        .filter((item) => item.type === "despesa" && item.createdAt.slice(0, 7) === mesAtual)
        .reduce((total, item) => total + item.amount, 0),
    [transactions, mesAtual],
  );

  return {
    transactions,
    loading,
    error,
    actionError,
    receitas,
    despesas,
    saldo,
    receitasDoMes,
    despesasDoMes,
    adicionar,
    remover,
    recarregar,
  };
}
