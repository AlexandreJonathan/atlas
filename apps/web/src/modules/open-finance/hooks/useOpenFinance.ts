import { useCallback, useEffect, useState } from "react";
import { openFinanceService } from "../services/OpenFinanceService";
import type { Bank, FinancialHubTotals, OpenFinanceSnapshot } from "../types";
import { openFinanceEvents } from "../utils/events";

export function useOpenFinance() {
  const [snapshot, setSnapshot] = useState<OpenFinanceSnapshot | null>(null);
  const [catalog, setCatalog] = useState<Bank[]>([]);
  const [totals, setTotals] = useState<FinancialHubTotals | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [nextSnapshot, nextCatalog, nextTotals] = await Promise.all([
        openFinanceService.getSnapshot(),
        openFinanceService.listCatalog(),
        openFinanceService.getHubTotals(),
      ]);
      setSnapshot(nextSnapshot);
      setCatalog(nextCatalog);
      setTotals(nextTotals);
    } catch (erro) {
      setError(erro instanceof Error ? erro.message : "Não foi possível carregar o Open Finance.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Microtask: evita setState síncrono no corpo do effect (react-hooks/set-state-in-effect).
    let ativo = true;
    Promise.resolve().then(() => {
      if (ativo) void refresh();
    });

    const unsubscribe = openFinanceEvents.on("onSnapshotRefreshed", ({ snapshot: next }) => {
      setSnapshot(next);
      void openFinanceService.getHubTotals().then(setTotals);
      void openFinanceService.listCatalog().then(setCatalog);
    });

    return () => {
      ativo = false;
      unsubscribe();
    };
  }, [refresh]);

  const connectBank = useCallback(async (bankId: Bank["id"]) => {
    setActionLoading(true);
    setError(null);
    try {
      await openFinanceService.connectBank(bankId);
      await refresh();
    } catch (erro) {
      setError(erro instanceof Error ? erro.message : "Não foi possível conectar o banco.");
      throw erro;
    } finally {
      setActionLoading(false);
    }
  }, [refresh]);

  const syncBank = useCallback(async (bankId: Bank["id"]) => {
    setActionLoading(true);
    try {
      await openFinanceService.syncBank(bankId);
      await refresh();
    } finally {
      setActionLoading(false);
    }
  }, [refresh]);

  const connectedBanks = catalog.filter((bank) => bank.status === "connected");

  return {
    snapshot,
    catalog,
    totals,
    connectedBanks,
    loading,
    error,
    actionLoading,
    refresh,
    connectBank,
    syncBank,
    providerName: openFinanceService.getProviderName(),
  };
}
