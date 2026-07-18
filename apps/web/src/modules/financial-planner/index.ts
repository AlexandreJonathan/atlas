export {
  financialPlannerService,
  FinancialPlannerService,
} from "./services/FinancialPlannerService";
export {
  financialPlannerRepository,
  FinancialPlannerRepository,
} from "./repository/FinancialPlannerRepository";
export { useFinancialPlanner } from "./hooks/useFinancialPlanner";
export {
  buildFinancialPlan,
  buildFinancialPlanFromSnapshot,
  buildGoalForecasts,
  buildMonthlyProjections,
  computeContributionCapacity,
  computeMonthlySurplus,
  DEFAULT_HORIZON_MONTHS,
} from "./utils/planMath";
export {
  serializePlanForIntelligence,
  suggestPlanInsights,
} from "./intelligence/hooks";
export type { FinancialPlannerIntelligenceContext } from "./intelligence/hooks";
export { default as FinancialPlannerSummaryCard } from "./components/FinancialPlannerSummaryCard";
export { default as FinancialPlannerPage } from "./pages/FinancialPlannerPage";
