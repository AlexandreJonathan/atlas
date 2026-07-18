export {
  installmentsService,
  InstallmentsService,
} from "./services/InstallmentsService";
export { useInstallments } from "./hooks/useInstallments";
export type { CreateInstallmentInput } from "./hooks/useInstallments";
export {
  buildInstallmentSummary,
  buildPlanView,
  monthlyCommitmentMap,
  pressureMonths,
  sumPendingByCategory,
  sumPendingInMonth,
  pendingUnlinkedPayments,
  plansEndingInMonth,
} from "./utils/installmentMath";
export type { InstallmentSummary, PlanView } from "./utils/installmentMath";
export { serializeInstallmentsForIntelligence } from "./intelligence/hooks";
export type { InstallmentsIntelligenceContext } from "./intelligence/hooks";
export { default as InstallmentsSummaryCard } from "./components/InstallmentsSummaryCard";
export { default as InstallmentsPage } from "./pages/InstallmentsPage";
