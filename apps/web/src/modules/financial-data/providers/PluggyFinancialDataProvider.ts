import { MOCK_INVESTMENTS } from "../../../data/mockInvestments";
import { analytics } from "../../../lib/analytics";
import { getFriendlyErrorMessage } from "../../../lib/errorMessages";
import { logger } from "../../../lib/logging";
import { fetchPluggySnapshot, mapPluggyEdgeToOpenFinance } from "../../pluggy";
import type { FinancialSnapshot } from "../types";
import { buildFinancialSnapshot } from "../utils/buildSnapshot";
import { loadAtlasLedger } from "../utils/loadLedger";
import type { FinancialDataProvider } from "./FinancialDataProvider";

/**
 * Provider Pluggy real da Financial Data Layer.
 * - Ledger Atlas (Supabase) permanece a fonte de saldo/metas/bills (UX intacta).
 * - Contas/cartões/investimentos OF vêm da Edge `pluggy-proxy` (API Key só no servidor).
 */
export class PluggyFinancialDataProvider implements FinancialDataProvider {
  readonly name = "pluggy";

  async fetchSnapshot(userId: string): Promise<FinancialSnapshot> {
    const ledger = await loadAtlasLedger(userId);

    try {
      analytics.track("pluggy_sync_started", { phase: "fdl_snapshot" });
      const raw = await fetchPluggySnapshot();
      const openFinance = mapPluggyEdgeToOpenFinance(raw);
      const pluggyTxCount = Array.isArray(raw.transactions) ? raw.transactions.length : 0;

      const pluggyInvested = openFinance.investments.reduce((sum, i) => sum + i.balance, 0);
      const investments =
        pluggyInvested > 0
          ? {
              ...MOCK_INVESTMENTS,
              patrimonioInvestido: pluggyInvested,
            }
          : MOCK_INVESTMENTS;

      logger.info("PluggyFinancialDataProvider: snapshot OK", {
        userId,
        banks: openFinance.banks.length,
        accounts: openFinance.accounts.length,
        cards: openFinance.cards.length,
        transactions: pluggyTxCount,
      });
      analytics.track("pluggy_sync_success", {
        phase: "fdl_snapshot",
        banks: openFinance.banks.length,
        accounts: openFinance.accounts.length,
        transactions: pluggyTxCount,
      });

      return buildFinancialSnapshot({
        userId,
        providerName: this.name,
        ledger,
        openFinance,
        investments,
      });
    } catch (erro) {
      const openFinanceError = getFriendlyErrorMessage(
        erro,
        "Não foi possível sincronizar dados Pluggy.",
      );
      logger.warning("PluggyFinancialDataProvider: fallback ledger-only", {
        userId,
        error: openFinanceError,
      });
      analytics.track("pluggy_sync_error", {
        phase: "fdl_snapshot",
        reason: openFinanceError,
      });

      return buildFinancialSnapshot({
        userId,
        providerName: this.name,
        ledger,
        openFinance: null,
        openFinanceError,
      });
    }
  }
}
