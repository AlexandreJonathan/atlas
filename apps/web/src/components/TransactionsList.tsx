import type { Transaction } from "../types/transaction";
import AsyncStateView from "./AsyncStateView";

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
      {transactions.map((item) => (
        <div className={`movimentacao ${item.type}`} key={item.id}>
          <div className="movimentacao-info">
            <span>
              <span aria-hidden="true">{item.type === "receita" ? "💰" : "💸"}</span>{" "}
              {item.description}
            </span>
            <small>{new Date(item.createdAt).toLocaleDateString("pt-BR")}</small>
          </div>
          <strong>R$ {item.amount.toFixed(2)}</strong>
          <button className="btn-remover" onClick={() => onRemover(item.id)}>
            Remover
          </button>
        </div>
      ))}
    </AsyncStateView>
  );
}

export default TransactionsList;
