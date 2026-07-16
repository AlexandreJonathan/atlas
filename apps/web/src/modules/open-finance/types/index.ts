/**
 * Tipos de domínio do Open Finance da Atlas.
 * Independentes de qualquer provedor (Pluggy, Belvo, etc.).
 */

export type BankConnectionStatus = "available" | "connected" | "syncing" | "error" | "disconnected";

export type BankId =
  | "nubank"
  | "inter"
  | "c6"
  | "itau"
  | "santander"
  | "bradesco"
  | "banco_do_brasil"
  | "caixa"
  | "pagbank"
  | "mercado_pago"
  | "wise";

export type Bank = {
  id: BankId;
  name: string;
  /** Identificador visual (placeholder até assets oficiais). */
  iconKey: string;
  status: BankConnectionStatus;
  /** ISO 8601 ou null se nunca sincronizou. */
  lastSyncedAt: string | null;
};

export type BankAccountType = "checking" | "savings" | "payment";

export type BankAccount = {
  id: string;
  bankId: BankId;
  bankName: string;
  name: string;
  type: BankAccountType;
  balance: number;
  currency: "BRL";
};

export type CreditCard = {
  id: string;
  bankId: BankId;
  bankName: string;
  name: string;
  lastFour: string;
  limit: number;
  used: number;
  available: number;
  currency: "BRL";
};

export type InvestmentType = "fixed_income" | "funds" | "equity" | "other";

export type Investment = {
  id: string;
  bankId: BankId;
  bankName: string;
  name: string;
  type: InvestmentType;
  balance: number;
  currency: "BRL";
};

export type Balance = {
  bankId: BankId;
  available: number;
  currency: "BRL";
  updatedAt: string;
};

export type PixDirection = "in" | "out";

export type Pix = {
  id: string;
  bankId: BankId;
  direction: PixDirection;
  amount: number;
  counterpartName: string;
  occurredAt: string;
  description?: string;
};

export type LoanStatus = "active" | "paid" | "overdue";

export type Loan = {
  id: string;
  bankId: BankId;
  bankName: string;
  name: string;
  outstandingBalance: number;
  installmentAmount: number;
  status: LoanStatus;
  currency: "BRL";
};

export type OpenFinanceSnapshot = {
  banks: Bank[];
  accounts: BankAccount[];
  cards: CreditCard[];
  investments: Investment[];
  balances: Balance[];
  pix: Pix[];
  loans: Loan[];
};

export type FinancialHubTotals = {
  patrimonio: number;
  saldo: number;
  cartoesUsado: number;
  cartoesLimite: number;
  contas: number;
  investimentos: number;
};
