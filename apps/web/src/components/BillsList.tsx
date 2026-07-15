import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { getTodayISO } from "../lib/dateUtils";
import type { Bill } from "../types/bill";
import AsyncStateView from "./AsyncStateView";
import "./Panels.css";
import SeverityBadge, { type SeverityTone } from "./SeverityBadge";
import Button from "./ui/Button";

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
      <div className="atlas-list">
        {bills.map((bill, indice) => {
          const status = statusDaConta(bill, hoje);
          const isReceber = bill.type === "a_receber";

          return (
            <div
              className="atlas-list-row"
              key={bill.id}
              style={{ animationDelay: `${Math.min(indice, 8) * 40}ms` }}
            >
              <span
                className={`atlas-list-row-icon ${isReceber ? "atlas-list-row-icon-success" : "atlas-list-row-icon-danger"}`}
                aria-hidden="true"
              >
                {isReceber ? <ArrowUpRight size={18} /> : <ArrowDownLeft size={18} />}
              </span>

              <div className="atlas-list-row-info">
                <span>{bill.description}</span>
                <small>Vence em {new Date(`${bill.dueDate}T00:00:00`).toLocaleDateString("pt-BR")}</small>
              </div>

              <SeverityBadge tone={status.tone} label={status.label} />

              <strong className="atlas-list-row-value tabular-nums">R$ {bill.amount.toFixed(2)}</strong>

              <div className="atlas-list-row-actions">
                {bill.status === "pendente" && (
                  <Button variant="secondary" size="sm" onClick={() => onMarcarComoPaga(bill.id)}>
                    Marcar como paga
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={() => onRemover(bill.id)}>
                  Remover
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </AsyncStateView>
  );
}

export default BillsList;
