export type {
  FinancialCacheScope,
  FinancialDataErrors,
  FinancialDataLoadState,
  FinancialSnapshot,
} from "./types";

export type { FinancialDataProvider } from "./providers/FinancialDataProvider";
export { MockFinancialDataProvider } from "./providers/MockFinancialDataProvider";
export { PluggyFinancialDataProvider } from "./providers/PluggyFinancialDataProvider";
export {
  FinancialDataService,
  financialDataService,
} from "./services/FinancialDataService";
export { useFinancialData } from "./hooks/useFinancialData";
export { financialDataEvents } from "./utils/events";
export {
  BILLS_DUE_SOON_DAYS,
  deriveBillSlices,
  sumDespesas,
  sumDespesasDoMes,
  sumFixedExpenses,
  sumReceitas,
  sumReceitasDoMes,
} from "./utils/aggregate";
