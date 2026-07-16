import type { Bank, BankId, OpenFinanceSnapshot } from "../types";

/**
 * Contrato do provedor de Open Finance.
 * A UI e o OpenFinanceService falam apenas com esta interface —
 * nunca com Pluggy/Belvo diretamente.
 */
export interface OpenFinanceProvider {
  readonly name: string;

  listCatalog(): Promise<Bank[]>;

  getSnapshot(): Promise<OpenFinanceSnapshot>;

  connectBank(bankId: BankId): Promise<Bank>;

  disconnectBank(bankId: BankId): Promise<void>;

  syncBank(bankId: BankId): Promise<Bank>;
}
