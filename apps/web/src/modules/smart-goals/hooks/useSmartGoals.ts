import { useCallback, useEffect, useMemo, useState } from "react";
import { getFriendlyErrorMessage } from "../../../lib/errorMessages";
import { useAuth } from "../../../hooks/useAuth";
import { financialDataService } from "../../financial-data";
import type { Goal, GoalCategory } from "../../../types/goal";
import { smartGoalsService } from "../services/SmartGoalsService";
import type { SmartGoalsSummary } from "../utils/goalMath";

export type CreateSmartGoalInput = {
  title: string;
  targetAmount: number;
  targetDate: string | null;
  category: GoalCategory;
  description?: string | null;
};

/**
 * Hook da tela Smart Goals.
 * Após mutações, invalida a FDL para manter Home/IA sincronizados.
 */
export function useSmartGoals() {
  const { user } = useAuth();
  const userId = user?.id;
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!userId) {
      setGoals([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const rows = await smartGoalsService.list(userId);
      setGoals(rows);
    } catch (erro) {
      setError(getFriendlyErrorMessage(erro, "Não foi possível carregar as metas."));
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (active) void reload();
    });
    return () => {
      active = false;
    };
  }, [reload]);

  const summary: SmartGoalsSummary = useMemo(
    () => smartGoalsService.summarize(goals),
    [goals],
  );

  async function invalidateFdl() {
    if (userId) financialDataService.invalidate("ledger", userId);
  }

  return {
    goals,
    summary,
    loading,
    error,
    actionError,
    reload,
    create: async (input: CreateSmartGoalInput) => {
      if (!userId) throw new Error("Usuário não autenticado.");
      setActionError(null);
      try {
        const created = await smartGoalsService.create({ userId, ...input });
        setGoals((prev) => [created, ...prev]);
        await invalidateFdl();
      } catch (erro) {
        const message = getFriendlyErrorMessage(erro, "Não foi possível criar a meta.");
        setActionError(message);
        throw erro;
      }
    },
    contribute: async (id: string, amount: number) => {
      if (!userId) return;
      setActionError(null);
      try {
        const updated = await smartGoalsService.contribute(id, userId, amount);
        setGoals((prev) => prev.map((g) => (g.id === id ? updated : g)));
        await invalidateFdl();
      } catch (erro) {
        setActionError(
          getFriendlyErrorMessage(erro, "Não foi possível registrar o aporte."),
        );
      }
    },
    remove: async (id: string) => {
      if (!userId) return;
      setActionError(null);
      try {
        await smartGoalsService.remove(id, userId);
        setGoals((prev) => prev.filter((g) => g.id !== id));
        await invalidateFdl();
      } catch (erro) {
        setActionError(getFriendlyErrorMessage(erro, "Não foi possível remover a meta."));
      }
    },
  };
}
