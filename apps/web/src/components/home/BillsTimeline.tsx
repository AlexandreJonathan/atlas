import type { useBills } from "../../hooks/useBills";
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
    <section className="atlas-bills-timeline" aria-labelledby="timeline-titulo">
      <div className="atlas-home-block-header">
        <h2 id="timeline-titulo">Hoje e próximos</h2>
      </div>

      {contas.loading ? (
        <p className="atlas-home-block-muted">Carregando contas...</p>
      ) : contas.error ? (
        <div className="atlas-home-block-erro">
          <p>{contas.error}</p>
          <Button variant="secondary" size="sm" onClick={contas.recarregar}>
            Tentar novamente
          </Button>
        </div>
      ) : itens.length === 0 ? (
        <p className="atlas-home-block-muted">Nenhuma conta urgente nos próximos dias.</p>
      ) : (
        <ul className="atlas-bills-timeline-list">
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
      )}

      {contas.actionError && <p className="atlas-panel-erro-acao">{contas.actionError}</p>}
    </section>
  );
}

export default BillsTimeline;
