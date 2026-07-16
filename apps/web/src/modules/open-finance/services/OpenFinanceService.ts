import type { OpenFinanceProvider } from "../providers/OpenFinanceProvider";
import { MockOpenFinanceProvider } from "../providers/MockOpenFinanceProvider";
import type { Bank, BankId, FinancialHubTotals, OpenFinanceSnapshot } from "../types";
import { aggregateFinancialHub } from "../utils/aggregate";
import {
  onBalanceUpdated,
  onBankConnected,
  openFinanceEvents,
} from "../utils/events";

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

/** Instância padrão da aplicação (mock até a integração Pluggy). */
export const openFinanceService = new OpenFinanceService(new MockOpenFinanceProvider());
