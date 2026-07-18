import { ChevronRight, Target } from "lucide-react";
import { Link } from "react-router-dom";
import ProgressBar from "../../../components/ui/ProgressBar";
import type { SmartGoalsSummary } from "../utils/goalMath";
import "./SmartGoalsSummaryCard.css";

type SmartGoalsSummaryCardProps = {
  summary: SmartGoalsSummary;
  loading?: boolean;
};

function SmartGoalsSummaryCard({ summary, loading }: SmartGoalsSummaryCardProps) {
  return (
    <section
      className="atlas-surface atlas-surface-pad atlas-smart-goals-summary"
      aria-labelledby="smart-goals-summary-title"
      aria-busy={loading || undefined}
    >
      <div className="atlas-home-block-header">
        <h2 id="smart-goals-summary-title">
          <Target size={18} aria-hidden="true" /> Resumo das metas
        </h2>
        <Link to="/metas" className="atlas-smart-goals-summary-link">
          Ver todas <ChevronRight size={16} aria-hidden="true" />
        </Link>
      </div>

      {loading ? (
        <div className="atlas-async-loading" role="status" aria-live="polite">
          <span className="atlas-skeleton-row" />
          <span className="atlas-skeleton-row atlas-skeleton-row-short" />
        </div>
      ) : (
        <>
          <div className="atlas-smart-goals-summary-grid">
            <div className="atlas-smart-goals-summary-stat">
              <span>Metas</span>
              <strong>{summary.total}</strong>
            </div>
            <div className="atlas-smart-goals-summary-stat">
              <span>Concluídas</span>
              <strong>{summary.completed}</strong>
            </div>
            <div className="atlas-smart-goals-summary-stat">
              <span>Em andamento</span>
              <strong>{summary.active}</strong>
            </div>
            <div className="atlas-smart-goals-summary-stat">
              <span>Progresso geral</span>
              <strong>{summary.overallProgressPercent}%</strong>
            </div>
          </div>

          <ProgressBar
            value={summary.overallProgressPercent / 100}
            label="Progresso geral das metas"
          />

          <p className="atlas-smart-goals-summary-nearest">
            {summary.nearest
              ? `Meta mais próxima: ${summary.nearest.title}`
              : "Nenhuma meta em andamento no momento."}
          </p>
        </>
      )}
    </section>
  );
}

export default SmartGoalsSummaryCard;
