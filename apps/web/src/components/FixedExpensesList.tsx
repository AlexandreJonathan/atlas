import { Receipt } from "lucide-react";
import type { FixedExpense } from "../types/fixedExpense";
import AsyncStateView from "./AsyncStateView";
import "./Panels.css";
import Button from "./ui/Button";

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
      <div className="atlas-list">
        {fixedExpenses.map((item, indice) => (
          <div
            className="atlas-list-row"
            key={item.id}
            style={{ animationDelay: `${Math.min(indice, 8) * 40}ms` }}
          >
            <span className="atlas-list-row-icon atlas-list-row-icon-brand" aria-hidden="true">
              <Receipt size={18} />
            </span>

            <div className="atlas-list-row-info">
              <span>{item.description}</span>
            </div>

            <strong className="atlas-list-row-value tabular-nums">R$ {item.amount.toFixed(2)}</strong>

            <Button variant="ghost" size="sm" onClick={() => onRemover(item.id)}>
              Remover
            </Button>
          </div>
        ))}
      </div>
    </AsyncStateView>
  );
}

export default FixedExpensesList;
