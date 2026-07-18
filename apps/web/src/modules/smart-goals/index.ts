export { smartGoalsService, SmartGoalsService } from "./services/SmartGoalsService";
export { useSmartGoals } from "./hooks/useSmartGoals";
export type { CreateSmartGoalInput } from "./hooks/useSmartGoals";
export {
  buildSmartGoalsSummary,
  goalProgressPercent,
  goalProgressRatio,
  remainingTime,
} from "./utils/goalMath";
export type { RemainingTime, SmartGoalsSummary } from "./utils/goalMath";
export {
  serializeGoalsForIntelligence,
  suggestGoalInsights,
} from "./intelligence/hooks";
export type { SmartGoalsIntelligenceContext } from "./intelligence/hooks";
export { default as SmartGoalsSummaryCard } from "./components/SmartGoalsSummaryCard";
export { default as SmartGoalsPage } from "./pages/SmartGoalsPage";
