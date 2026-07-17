import { appConfig, featureFlagService } from "../../../config";
import { logger } from "../../../lib/logging";
import type { OpenFinanceProvider } from "../providers/OpenFinanceProvider";
import { MockOpenFinanceProvider } from "../providers/MockOpenFinanceProvider";
import { PluggyOpenFinanceProvider } from "../providers/PluggyOpenFinanceProvider";
import type { Bank, BankId, FinancialHubTotals, OpenFinanceSnapshot } from "../types";
import { aggregateFinancialHub } from "../utils/aggregate";
import {
  onBalanceUpdated,
  onBankConnected,
  openFinanceEvents,
} from "../utils/events";

/**
 * Factory drop-in: `VITE_OF_PROVIDER=pluggy` instancia o stub Pluggy de verdade
 * (catálogo/snapshot vazios; connect/sync falham até a integração HTTP).
 */
function createOpenFinanceProvider(): OpenFinanceProvider {
  const configured = appConfig.providers.openFinance;
  if (configured === "pluggy") {
    logger.info("Open Finance: usando PluggyOpenFinanceProvider (stub drop-in)");
    return new PluggyOpenFinanceProvider();
  }
  return new MockOpenFinanceProvider();
}

/**
 * Única porta de entrada do app para Open Finance.
 * Telas e hooks usam este service — nunca o provider Pluggy diretamente.
 */
export class OpenFinanceService {
  private readonly provider: OpenFinanceProvider;

  constructor(provider: OpenFinanceProvider) {
    this.provider = provider;
  }

  getProviderName(): string {
    return this.provider.name;
  }

  /** Flag de módulo (AppConfig) — telas não precisam consultar diretamente. */
  isModuleEnabled(): boolean {
    return featureFlagService.isEnabled("openFinance");
  }

  listCatalog(): Promise<Bank[]> {
    return this.provider.listCatalog();
  }

  getSnapshot(): Promise<OpenFinanceSnapshot> {
    return this.provider.getSnapshot();
  }

  async getHubTotals(): Promise<FinancialHubTotals> {
    const snapshot = await this.provider.getSnapshot();
    return aggregateFinancialHub(snapshot);
  }

  async connectBank(bankId: BankId): Promise<Bank> {
    const bank = await this.provider.connectBank(bankId);
    onBankConnected({ bankId: bank.id });
    const snapshot = await this.provider.getSnapshot();
    openFinanceEvents.emit("onSnapshotRefreshed", { snapshot });
    return bank;
  }

  async disconnectBank(bankId: BankId): Promise<void> {
    await this.provider.disconnectBank(bankId);
    openFinanceEvents.emit("onBankDisconnected", { bankId });
    const snapshot = await this.provider.getSnapshot();
    openFinanceEvents.emit("onSnapshotRefreshed", { snapshot });
  }

  async syncBank(bankId: BankId): Promise<Bank> {
    const bank = await this.provider.syncBank(bankId);
    const snapshot = await this.provider.getSnapshot();
    const balance = snapshot.balances.find((item) => item.bankId === bankId);
    if (balance) {
      onBalanceUpdated({ bankId, available: balance.available });
    }
    openFinanceEvents.emit("onSnapshotRefreshed", { snapshot });
    return bank;
  }
}

/** Instância padrão — mock ou stub Pluggy conforme `AppConfig.providers.openFinance`. */
export const openFinanceService = new OpenFinanceService(createOpenFinanceProvider());
