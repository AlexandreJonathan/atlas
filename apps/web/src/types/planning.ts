import type { Goal } from "./goal";

export type RiscoFinanceiro = "baixo" | "medio" | "alto";

// Snapshot de dados já carregados e filtrados pelos hooks de domínio
// (useFinancialProfile/useFixedExpenses/useFinancialSummary/useBills/useGoals).
// O motor (planningEngine.ts) é síncrono e sem I/O — mesmo espírito do
// DashboardSnapshot/recommendationEngine.ts da Sprint 4.
export type PlanningSnapshot = {
  saldo: number;
  receitasDoMes: number;
  despesasDoMes: number;
  rendaMensal: number;
  reservaMinima: number;
  totalDespesasFixas: number;
  totalPendenteAPagar: number;
  diasRestantesNoMes: number;
  goals: Pick<Goal, "targetAmount" | "currentAmount" | "targetDate">[];
  hojeISO: string;
};

export type PlanningResult = {
  quantoPossoGastarHoje: number;
  quantoPrecisaGuardar: number;
  saldoPrevistoFimDoMes: number;
  risco: RiscoFinanceiro;
};

// Contrato estável consumido por usePlanning. A implementação atual
// (ruleBasedPlanningProvider) só empacota o motor de regras síncrono numa
// Promise; uma futura aiPlanningProvider (chamando uma Supabase Edge
// Function com o histórico real de transações) pode substituí-la sem
// qualquer mudança na UI.
export type PlanningProvider = (snapshot: PlanningSnapshot) => Promise<PlanningResult>;
