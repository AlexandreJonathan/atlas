import { useCallback, useEffect, useMemo, useState } from "react";
import { getFriendlyErrorMessage } from "../lib/errorMessages";
import {
  createFixedExpense,
  deleteFixedExpense,
  listFixedExpenses,
} from "../services/fixedExpensesService";
import type { FixedExpense } from "../types/fixedExpense";
import { useAuth } from "./useAuth";

type NovaDespesaFixa = {
  description: string;
  amount: number;
};

export function useFixedExpenses() {
  const { user } = useAuth();
  const userId = user?.id;

  const [fixedExpenses, setFixedExpenses] = useState<FixedExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const buscarDespesasFixas = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const dados = await listFixedExpenses(id);
      setFixedExpenses(dados);
    } catch (erro) {
      setError(getFriendlyErrorMessage(erro, "Não foi possível carregar suas despesas fixas."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!userId) {
      return;
    }

    let ativo = true;
    Promise.resolve().then(() => {
      if (ativo) buscarDespesasFixas(userId);
    });

    return () => {
      ativo = false;
    };
  }, [userId, buscarDespesasFixas]);

  async function recarregar() {
    if (!userId) return;
    await buscarDespesasFixas(userId);
  }

  async function criar(input: NovaDespesaFixa) {
    if (!userId) {
      throw new Error("Usuário não autenticado.");
    }

    const nova = await createFixedExpense({ userId, ...input });
    setFixedExpenses((atual) => [nova, ...atual]);
  }

  async function remover(id: string) {
    if (!userId) return;
    setActionError(null);

    try {
      await deleteFixedExpense(id, userId);
      setFixedExpenses((atual) => atual.filter((item) => item.id !== id));
    } catch (erro) {
      setActionError(getFriendlyErrorMessage(erro, "Não foi possível remover a despesa fixa."));
    }
  }

  const totalDespesasFixas = useMemo(
    () => fixedExpenses.reduce((total, item) => total + item.amount, 0),
    [fixedExpenses],
  );

  return {
    fixedExpenses,
    loading,
    error,
    actionError,
    criar,
    remover,
    recarregar,
    totalDespesasFixas,
  };
}
