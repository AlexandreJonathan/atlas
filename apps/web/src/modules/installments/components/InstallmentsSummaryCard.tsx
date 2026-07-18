import { ChevronRight, CreditCard } from "lucide-react";
import { Link } from "react-router-dom";
import type { InstallmentSummary } from "../utils/installmentMath";
import "./InstallmentsSummaryCard.css";

function formatMoney(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

type InstallmentsSummaryCardProps = {
  summary: InstallmentSummary;
  loading?: boolean;
  embedded?: boolean;
};

function InstallmentsSummaryCard({
  summary,
  loading,
  embedded = false,
}: InstallmentsSummaryCardProps) {
  return (
    <section
      className="atlas-surface atlas-surface-pad atlas-installments-summary"
      aria-labelledby="installments-summary-title"
      aria-busy={loading || undefined}
    >
      <div className="atlas-home-block-header">
        <h2 id="installments-summary-title">
          <CreditCard size={18} aria-hidden="true" /> Parcelas
        </h2>
        {!embedded ? (
          <Link to="/parcelas" className="atlas-installments-summary-link">
            Ver todas <ChevronRight size={16} aria-hidden="true" />
          </Link>
        ) : null}
      </div>

      {loading ? (
        <div className="atlas-async-loading" role="status" aria-live="polite">
          <span className="atlas-skeleton-row" />
          <span className="atlas-skeleton-row atlas-skeleton-row-short" />
        </div>
      ) : summary.activePlanCount === 0 ? (
        <p className="atlas-installments-summary-note">
          Nenhuma compra parcelada ativa. Registre parcelas para projetar o
          impacto futuro na renda e no orçamento.
        </p>
      ) : (
        <>
          <div className="atlas-installments-summary-grid">
            <div className="atlas-installments-summary-stat">
              <span>Comprometido</span>
              <strong>{formatMoney(summary.totalCommitted)}</strong>
            </div>
            <div className="atlas-installments-summary-stat">
              <span>Parcelas restantes</span>
              <strong>{summary.remainingPayments}</strong>
            </div>
            <div className="atlas-installments-summary-stat">
              <span>Próxima parcela</span>
              <strong>
                {summary.nextPayment
                  ? formatMoney(summary.nextPayment.amount)
                  : "—"}
              </strong>
            </div>
            <div className="atlas-installments-summary-stat">
              <span>Impacto no mês</span>
              <strong>{formatMoney(summary.currentMonthImpact)}</strong>
            </div>
          </div>
          <p className="atlas-installments-summary-note">
            {summary.nextPayment
              ? `Próxima: ${summary.nextPaymentPlanTitle ?? "compra"} em ${summary.nextPayment.dueDate}`
              : "Sem próximas parcelas pendentes."}
            {summary.releaseMonthLabel
              ? ` · Liberação prevista em ${summary.releaseMonthLabel} (~${formatMoney(summary.releaseAmount)}/mês)`
              : ""}
          </p>
        </>
      )}
    </section>
  );
}

export default InstallmentsSummaryCard;
