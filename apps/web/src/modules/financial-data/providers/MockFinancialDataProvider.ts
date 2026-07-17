import { getFriendlyErrorMessage } from "../../../lib/errorMessages";
import { openFinanceService } from "../../open-finance";
import type { OpenFinanceSnapshot } from "../../open-finance/types";
import type { FinancialSnapshot } from "../types";
import { buildFinancialSnapshot } from "../utils/buildSnapshot";
import { loadAtlasLedger } from "../utils/loadLedger";
import type { FinancialDataProvider } from "./FinancialDataProvider";

/**
 * Provider padrão do Alpha — ledger Supabase + OF mock + investimentos de estudo.
 * Não altera as regras numéricas já usadas na Home.
 */
export class MockFinancialDataProvider implements FinancialDataProvider {
  readonly name = "mock";

  async fetchSnapshot(userId: string): Promise<FinancialSnapshot> {
    const ledger = await loadAtlasLedger(userId);

    let openFinance: OpenFinanceSnapshot | null = null;
    let openFinanceError: string | undefined;
    try {
      openFinance = await openFinanceService.getSnapshot();
    } catch (erro) {
      openFinanceError = getFriendlyErrorMessage(
        erro,
        "Não foi possível carregar dados de Open Finance.",
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
