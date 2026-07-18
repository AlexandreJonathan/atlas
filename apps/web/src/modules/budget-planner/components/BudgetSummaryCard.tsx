import { ChevronRight, Wallet } from "lucide-react";
import { Link } from "react-router-dom";
import ProgressBar from "../../../components/ui/ProgressBar";
import { EXPENSE_CATEGORY_LABELS } from "../../../types/budget";
import type { BudgetMonthSummary } from "../utils/budgetMath";
import { monthLabel } from "../utils/budgetMath";
import "./BudgetSummaryCard.css";

function formatMoney(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

type BudgetSummaryCardProps = {
  summary: BudgetMonthSummary | null;
  loading?: boolean;
  /** Quando true, esconde o link "Ver orçamento" (já estamos na página). */
  embedded?: boolean;
};

function BudgetSummaryCard({
  summary,
  loading,
  embedded = false,
}: BudgetSummaryCardProps) {
  return (
    <section
      className="atlas-surface atlas-surface-pad atlas-budget-summary"
      aria-labelledby="budget-summary-title"
      aria-busy={loading || undefined}
    >
      <div className="atlas-home-block-header">
        <h2 id="budget-summary-title">
          <Wallet size={18} aria-hidden="true" />{" "}
          {summary
            ? `Orçamento · ${monthLabel(summary.year, summary.month)}`
            : "Orçamento do mês"}
        </h2>
        {!embedded ? (
          <Link to="/orcamento" className="atlas-budget-summary-link">
            Ver orçamento <ChevronRight size={16} aria-hidden="true" />
          </Link>
        ) : null}
      </div>

      {loading ? (
        <div className="atlas-async-loading" role="status" aria-live="polite">
          <span className="atlas-skeleton-row" />
          <span className="atlas-skeleton-row atlas-skeleton-row-short" />
        </div>
      ) : !summary || summary.categoryCount === 0 ? (
        <p className="atlas-budget-summary-hot">
          Nenhum limite por categoria neste mês. Defina tetos para acompanhar
          gastos em tempo real.
        </p>
      ) : (
        <>
          <div className="atlas-budget-summary-grid">
            <div className="atlas-budget-summary-stat">
              <span>Categorias</span>
              <strong>{summary.categoryCount}</strong>
            </div>
            <div className="atlas-budget-summary-stat">
              <span>Limite total</span>
              <strong>{formatMoney(summary.totalLimit)}</strong>
            </div>
            <div className="atlas-budget-summary-stat">
              <span>Gasto</span>
              <strong>{formatMoney(summary.totalSpent)}</strong>
            </div>
            <div className="atlas-budget-summary-stat">
              <span>Restante</span>
              <strong>{formatMoney(summary.totalRemaining)}</strong>
            </div>
          </div>

          <ProgressBar
            value={Math.min(1, summary.overallUsedPercent / 100)}
            label="Uso geral do orçamento mensal"
          />

          <p className="atlas-budget-summary-hot">
            {summary.exceededCount > 0
              ? `${summary.exceededCount} categoria(s) acima do limite`
              : summary.warningCount > 0
                ? `${summary.warningCount} categoria(s) perto do limite`
                : summary.hottest
                  ? `Maior uso: ${EXPENSE_CATEGORY_LABELS[summary.hottest.category]} (${summary.hottest.usedPercent}%)`
                  : "Orçamento sob controle."}
            {" · "}
            Uso geral: {summary.overallUsedPercent}%
          </p>
        </>
      )}
    </section>
  );
}

export default BudgetSummaryCard;
