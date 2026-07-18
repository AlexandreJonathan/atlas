import { useCallback, useEffect, useState } from "react";
import { getFriendlyErrorMessage } from "../lib/errorMessages";
import {
  createGoal,
  deleteGoal,
  listGoals,
  updateGoalProgress,
  type NewGoalInput,
} from "../services/goalsService";
import type { Goal } from "../types/goal";
import { useAuth } from "./useAuth";

type NovaMeta = {
  title: string;
  targetAmount: number;
  targetDate: string | null;
  description?: string | null;
  category?: import("../types/goal").GoalCategory;
};

export function useGoals() {
  const { user } = useAuth();
  const userId = user?.id;

  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const buscarMetas = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const dados = await listGoals(id);
      setGoals(dados);
    } catch (erro) {
      setError(getFriendlyErrorMessage(erro, "Não foi possível carregar suas metas."));
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
      if (ativo) buscarMetas(userId);
    });

    return () => {
      ativo = false;
    };
  }, [userId, buscarMetas]);

  async function recarregar() {
    if (!userId) return;
    await buscarMetas(userId);
  }

  async function criar(input: NovaMeta) {
    if (!userId) {
      throw new Error("Usuário não autenticado.");
    }

    const novaMeta: NewGoalInput = { userId, ...input };
    const nova = await createGoal(novaMeta);
    setGoals((atual) => [nova, ...atual]);
  }

  async function registrarAporte(id: string, valor: number) {
    if (!userId) return;
    setActionError(null);

    const meta = goals.find((item) => item.id === id);
    if (!meta) return;

    try {
      const atualizada = await updateGoalProgress(id, userId, meta.currentAmount + valor);
      setGoals((atual) => atual.map((item) => (item.id === id ? atualizada : item)));
    } catch (erro) {
      setActionError(getFriendlyErrorMessage(erro, "Não foi possível registrar o aporte."));
    }
  }

  async function remover(id: string) {
    if (!userId) return;
    setActionError(null);

    try {
      await deleteGoal(id, userId);
      setGoals((atual) => atual.filter((item) => item.id !== id));
    } catch (erro) {
      setActionError(getFriendlyErrorMessage(erro, "Não foi possível remover a meta."));
    }
  }

  return {
    goals,
    loading,
    error,
    actionError,
    criar,
    registrarAporte,
    remover,
    recarregar,
  };
}
