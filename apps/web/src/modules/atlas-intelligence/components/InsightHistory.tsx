import { History } from "lucide-react";
import { useInsightPreferences } from "../hooks/useInsightPreferences";
import "./InsightHistory.css";

const FEEDBACK_LABEL = {
  useful: "Útil",
  not_useful: "Não útil",
} as const;

function formatWhen(iso: string): string {
  try {
    return new Date(iso).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

/**
 * Histórico local de insights (visto / dispensado / feedback).
 * Base para personalização futura via getFeedbackSignals().
 */
function InsightHistory({ limit = 12 }: { limit?: number }) {
  const { history } = useInsightPreferences();
  const items = history.slice(0, limit);

  return (
    <section
      className="atlas-insight-history"
      aria-labelledby="atlas-insight-history-title"
    >
      <div className="atlas-insight-history-header">
        <History size={16} aria-hidden="true" />
        <h2 id="atlas-insight-history-title">Histórico de insights</h2>
      </div>

      {items.length === 0 ? (
        <p className="atlas-insight-history-empty">
          Os insights que você visualizar aparecerão aqui.
        </p>
      ) : (
        <ul className="atlas-insight-history-list">
          {items.map((item) => (
            <li key={`${item.id}-${item.seenAt}`} className="atlas-insight-history-item">
              <div className="atlas-insight-history-top">
                <strong>{item.title}</strong>
                <time dateTime={item.seenAt}>{formatWhen(item.seenAt)}</time>
              </div>
              <p>{item.description}</p>
              <div className="atlas-insight-history-meta">
                {item.dismissedAt ? <span>Dispensado</span> : null}
                {item.feedback ? (
                  <span>{FEEDBACK_LABEL[item.feedback]}</span>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default InsightHistory;
