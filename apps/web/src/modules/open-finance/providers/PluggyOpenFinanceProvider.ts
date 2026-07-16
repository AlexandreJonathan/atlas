import type { OpenFinanceProvider } from "./OpenFinanceProvider";
import type { Bank, BankId, OpenFinanceSnapshot } from "../types";

/**
 * Stub do adapter Pluggy — provedor-alvo do MVP.
 * Nenhuma chamada HTTP / SDK nesta missão.
 * Quando a integração real for feita, apenas este arquivo muda.
 */
export class PluggyOpenFinanceProvider implements OpenFinanceProvider {
  readonly name = "pluggy";

  async listCatalog(): Promise<Bank[]> {
    throw new Error("PluggyOpenFinanceProvider ainda não implementado — use MockOpenFinanceProvider.");
  }

  async getSnapshot(): Promise<OpenFinanceSnapshot> {
    throw new Error("PluggyOpenFinanceProvider ainda não implementado — use MockOpenFinanceProvider.");
  }

  async connectBank(bankId: BankId): Promise<Bank> {
    void bankId;
    throw new Error("PluggyOpenFinanceProvider ainda não implementado — use MockOpenFinanceProvider.");
  }

  async disconnectBank(bankId: BankId): Promise<void> {
    void bankId;
    throw new Error("PluggyOpenFinanceProvider ainda não implementado — use MockOpenFinanceProvider.");
  }

  async syncBank(bankId: BankId): Promise<Bank> {
    void bankId;
    throw new Error("PluggyOpenFinanceProvider ainda não implementado — use MockOpenFinanceProvider.");
  }
}
