import { ChevronRight, LineChart } from "lucide-react";
import { Link } from "react-router-dom";
import type { FinancialPlan } from "../../../types/financialPlan";
import "./FinancialPlannerSummaryCard.css";

function formatMoney(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

type FinancialPlannerSummaryCardProps = {
  plan: FinancialPlan | null;
  configured: boolean;
  loading?: boolean;
};

function FinancialPlannerSummaryCard({
  plan,
  configured,
  loading,
}: FinancialPlannerSummaryCardProps) {
  return (
    <section
      className="atlas-surface atlas-surface-pad atlas-fp-summary"
      aria-labelledby="financial-planner-summary-title"
      aria-busy={loading || undefined}
    >
      <div className="atlas-home-block-header">
        <h2 id="financial-planner-summary-title">
          <LineChart size={18} aria-hidden="true" /> Plano financeiro
        </h2>
        <Link to="/planejamento" className="atlas-fp-summary-link">
          Ver plano <ChevronRight size={16} aria-hidden="true" />
        </Link>
      </div>

      {loading ? (
        <div className="atlas-async-loading" role="status" aria-live="polite">
          <span className="atlas-skeleton-row" />
          <span className="atlas-skeleton-row atlas-skeleton-row-short" />
        </div>
      ) : !configured || !plan ? (
        <p className="atlas-fp-summary-note">
          Configure renda e reserva mínima para ver sobra mensal, capacidade de
          aporte e previsão das metas.
        </p>
      ) : (
        <>
          <div className="atlas-fp-summary-grid">
            <div className="atlas-fp-summary-stat">
              <span>Sobra mensal</span>
              <strong>{formatMoney(plan.monthlySurplus)}</strong>
            </div>
            <div className="atlas-fp-summary-stat">
              <span>Capacidade de aporte</span>
              <strong>{formatMoney(plan.contributionCapacity)}</strong>
            </div>
            <div className="atlas-fp-summary-stat">
              <span>Investimento</span>
              <strong>{formatMoney(plan.investmentCapacity)}</strong>
            </div>
            <div className="atlas-fp-summary-stat">
              <span>Saldo projetado</span>
              <strong>{formatMoney(plan.projectedBalance)}</strong>
            </div>
          </div>
          <p className="atlas-fp-summary-note">
            Guardar/mês: {formatMoney(plan.requiredMonthlySave)} · Risco:{" "}
            {plan.risk}
            {plan.installmentCommitment > 0
              ? ` · Parcelas do mês: ${formatMoney(plan.installmentCommitment)}`
              : ""}
          </p>
        </>
      )}
    </section>
  );
}

export default FinancialPlannerSummaryCard;
