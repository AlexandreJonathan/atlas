import { useCallback, useEffect, useMemo, useState } from "react";
import { getFriendlyErrorMessage } from "../../../lib/errorMessages";
import { useAuth } from "../../../hooks/useAuth";
import type { BillType } from "../../../types/bill";
import type { TransactionType } from "../../../types/transaction";
import { financialDataService } from "../services/FinancialDataService";
import type { FinancialCacheScope, FinancialSnapshot } from "../types";

/**
 * Hook React da Financial Data Layer.
 * Páginas consomem apenas isto (ou o service) — nunca Mock/Pluggy diretamente.
 */
export function useFinancialData() {
  const { user } = useAuth();
  const userId = user?.id;

  const [snapshot, setSnapshot] = useState<FinancialSnapshot | null>(
    () => financialDataService.getSnapshot(),
  );
  const [loading, setLoading] = useState(() => financialDataService.getState().loading || !snapshot);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    return financialDataService.subscribe((state) => {
      setSnapshot(state.snapshot);
      setLoading(state.loading && state.snapshot == null);
      setSyncing(state.syncing);
      setError(state.error);
    });
  }, []);

  useEffect(() => {
    if (!userId) return;
    let ativo = true;
    Promise.resolve().then(() => {
      if (ativo) void financialDataService.ensureLoaded(userId);
    });
    return () => {
      ativo = false;
    };
  }, [userId]);

  const sync = useCallback(async () => {
    if (!userId) return;
    await financialDataService.sync(userId);
  }, [userId]);

  const invalidate = useCallback(
    (scope: FinancialCacheScope = "all") => {
      financialDataService.invalidate(scope, userId);
    },
    [userId],
  );

  const emptyLoading = loading;

  const transacoes = useMemo(
    () => ({
      transactions: snapshot?.transactions ?? [],
      loading: emptyLoading,
      error: snapshot?.errors.transactions ?? error,
      actionError,
      receitas: snapshot?.receitas ?? 0,
      despesas: snapshot?.despesas ?? 0,
      saldo: snapshot?.saldo ?? 0,
      receitasDoMes: snapshot?.receitasDoMes ?? 0,
      despesasDoMes: snapshot?.despesasDoMes ?? 0,
      adicionar: async (input: {
        type: TransactionType;
        description: string;
        amount: number;
      }) => {
        if (!userId) throw new Error("Usuário não autenticado.");
        await financialDataService.addTransaction({ userId, ...input });
      },
      remover: async (id: string) => {
        if (!userId) return;
        setActionError(null);
        try {
          await financialDataService.removeTransaction(id, userId);
        } catch (erro) {
          setActionError(
            getFriendlyErrorMessage(erro, "Não foi possível remover a movimentação."),
          );
        }
      },
      recarregar: sync,
    }),
    [snapshot, emptyLoading, error, actionError, userId, sync],
  );

  const contas = useMemo(
    () => ({
      bills: snapshot?.bills ?? [],
      loading: emptyLoading,
      error: snapshot?.errors.bills ?? error,
      actionError,
      contasVencidas: snapshot?.contasVencidas ?? [],
      contasVencendoEmBreve: snapshot?.contasVencendoEmBreve ?? [],
      totalPendenteAPagar: snapshot?.totalPendenteAPagar ?? 0,
      criar: async (input: {
        type: BillType;
        description: string;
        amount: number;
        dueDate: string;
      }) => {
        if (!userId) throw new Error("Usuário não autenticado.");
        await financialDataService.addBill({ userId, ...input });
      },
      marcarComoPaga: async (id: string) => {
        if (!userId) return;
        setActionError(null);
        try {
          await financialDataService.markBillPaid(id, userId);
        } catch (erro) {
          setActionError(
            getFriendlyErrorMessage(erro, "Não foi possível marcar a conta como paga."),
          );
        }
      },
      remover: async (id: string) => {
        if (!userId) return;
        setActionError(null);
        try {
          await financialDataService.removeBill(id, userId);
        } catch (erro) {
          setActionError(getFriendlyErrorMessage(erro, "Não foi possível remover a conta."));
        }
      },
      recarregar: sync,
    }),
    [snapshot, emptyLoading, error, actionError, userId, sync],
  );

  const metas = useMemo(
    () => ({
      goals: snapshot?.goals ?? [],
      loading: emptyLoading,
      error: snapshot?.errors.goals ?? error,
      actionError,
      criar: async (input: {
        title: string;
        targetAmount: number;
        targetDate: string | null;
        description?: string | null;
        category?: import("../../../types/goal").GoalCategory;
      }) => {
        if (!userId) throw new Error("Usuário não autenticado.");
        await financialDataService.addGoal({ userId, ...input });
      },
      registrarAporte: async (id: string, valor: number) => {
        if (!userId) return;
        setActionError(null);
        try {
          await financialDataService.registerGoalContribution(id, userId, valor);
        } catch (erro) {
          setActionError(getFriendlyErrorMessage(erro, "Não foi possível registrar o aporte."));
        }
      },
      remover: async (id: string) => {
        if (!userId) return;
        setActionError(null);
        try {
          await financialDataService.removeGoal(id, userId);
        } catch (erro) {
          setActionError(getFriendlyErrorMessage(erro, "Não foi possível remover a meta."));
        }
      },
      recarregar: sync,
    }),
    [snapshot, emptyLoading, error, actionError, userId, sync],
  );

  const perfil = useMemo(
    () => ({
      profile: snapshot?.profile ?? null,
      loading: emptyLoading,
      error: snapshot?.errors.profile ?? error,
      salvar: async (input: { monthlyIncome: number; minimumReserve: number }) => {
        if (!userId) throw new Error("Usuário não autenticado.");
        await financialDataService.saveProfile({ userId, ...input });
      },
      recarregar: sync,
    }),
    [snapshot, emptyLoading, error, userId, sync],
  );

  const despesasFixas = useMemo(
    () => ({
      fixedExpenses: snapshot?.fixedExpenses ?? [],
      loading: emptyLoading,
      error: snapshot?.errors.fixedExpenses ?? error,
      actionError,
      totalDespesasFixas: snapshot?.totalDespesasFixas ?? 0,
      criar: async (input: { description: string; amount: number }) => {
        if (!userId) throw new Error("Usuário não autenticado.");
        await financialDataService.addFixedExpense({ userId, ...input });
      },
      remover: async (id: string) => {
        if (!userId) return;
        setActionError(null);
        try {
          await financialDataService.removeFixedExpense(id, userId);
        } catch (erro) {
          setActionError(
            getFriendlyErrorMessage(erro, "Não foi possível remover a despesa fixa."),
          );
        }
      },
      recarregar: sync,
    }),
    [snapshot, emptyLoading, error, actionError, userId, sync],
  );

  const resumo = useMemo(
    () => ({
      saldo: snapshot?.saldo ?? 0,
      receitas: snapshot?.receitas ?? 0,
      despesas: snapshot?.despesas ?? 0,
      receitasDoMes: snapshot?.receitasDoMes ?? 0,
      despesasDoMes: snapshot?.despesasDoMes ?? 0,
      quantoPossoGastar: snapshot?.quantoPossoGastar ?? 0,
      loading: emptyLoading,
      error: snapshot?.errors.transactions ?? snapshot?.errors.bills ?? error,
    }),
    [snapshot, emptyLoading, error],
  );

  return {
    snapshot,
    loading: emptyLoading,
    syncing,
    error,
    providerName: financialDataService.getProviderName(),
    sync,
    invalidate,
    /** Facades compatíveis com os hooks legados (Home / Onboarding / widgets). */
    transacoes,
    contas,
    metas,
    perfil,
    despesasFixas,
    resumo,
    patrimonio: snapshot?.patrimonio ?? 0,
    cartoes: snapshot?.cards ?? [],
    accounts: snapshot?.accounts ?? [],
    investments: snapshot?.investments ?? null,
  };
}
