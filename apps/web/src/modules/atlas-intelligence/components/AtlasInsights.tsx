import { Lightbulb } from "lucide-react";
import "../../../components/AsyncStateView.css";
import type { Insight } from "../types";
import "./AtlasInsights.css";

type AtlasInsightsProps = {
  insights: Insight[];
  loading?: boolean;
};

const TONE_CLASS: Record<Insight["tone"], string> = {
  positiva: "atlas-insights-item-positiva",
  atencao: "atlas-insights-item-atencao",
  critica: "atlas-insights-item-critica",
  informativa: "atlas-insights-item-informativa",
};

/**
 * Bloco da Home: os 3 insights mais importantes da Atlas Intelligence.
 */
function AtlasInsights({ insights, loading }: AtlasInsightsProps) {
  return (
    <section className="atlas-surface atlas-surface-pad atlas-insights" aria-labelledby="atlas-insights-titulo">
      <div className="atlas-insights-header">
        <span className="atlas-insights-icon" aria-hidden="true">
          <Lightbulb size={18} />
        </span>
        <div>
          <h2 id="atlas-insights-titulo">Atlas Insights</h2>
          <p>O que mais importa agora</p>
        </div>
      </div>

      {loading && insights.length === 0 ? (
        <div className="atlas-async-loading" role="status" aria-live="polite">
          <span className="atlas-skeleton-row" />
          <span className="atlas-skeleton-row" />
          <span className="atlas-skeleton-row atlas-skeleton-row-short" />
          <span className="atlas-async-loading-texto">Carregando...</span>
        </div>
      ) : insights.length === 0 ? (
        <p className="atlas-insights-muted">Nenhum insight no momento.</p>
      ) : (
        <ol className="atlas-insights-list">
          {insights.map((item, index) => (
            <li
              key={item.id}
              className={`atlas-insights-item ${TONE_CLASS[item.tone]}`}
              style={{ animationDelay: `${index * 60}ms` }}
            >
              <span className="atlas-insights-rank">{index + 1}</span>
              <div>
                <strong>{item.title}</strong>
                <p>{item.message}</p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

export default AtlasInsights;
