export {
  budgetPlannerService,
  BudgetPlannerService,
} from "./services/BudgetPlannerService";
export { useBudgetPlanner } from "./hooks/useBudgetPlanner";
export type { SetBudgetCategoryInput } from "./hooks/useBudgetPlanner";
export {
  alertLevel,
  budgetCapacityForGoals,
  buildBudgetMonthSummary,
  buildCategorySpendViews,
  monthLabel,
  sumSpentByCategory,
} from "./utils/budgetMath";
export type {
  BudgetMonthSummary,
  CategorySpendView,
} from "./utils/budgetMath";
export {
  serializeBudgetForIntelligence,
  suggestBudgetInsights,
} from "./intelligence/hooks";
export type { BudgetIntelligenceContext } from "./intelligence/hooks";
export { default as BudgetSummaryCard } from "./components/BudgetSummaryCard";
export { default as BudgetPlannerPage } from "./pages/BudgetPlannerPage";
