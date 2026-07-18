import { getTodayISO } from "../../../../lib/dateUtils";
import { sumSpentByCategory } from "../../../budget-planner/utils/budgetMath";
import type { BudgetMonthSummary, CategorySpendView } from "../../../budget-planner/utils/budgetMath";
import type { FinancialSnapshot } from "../../../financial-data";
import type { FinancialPlan } from "../../../../types/financialPlan";
import type { Transaction } from "../../../../types/transaction";
import type { RecommendationContext } from "../../types/recommendation";

function previousMonth(year: number, month: number): { year: number; month: number } {
  if (month <= 1) return { year: year - 1, month: 12 };
  return { year, month: month - 1 };
}

function monthTotals(transactions: Transaction[], year: number, month: number) {
  let receitas = 0;
  let despesas = 0;
  for (const tx of transactions) {
    const created = new Date(tx.createdAt);
    if (created.getFullYear() !== year || created.getMonth() + 1 !== month) continue;
    if (tx.type === "receita") receitas += tx.amount;
    else despesas += tx.amount;
  }
  return { receitas, despesas };
}

export type RecommendationEnrichment = {
  budgetSummary: BudgetMonthSummary | null;
  budgetViews: CategorySpendView[];
  plan: FinancialPlan | null;
  transactions: Transaction[];
};

/**
 * Monta RecommendationContext a partir da FDL + Budget + Financial Planner.
 * Sem inventar números: campos ausentes ficam vazios/nulos.
 */
export function buildRecommendationContext(
  snapshot: FinancialSnapshot | null,
  enrichment: RecommendationEnrichment,
  hojeISO = getTodayISO(),
): RecommendationContext {
  const [y, m] = hojeISO.split("-").map(Number);
  const year = y!;
  const month = m!;
  const prev = previousMonth(year, month);
  const transactions = enrichment.transactions;

  const spentByCategoryCurrent = sumSpentByCategory(transactions, year, month);
  const spentByCategoryPrevious = sumSpentByCategory(
    transactions,
    prev.year,
    prev.month,
  );
  const previousTotals = monthTotals(transactions, prev.year, prev.month);
  const hasPreviousActivity =
    previousTotals.receitas > 0 || previousTotals.despesas > 0;

  if (!snapshot) {
    return {
      hojeISO,
      saldo: 0,
      patrimonio: 0,
      receitasDoMes: 0,
      despesasDoMes: 0,
      receitasMesAnterior: hasPreviousActivity ? previousTotals.receitas : null,
      despesasMesAnterior: hasPreviousActivity ? previousTotals.despesas : null,
      contasProximas: [],
      contasVencidas: [],
      goals: [],
      goalForecasts: enrichment.plan?.goalForecasts ?? [],
      budgetSummary: enrichment.budgetSummary,
      budgetViews: enrichment.budgetViews,
      plan: enrichment.plan,
      risco: enrichment.plan?.risk ?? null,
      transactions,
      spentByCategoryCurrent,
      spentByCategoryPrevious,
      investimentosPatrimonio: 0,
    };
  }

  const billsError = Boolean(snapshot.errors.bills);
  const goalsError = Boolean(snapshot.errors.goals);

  return {
    hojeISO,
    saldo: snapshot.saldo,
    patrimonio: snapshot.patrimonio,
    receitasDoMes: snapshot.receitasDoMes,
    despesasDoMes: snapshot.despesasDoMes,
    receitasMesAnterior: hasPreviousActivity ? previousTotals.receitas : null,
    despesasMesAnterior: hasPreviousActivity ? previousTotals.despesas : null,
    contasProximas: (billsError ? [] : snapshot.contasVencendoEmBreve).map((c) => ({
      id: c.id,
      description: c.description,
      dueDate: c.dueDate,
      amount: c.amount,
    })),
    contasVencidas: (billsError ? [] : snapshot.contasVencidas).map((c) => ({
      id: c.id,
      description: c.description,
      amount: c.amount,
    })),
    goals: goalsError ? [] : snapshot.goals,
    goalForecasts: enrichment.plan?.goalForecasts ?? [],
    budgetSummary: enrichment.budgetSummary,
    budgetViews: enrichment.budgetViews,
    plan: enrichment.plan,
    risco: enrichment.plan?.risk ?? null,
    transactions,
    spentByCategoryCurrent,
    spentByCategoryPrevious,
    investimentosPatrimonio: snapshot.investimentosPatrimonio,
  };
}
