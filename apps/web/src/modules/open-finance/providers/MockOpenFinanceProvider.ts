import type { OpenFinanceProvider } from "../providers/OpenFinanceProvider";
import { getCatalogEntry } from "../mocks/bankCatalog";
import { createInitialMockSnapshot } from "../mocks/mockSnapshot";
import type { Bank, BankId, OpenFinanceSnapshot } from "../types";

/**
 * Provider de desenvolvimento — dados em memória, sem rede.
 * Usado pela Atlas até a integração real com Pluggy.
 */
export class MockOpenFinanceProvider implements OpenFinanceProvider {
  readonly name = "mock";

  private snapshot: OpenFinanceSnapshot = createInitialMockSnapshot();

  async listCatalog(): Promise<Bank[]> {
    return this.snapshot.banks.map((bank) => ({ ...bank }));
  }

  async getSnapshot(): Promise<OpenFinanceSnapshot> {
    return structuredClone(this.snapshot);
  }

  async connectBank(bankId: BankId): Promise<Bank> {
    const catalog = getCatalogEntry(bankId);
    if (!catalog) {
      throw new Error(`Banco não suportado: ${bankId}`);
    }

    const existing = this.snapshot.banks.find((bank) => bank.id === bankId);
    const connected: Bank = {
      ...catalog,
      status: "connected",
      lastSyncedAt: new Date().toISOString(),
    };

    if (existing) {
      Object.assign(existing, connected);
    } else {
      this.snapshot.banks.push(connected);
    }

    const hasAccounts = this.snapshot.accounts.some((account) => account.bankId === bankId);
    if (!hasAccounts) {
      this.snapshot.accounts.push({
        id: `acc-${bankId}-1`,
        bankId,
        bankName: catalog.name,
        name: `Conta ${catalog.name}`,
        type: "checking",
        balance: 500 + Math.round(Math.random() * 4500),
        currency: "BRL",
      });
      const total = this.snapshot.accounts
        .filter((account) => account.bankId === bankId)
        .reduce((sum, account) => sum + account.balance, 0);
      this.snapshot.balances = [
        ...this.snapshot.balances.filter((balance) => balance.bankId !== bankId),
        {
          bankId,
          available: total,
          currency: "BRL",
          updatedAt: new Date().toISOString(),
        },
      ];
    }

    return { ...connected };
  }

  async disconnectBank(bankId: BankId): Promise<void> {
    const bank = this.snapshot.banks.find((item) => item.id === bankId);
    if (!bank) return;
    bank.status = "available";
    bank.lastSyncedAt = null;
    this.snapshot.accounts = this.snapshot.accounts.filter((account) => account.bankId !== bankId);
    this.snapshot.cards = this.snapshot.cards.filter((card) => card.bankId !== bankId);
    this.snapshot.investments = this.snapshot.investments.filter((item) => item.bankId !== bankId);
    this.snapshot.balances = this.snapshot.balances.filter((balance) => balance.bankId !== bankId);
  }

  async syncBank(bankId: BankId): Promise<Bank> {
    const bank = this.snapshot.banks.find((item) => item.id === bankId);
    if (!bank || bank.status !== "connected") {
      throw new Error(`Banco não conectado: ${bankId}`);
    }
    bank.status = "syncing";
    await Promise.resolve();
    bank.status = "connected";
    bank.lastSyncedAt = new Date().toISOString();
    return { ...bank };
  }
}
