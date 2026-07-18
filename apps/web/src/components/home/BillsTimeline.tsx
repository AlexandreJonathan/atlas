import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import type { useBills } from "../../hooks/useBills";
import AsyncStateView from "../AsyncStateView";
import Button from "../ui/Button";
import "./BillsTimeline.css";

type BillsTimelineProps = {
  contas: ReturnType<typeof useBills>;
};

function formatarMoeda(valor: number): string {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatarData(iso: string): string {
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${d}/${m}`;
}

function BillsTimeline({ contas }: BillsTimelineProps) {
  const itens = [...contas.contasVencidas, ...contas.contasVencendoEmBreve]
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 3);

  return (
    <section className="atlas-surface atlas-surface-pad atlas-bills-timeline" aria-labelledby="timeline-titulo">
      <div className="atlas-home-block-header">
        <h2 id="timeline-titulo">Hoje e próximos</h2>
        <Link to="/contas-a-pagar" className="atlas-bills-timeline-all">
          Ver todas
          <ChevronRight size={16} aria-hidden="true" />
        </Link>
      </div>

      <AsyncStateView
        loading={contas.loading}
        error={contas.error}
        isEmpty={itens.length === 0}
        emptyMessage="Nenhuma conta urgente nos próximos dias."
        onRetry={contas.recarregar}
        loadingMessage="Carregando contas..."
      >
        <ul className="atlas-bills-timeline-list atlas-mi-timeline-enter">
          {itens.map((bill) => (
            <li key={bill.id} className="atlas-bills-timeline-item">
              <div className="atlas-bills-timeline-info">
                <span className="atlas-bills-timeline-desc">{bill.description}</span>
                <small>{formatarData(bill.dueDate)}</small>
              </div>
              <span className="atlas-bills-timeline-valor tabular-nums">{formatarMoeda(bill.amount)}</span>
              {bill.type === "a_pagar" && bill.status === "pendente" && (
                <Button size="sm" variant="secondary" onClick={() => contas.marcarComoPaga(bill.id)}>
                  Pagar
                </Button>
              )}
            </li>
          ))}
        </ul>
      </AsyncStateView>

      {contas.actionError && <p className="atlas-panel-erro-acao">{contas.actionError}</p>}
    </section>
  );
}

export default BillsTimeline;
