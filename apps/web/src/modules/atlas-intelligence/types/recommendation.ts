import type { BudgetMonthSummary, CategorySpendView } from "../../budget-planner/utils/budgetMath";
import type { InstallmentSummary } from "../../installments/utils/installmentMath";
import type { FinancialPlan, GoalForecast } from "../../../types/financialPlan";
import type { Goal } from "../../../types/goal";
import type { InstallmentPlanWithPayments } from "../../../types/installment";
import type { Transaction } from "../../../types/transaction";
import type { ExpenseCategory } from "../../../types/budget";
import type { InsightTone } from "./index";

/** Categorias de recomendação (Atlas Intelligence v2). */
export type RecommendationCategory =
  | "economia"
  | "orcamento"
  | "metas"
  | "investimentos"
  | "contas"
  | "receitas"
  | "despesas"
  | "comportamento";

/**
 * Insight/recomendação proativa — sempre derivado de dados reais.
 * Nunca inventar valores; regras devem omitir o insight se faltar evidência.
 */
export type Recommendation = {
  id: string;
  title: string;
  description: string;
  priority: number;
  category: RecommendationCategory;
  suggestedAction: string;
  tone: InsightTone;
  /** Id da regra que gerou (explicabilidade). */
  sourceRule: string;
  createdAt: string;
};

/** Contexto rico para o RecommendationEngine (somente leitura). */
export type RecommendationContext = {
  hojeISO: string;
  saldo: number;
  patrimonio: number;
  receitasDoMes: number;
  despesasDoMes: number;
  receitasMesAnterior: number | null;
  despesasMesAnterior: number | null;
  contasProximas: Array<{
    id: string;
    description: string;
    dueDate: string;
    amount: number;
  }>;
  contasVencidas: Array<{
    id: string;
    description: string;
    amount: number;
  }>;
  goals: Goal[];
  goalForecasts: GoalForecast[];
  budgetSummary: BudgetMonthSummary | null;
  budgetViews: CategorySpendView[];
  plan: FinancialPlan | null;
  risco: "baixo" | "medio" | "alto" | null;
  transactions: Transaction[];
  spentByCategoryCurrent: Partial<Record<ExpenseCategory, number>>;
  spentByCategoryPrevious: Partial<Record<ExpenseCategory, number>>;
  investimentosPatrimonio: number;
  installmentSummary: InstallmentSummary | null;
  installmentPlans: InstallmentPlanWithPayments[];
  installmentPressure: Array<{ label: string; amount: number }>;
  plansEndingSoon: Array<{ planId: string; title: string; lastDueDate: string }>;
};

export type RecommendationRule = {
  readonly id: string;
  evaluate(context: RecommendationContext): Recommendation[];
};
