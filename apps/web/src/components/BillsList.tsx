import { getTodayISO } from "../lib/dateUtils";
import type { Bill } from "../types/bill";
import AsyncStateView from "./AsyncStateView";
import SeverityBadge, { type SeverityTone } from "./SeverityBadge";

type BillsListProps = {
  bills: Bill[];
  loading: boolean;
  error: string | null;
  onMarcarComoPaga: (id: string) => void;
  onRemover: (id: string) => void;
  onTentarNovamente: () => void;
};

function statusDaConta(bill: Bill, hoje: string): { tone: SeverityTone; label: string } {
  if (bill.status === "pago") {
    return { tone: "positiva", label: "Paga" };
  }

  if (bill.dueDate < hoje) {
    return { tone: "critica", label: "Vencida" };
  }

  return { tone: "neutra", label: "Pendente" };
}

function BillsList({ bills, loading, error, onMarcarComoPaga, onRemover, onTentarNovamente }: BillsListProps) {
  const hoje = getTodayISO();

  return (
    <AsyncStateView
      loading={loading}
      error={error}
      isEmpty={bills.length === 0}
      emptyMessage="Nenhuma conta cadastrada. Cadastre suas contas para acompanhar vencimentos."
      onRetry={onTentarNovamente}
      loadingMessage="Carregando contas..."
    >
      {bills.map((bill) => {
        const status = statusDaConta(bill, hoje);

        return (
          <div className={`conta-item ${bill.type}`} key={bill.id}>
            <div className="conta-info">
              <span>{bill.description}</span>
              <small>Vence em {new Date(`${bill.dueDate}T00:00:00`).toLocaleDateString("pt-BR")}</small>
            </div>
            <SeverityBadge tone={status.tone} label={status.label} />
            <strong>R$ {bill.amount.toFixed(2)}</strong>
            <div className="conta-acoes">
              {bill.status === "pendente" && (
                <button className="btn-marcar-pago" onClick={() => onMarcarComoPaga(bill.id)}>
                  Marcar como paga
                </button>
              )}
              <button className="btn-remover" onClick={() => onRemover(bill.id)}>
                Remover
              </button>
            </div>
          </div>
        );
      })}
    </AsyncStateView>
  );
}

export default BillsList;
