import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import type { Transaction } from "../types/transaction";
import AsyncStateView from "./AsyncStateView";
import "./Panels.css";
import Button from "./ui/Button";

type TransactionsListProps = {
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
  onRemover: (id: string) => void;
  onTentarNovamente: () => void;
};

function TransactionsList({
  transactions,
  loading,
  error,
  onRemover,
  onTentarNovamente,
}: TransactionsListProps) {
  return (
    <AsyncStateView
      loading={loading}
      error={error}
      isEmpty={transactions.length === 0}
      emptyMessage="Nenhuma movimentação registrada ainda."
      onRetry={onTentarNovamente}
      loadingMessage="Carregando movimentações..."
    >
      <div className="atlas-list">
        {transactions.map((item, indice) => {
          const isReceita = item.type === "receita";

          return (
            <div className="atlas-list-row" key={item.id} style={{ animationDelay: `${Math.min(indice, 8) * 40}ms` }}>
              <span
                className={`atlas-list-row-icon ${isReceita ? "atlas-list-row-icon-success" : "atlas-list-row-icon-danger"}`}
                aria-hidden="true"
              >
                {isReceita ? <ArrowUpRight size={18} /> : <ArrowDownLeft size={18} />}
              </span>

              <div className="atlas-list-row-info">
                <span>{item.description}</span>
                <small>{new Date(item.createdAt).toLocaleDateString("pt-BR")}</small>
              </div>

              <strong
                className={`atlas-list-row-value tabular-nums ${isReceita ? "atlas-list-row-value-success" : "atlas-list-row-value-danger"}`}
              >
                R$ {item.amount.toFixed(2)}
              </strong>

              <Button variant="ghost" size="sm" onClick={() => onRemover(item.id)}>
                Remover
              </Button>
            </div>
          );
        })}
      </div>
    </AsyncStateView>
  );
}

export default TransactionsList;
