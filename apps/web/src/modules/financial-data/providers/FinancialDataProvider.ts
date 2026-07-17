import type { FinancialSnapshot } from "../types";

/**
 * Contrato da Financial Data Layer.
 * UI e services de produto só falam com FinancialDataService — nunca com Mock/Pluggy.
 */
export interface FinancialDataProvider {
  readonly name: string;

  /**
   * Carrega o snapshot completo para o usuário.
   * Implementações podem compor ledger Atlas + Open Finance + investimentos.
   */
  fetchSnapshot(userId: string): Promise<FinancialSnapshot>;
}
