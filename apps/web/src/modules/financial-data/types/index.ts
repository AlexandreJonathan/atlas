import type { MockInvestmentsSnapshot } from "../../../data/mockInvestments";
import type {
  BankAccount,
  CreditCard,
  OpenFinanceSnapshot,
} from "../../open-finance/types";
import type { Bill } from "../../../types/bill";
import type { FinancialProfile } from "../../../types/financialProfile";
import type { FixedExpense } from "../../../types/fixedExpense";
import type { Goal } from "../../../types/goal";
import type { Transaction } from "../../../types/transaction";

/** Escopos de invalidação de cache da Financial Data Layer. */
export type FinancialCacheScope = "all" | "ledger" | "open-finance" | "investments";

export type FinancialDataErrors = {
  transactions?: string;
  bills?: string;
  goals?: string;
  profile?: string;
  fixedExpenses?: string;
  openFinance?: string;
};

/**
 * Snapshot unificado — única fonte de leitura financeira da UI.
 * Ledger Atlas (Supabase) + fatias Open Finance + investimentos de estudo.
 */
export type FinancialSnapshot = {
  userId: string;
  fetchedAt: string;
  providerName: string;

  /** Saldo consolidado (receitas − despesas do ledger). */
  saldo: number;
  /** Patrimônio = saldo + investimentosPatrimonio (mesma regra da Home atual). */
  patrimonio: number;
  investimentosPatrimonio: number;

  receitas: number;
  despesas: number;
  receitasDoMes: number;
  despesasDoMes: number;
  quantoPossoGastar: number;

  transactions: Transaction[];
  /** Contas a pagar/receber (bills). */
  bills: Bill[];
  goals: Goal[];
  profile: FinancialProfile | null;
  fixedExpenses: FixedExpense[];
  totalDespesasFixas: number;
  totalPendenteAPagar: number;
  contasVencidas: Bill[];
  contasVencendoEmBreve: Bill[];

  /** Contas bancárias / cartões (Open Finance). */
  accounts: BankAccount[];
  cards: CreditCard[];
  openFinance: OpenFinanceSnapshot | null;

  investments: MockInvestmentsSnapshot;
  errors: FinancialDataErrors;
};

export type FinancialDataLoadState = {
  loading: boolean;
  syncing: boolean;
  error: string | null;
  snapshot: FinancialSnapshot | null;
};
