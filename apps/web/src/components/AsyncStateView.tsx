import type { ReactNode } from "react";

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
// conteúdo" usado por TransactionsList, BillsList e GoalsList — extraído
// para evitar três cópias quase idênticas do mesmo condicional.
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
    return <p className="estado-carregando">{loadingMessage}</p>;
  }

  if (error) {
    return (
      <div className="estado-erro">
        <p>{error}</p>
        <button className="btn-tentar-novamente" onClick={onRetry}>
          Tentar novamente
        </button>
      </div>
    );
  }

  if (isEmpty) {
    return <p className="estado-vazio">{emptyMessage}</p>;
  }

  return <>{children}</>;
}

export default AsyncStateView;
