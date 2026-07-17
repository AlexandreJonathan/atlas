import type { OpenFinanceProvider } from "./OpenFinanceProvider";
import type { Bank, BankId, OpenFinanceSnapshot } from "../types";

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
 * Stub drop-in do adapter Pluggy.
 * Leitura segura (catálogo/snapshot vazios); mutações falham com erro explícito.
 * Quando a integração HTTP/SDK existir, só este arquivo muda — factory já aponta para cá.
 */
export class PluggyOpenFinanceProvider implements OpenFinanceProvider {
  readonly name = "pluggy";

  async listCatalog(): Promise<Bank[]> {
    return [];
  }

  async getSnapshot(): Promise<OpenFinanceSnapshot> {
    return structuredClone(EMPTY_SNAPSHOT);
  }

  async connectBank(bankId: BankId): Promise<Bank> {
    void bankId;
    throw new Error(
      "PluggyOpenFinanceProvider: conexão ainda não implementada. Use VITE_OF_PROVIDER=mock até a integração real.",
    );
  }

  async disconnectBank(bankId: BankId): Promise<void> {
    void bankId;
    throw new Error(
      "PluggyOpenFinanceProvider: desconexão ainda não implementada. Use VITE_OF_PROVIDER=mock até a integração real.",
    );
  }

  async syncBank(bankId: BankId): Promise<Bank> {
    void bankId;
    throw new Error(
      "PluggyOpenFinanceProvider: sync ainda não implementado. Use VITE_OF_PROVIDER=mock até a integração real.",
    );
  }
}
