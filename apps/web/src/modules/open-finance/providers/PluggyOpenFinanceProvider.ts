import { analytics } from "../../../lib/analytics";
import { logger } from "../../../lib/logging";
import {
  createPluggyConnectToken,
  fetchPluggySnapshot,
  listPluggyConnectors,
  mapPluggyEdgeToOpenFinance,
  openPluggyConnect,
  registerPluggyItem,
  syncPluggyItem,
  unregisterPluggyItem,
} from "../../pluggy";
import type { Bank, BankId, OpenFinanceSnapshot } from "../types";
import type { OpenFinanceProvider } from "./OpenFinanceProvider";

const EMPTY_SNAPSHOT: OpenFinanceSnapshot = {
  banks: [],
  accounts: [],
  cards: [],
  investments: [],
  balances: [],
  pix: [],
  loans: [],
};

/**
 * Adapter Pluggy real — Connect Token + widget + sync via Edge `pluggy-proxy`.
 * Credenciais ficam só no servidor (PLUGGY_CLIENT_ID / PLUGGY_CLIENT_SECRET).
 */
export class PluggyOpenFinanceProvider implements OpenFinanceProvider {
  readonly name = "pluggy";

  private catalogCache: Bank[] | null = null;

  async listCatalog(): Promise<Bank[]> {
    try {
      const connectors = await listPluggyConnectors();
      const snapshot = await this.getSnapshot();
      const connectedIds = new Set(
        snapshot.banks.filter((b) => b.status === "connected").map((b) => b.id),
      );

      const fromConnections: Bank[] = snapshot.banks.map((bank) => ({ ...bank }));
      const fromConnectors: Bank[] = connectors
        .filter((c) => !connectedIds.has(c.id))
        .map((c) => ({
          id: c.id,
          name: c.name,
          iconKey: c.id,
          status: "available" as const,
          lastSyncedAt: null,
        }));

      // Itens conectados primeiro; connectors disponíveis em seguida.
      this.catalogCache = [...fromConnections, ...fromConnectors];
      return this.catalogCache.map((bank) => ({ ...bank }));
    } catch (error) {
      logger.warning("PluggyOpenFinanceProvider.listCatalog falhou", {
        error: error instanceof Error ? error.message : String(error),
      });
      analytics.track("pluggy_sync_error", { phase: "list_catalog" });
      return this.catalogCache?.map((b) => ({ ...b })) ?? [];
    }
  }

  async getSnapshot(): Promise<OpenFinanceSnapshot> {
    try {
      const raw = await fetchPluggySnapshot();
      return mapPluggyEdgeToOpenFinance(raw);
    } catch (error) {
      logger.warning("PluggyOpenFinanceProvider.getSnapshot falhou", {
        error: error instanceof Error ? error.message : String(error),
      });
      analytics.track("pluggy_sync_error", { phase: "get_snapshot" });
      return structuredClone(EMPTY_SNAPSHOT);
    }
  }

  async connectBank(bankId: BankId): Promise<Bank> {
    analytics.track("pluggy_connect_started", { bankId });
    logger.info("Pluggy connect: solicitando Connect Token", { bankId });

    const token = await createPluggyConnectToken();
    const connectorIds =
      /^\d+$/.test(bankId) ? [Number(bankId)] : undefined;

    try {
      const result = await openPluggyConnect({
        connectToken: token.accessToken,
        includeSandbox: token.includeSandbox,
        connectorIds,
      });

      await registerPluggyItem({
        itemId: result.itemId,
        connectorId: result.connectorId ?? (/^\d+$/.test(bankId) ? bankId : undefined),
        connectorName: result.connectorName,
      });

      analytics.track("pluggy_connect_success", {
        itemId: result.itemId,
        bankId,
      });

      const bank: Bank = {
        id: result.itemId,
        name: result.connectorName ?? "Instituição conectada",
        iconKey: result.connectorId ?? "unknown",
        status: "connected",
        lastSyncedAt: new Date().toISOString(),
      };
      this.catalogCache = null;
      return bank;
    } catch (error) {
      analytics.track("pluggy_connect_error", {
        bankId,
        reason: error instanceof Error ? error.message : "unknown",
      });
      throw error;
    }
  }

  async disconnectBank(bankId: BankId): Promise<void> {
    await unregisterPluggyItem(bankId);
    this.catalogCache = null;
    analytics.track("pluggy_disconnect", { bankId });
  }

  async syncBank(bankId: BankId): Promise<Bank> {
    analytics.track("pluggy_sync_started", { bankId });
    try {
      await syncPluggyItem(bankId);
      const snapshot = await this.getSnapshot();
      const bank = snapshot.banks.find((item) => item.id === bankId);
      analytics.track("pluggy_sync_success", { bankId });
      if (bank) return { ...bank, status: "connected" };
      return {
        id: bankId,
        name: "Instituição",
        iconKey: "unknown",
        status: "connected",
        lastSyncedAt: new Date().toISOString(),
      };
    } catch (error) {
      analytics.track("pluggy_sync_error", {
        phase: "sync_bank",
        bankId,
        reason: error instanceof Error ? error.message : "unknown",
      });
      throw error;
    }
  }
}
