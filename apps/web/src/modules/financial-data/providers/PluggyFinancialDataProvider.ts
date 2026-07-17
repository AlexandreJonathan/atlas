import { getFriendlyErrorMessage } from "../../../lib/errorMessages";
import { PluggyOpenFinanceProvider } from "../../open-finance";
import type { OpenFinanceSnapshot } from "../../open-finance/types";
import type { FinancialSnapshot } from "../types";
import { buildFinancialSnapshot } from "../utils/buildSnapshot";
import { loadAtlasLedger } from "../utils/loadLedger";
import type { FinancialDataProvider } from "./FinancialDataProvider";

/**
 * Stub drop-in — reutiliza `PluggyOpenFinanceProvider` para contas/cartões.
 * Ledger (receitas/despesas/metas/bills) permanece no Supabase até a integração real.
 * Investimentos de estudo continuam no mock para não alterar UX da Home.
 */
export class PluggyFinancialDataProvider implements FinancialDataProvider {
  readonly name = "pluggy";

  private readonly pluggy = new PluggyOpenFinanceProvider();

  async fetchSnapshot(userId: string): Promise<FinancialSnapshot> {
    const ledger = await loadAtlasLedger(userId);

    let openFinance: OpenFinanceSnapshot | null = null;
    let openFinanceError: string | undefined;
    try {
      openFinance = await this.pluggy.getSnapshot();
    } catch (erro) {
      openFinanceError = getFriendlyErrorMessage(
        erro,
        "Não foi possível carregar dados Pluggy (stub).",
      );
    }

    return buildFinancialSnapshot({
      userId,
      providerName: this.name,
      ledger,
      openFinance,
      openFinanceError,
    });
  }
}
