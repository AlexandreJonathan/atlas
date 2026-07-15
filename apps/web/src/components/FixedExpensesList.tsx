import type { FixedExpense } from "../types/fixedExpense";
import AsyncStateView from "./AsyncStateView";

type FixedExpensesListProps = {
  fixedExpenses: FixedExpense[];
  loading: boolean;
  error: string | null;
  onRemover: (id: string) => void;
  onTentarNovamente: () => void;
};

function FixedExpensesList({
  fixedExpenses,
  loading,
  error,
  onRemover,
  onTentarNovamente,
}: FixedExpensesListProps) {
  return (
    <AsyncStateView
      loading={loading}
      error={error}
      isEmpty={fixedExpenses.length === 0}
      emptyMessage="Nenhuma despesa fixa cadastrada. Cadastre aluguel, assinaturas e outras contas recorrentes."
      onRetry={onTentarNovamente}
      loadingMessage="Carregando despesas fixas..."
    >
      {fixedExpenses.map((item) => (
        <div className="despesa-fixa-item" key={item.id}>
          <div className="despesa-fixa-info">
            <span>{item.description}</span>
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

export default FixedExpensesList;
