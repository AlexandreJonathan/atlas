import type { ReactNode } from "react";
import Button from "./ui/Button";
import "./AsyncStateView.css";

type AsyncStateViewProps = {
  loading: boolean;
  error: string | null;
  isEmpty: boolean;
  emptyMessage: ReactNode;
  onRetry: () => void;
  loadingMessage?: string;
  children: ReactNode;
};

// Centraliza o padrão "carregando / erro com nova tentativa / vazio /
// conteúdo" usado por TransactionsList, BillsList, GoalsList e
// FixedExpensesList — mesma API de antes desta missão, só o visual mudou
// (skeleton no lugar de texto simples de carregamento).
function AsyncStateView({
  loading,
  error,
  isEmpty,
  emptyMessage,
  onRetry,
  loadingMessage = "Carregando...",
  children,
}: AsyncStateViewProps) {
  if (loading) {
    return (
      <div className="atlas-async-loading" role="status" aria-live="polite">
        <span className="atlas-skeleton-row" />
        <span className="atlas-skeleton-row" />
        <span className="atlas-skeleton-row atlas-skeleton-row-short" />
        <span className="atlas-async-loading-texto">{loadingMessage}</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="atlas-async-erro">
        <p>{error}</p>
        <Button variant="secondary" size="sm" onClick={onRetry}>
          Tentar novamente
        </Button>
      </div>
    );
  }

  if (isEmpty) {
    return <p className="atlas-async-vazio">{emptyMessage}</p>;
  }

  return <>{children}</>;
}

export default AsyncStateView;
