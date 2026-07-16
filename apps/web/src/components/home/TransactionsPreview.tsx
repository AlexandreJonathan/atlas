import type { useTransactions } from "../../hooks/useTransactions";
import AsyncStateView from "../AsyncStateView";
import "./TransactionsPreview.css";

type TransactionsPreviewProps = {
  transacoes: ReturnType<typeof useTransactions>;
};

function formatarMoeda(valor: number): string {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function TransactionsPreview({ transacoes }: TransactionsPreviewProps) {
  const recentes = transacoes.transactions.slice(0, 5);

  return (
    <section className="atlas-surface atlas-tx-preview" aria-labelledby="tx-preview-titulo">
      <div className="atlas-home-block-header">
        <h2 id="tx-preview-titulo">Recentes</h2>
      </div>

      {transacoes.actionError && <p className="atlas-panel-erro-acao">{transacoes.actionError}</p>}

      <AsyncStateView
        loading={transacoes.loading}
        error={transacoes.error}
        isEmpty={recentes.length === 0}
        emptyMessage="Nenhuma movimentação ainda."
        onRetry={transacoes.recarregar}
        loadingMessage="Carregando..."
      >
        <ul className="atlas-tx-preview-list">
          {recentes.map((tx) => (
            <li key={tx.id} className="atlas-tx-preview-item">
              <div className="atlas-tx-preview-info">
                <span>{tx.description}</span>
                <small>{tx.type === "receita" ? "Receita" : "Despesa"}</small>
              </div>
              <span
                className={`atlas-tx-preview-valor tabular-nums${
                  tx.type === "receita" ? " atlas-tx-preview-valor-up" : " atlas-tx-preview-valor-down"
                }`}
              >
                {tx.type === "receita" ? "+" : "−"}
                {formatarMoeda(tx.amount)}
              </span>
            </li>
          ))}
        </ul>
      </AsyncStateView>
    </section>
  );
}

export default TransactionsPreview;
