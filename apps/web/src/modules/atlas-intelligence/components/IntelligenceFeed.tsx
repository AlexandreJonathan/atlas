import { Activity } from "lucide-react";
import type { FeedItem } from "../types";
import "./IntelligenceFeed.css";

type IntelligenceFeedProps = {
  items: FeedItem[];
  /** Limite de itens visíveis (default 6). */
  limit?: number;
  compact?: boolean;
};

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

/**
 * Feed inteligente: cascata de mensagens geradas por eventos financeiros.
 */
function IntelligenceFeed({ items, limit = 6, compact = false }: IntelligenceFeedProps) {
  const visible = items.slice(0, limit);

  return (
    <section
      className={`atlas-intel-feed${compact ? " atlas-intel-feed-compact" : ""}`}
      aria-labelledby="atlas-intel-feed-titulo"
    >
      <div className="atlas-intel-feed-header">
        <span className="atlas-intel-feed-icon" aria-hidden="true">
          <Activity size={18} />
        </span>
        <div>
          <h2 id="atlas-intel-feed-titulo">Feed inteligente</h2>
          <p>Eventos → saldo → recomendações</p>
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="atlas-intel-feed-muted">
          Ainda não há eventos narrados. Registre uma receita ou conecte um banco para ver a cascata.
        </p>
      ) : (
        <ol className="atlas-intel-feed-list">
          {visible.map((item) => (
            <li key={item.id} className={`atlas-intel-feed-item atlas-intel-feed-${item.kind}`}>
              <div className="atlas-intel-feed-meta">
                <strong>{item.title}</strong>
                <time dateTime={item.createdAt}>{formatTime(item.createdAt)}</time>
              </div>
              <p>{item.message}</p>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

export default IntelligenceFeed;
