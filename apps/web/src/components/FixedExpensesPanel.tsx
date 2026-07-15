import { Receipt } from "lucide-react";
import { useState } from "react";
import type { useFixedExpenses } from "../hooks/useFixedExpenses";
import FixedExpenseModal from "./FixedExpenseModal";
import FixedExpensesList from "./FixedExpensesList";
import "./Panels.css";
import Button from "./ui/Button";
import Card from "./ui/Card";

type FixedExpensesPanelProps = {
  despesasFixas: ReturnType<typeof useFixedExpenses>;
};

function FixedExpensesPanel({ despesasFixas }: FixedExpensesPanelProps) {
  const [modalAberto, setModalAberto] = useState(false);

  return (
    <Card elevated className="atlas-panel" aria-labelledby="despesas-fixas-titulo">
      <div className="atlas-panel-header">
        <span className="atlas-panel-title" id="despesas-fixas-titulo">
          <Receipt size={20} aria-hidden="true" />
          Despesas Fixas
        </span>
        <div className="atlas-panel-actions">
          <Button size="sm" onClick={() => setModalAberto(true)}>
            + Nova Despesa
          </Button>
        </div>
      </div>

      {despesasFixas.actionError && <p className="atlas-panel-erro-acao">{despesasFixas.actionError}</p>}

      <FixedExpensesList
        fixedExpenses={despesasFixas.fixedExpenses}
        loading={despesasFixas.loading}
        error={despesasFixas.error}
        onRemover={despesasFixas.remover}
        onTentarNovamente={despesasFixas.recarregar}
      />

      {modalAberto && (
        <FixedExpenseModal onFechar={() => setModalAberto(false)} onSalvar={(dados) => despesasFixas.criar(dados)} />
      )}
    </Card>
  );
}

export default FixedExpensesPanel;
