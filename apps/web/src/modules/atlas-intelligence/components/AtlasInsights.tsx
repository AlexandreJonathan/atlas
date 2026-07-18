import { BrainCircuit } from "lucide-react";
import "../../../components/AsyncStateView.css";
import type { Insight } from "../types";
import type { Recommendation } from "../types/recommendation";
import "./AtlasInsights.css";

type AtlasInsightsProps = {
  /** Preferir recomendações v2; fallback para insights legados. */
  recommendations?: Recommendation[];
  insights?: Insight[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
};

const TONE_CLASS: Record<Insight["tone"], string> = {
  positiva: "atlas-insights-item-positiva",
  atencao: "atlas-insights-item-atencao",
  critica: "atlas-insights-item-critica",
  informativa: "atlas-insights-item-informativa",
};

const CATEGORY_LABELS: Record<string, string> = {
  economia: "Economia",
  orcamento: "Orçamento",
  metas: "Metas",
  investimentos: "Investimentos",
  contas: "Contas",
  receitas: "Receitas",
  despesas: "Despesas",
  comportamento: "Comportamento",
  despesa: "Despesas",
  conta: "Contas",
  meta: "Metas",
  patrimonio: "Patrimônio",
  investimento: "Investimentos",
  geral: "Geral",
};

type DisplayItem = {
  id: string;
  title: string;
  description: string;
  tone: Insight["tone"];
  category: string;
  priority: number;
  suggestedAction?: string;
};

/**
 * Card da Home: Atlas Intelligence — 1 a 3 insights priorizados.
 */
function AtlasInsights({
  recommendations,
  insights = [],
  loading,
  error,
  onRetry,
}: AtlasInsightsProps) {
  const items: DisplayItem[] =
    recommendations && recommendations.length > 0
      ? recommendations.map((r) => ({
          id: r.id,
          title: r.title,
          description: r.description,
          tone: r.tone,
          category: r.category,
          priority: r.priority,
          suggestedAction: r.suggestedAction,
        }))
      : insights.map((i) => ({
          id: i.id,
          title: i.title,
          description: i.message,
          tone: i.tone,
          category: i.category,
          priority: i.priority,
          suggestedAction: i.suggestedAction,
        }));

  return (
    <section
      className="atlas-surface atlas-surface-pad atlas-insights"
      aria-labelledby="atlas-insights-titulo"
      aria-busy={loading || undefined}
    >
      <div className="atlas-insights-header">
        <span className="atlas-insights-icon" aria-hidden="true">
          <BrainCircuit size={18} />
        </span>
        <div>
          <h2 id="atlas-insights-titulo">Atlas Intelligence</h2>
          <p>Insights personalizados com base nos seus dados</p>
        </div>
      </div>

      {loading && items.length === 0 ? (
        <div className="atlas-async-loading" role="status" aria-live="polite">
          <span className="atlas-skeleton-row" />
          <span className="atlas-skeleton-row" />
          <span className="atlas-skeleton-row atlas-skeleton-row-short" />
          <span className="atlas-async-loading-texto">Analisando suas finanças...</span>
        </div>
      ) : error ? (
        <div className="atlas-panel-estado-erro" role="alert">
          <p className="atlas-insights-muted">{error}</p>
          {onRetry ? (
            <button type="button" className="atlas-insights-retry" onClick={onRetry}>
              Tentar novamente
            </button>
          ) : null}
        </div>
      ) : items.length === 0 ? (
        <p className="atlas-insights-muted">
          Nenhum insight no momento. Continue registrando movimentações para a
          Atlas aprender seu contexto.
        </p>
      ) : (
        <ol className="atlas-insights-list" aria-label="Insights priorizados">
          {items.map((item, index) => (
            <li
              key={item.id}
              className={`atlas-insights-item ${TONE_CLASS[item.tone]}`}
              style={{ animationDelay: `${index * 60}ms` }}
            >
              <span className="atlas-insights-rank" aria-hidden="true">
                {index + 1}
              </span>
              <div>
                <div className="atlas-insights-meta">
                  <span className="atlas-insights-category">
                    {CATEGORY_LABELS[item.category] ?? item.category}
                  </span>
                  <span className="atlas-insights-priority">
                    Prioridade {item.priority}
                  </span>
                </div>
                <strong>{item.title}</strong>
                <p>{item.description}</p>
                {item.suggestedAction ? (
                  <p className="atlas-insights-action">
                    <span className="atlas-insights-action-label">Ação sugerida:</span>{" "}
                    {item.suggestedAction}
                  </p>
                ) : null}
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

export default AtlasInsights;
