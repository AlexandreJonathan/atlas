import { useState } from "react";
import type { useFixedExpenses } from "../hooks/useFixedExpenses";
import FixedExpenseModal from "./FixedExpenseModal";
import FixedExpensesList from "./FixedExpensesList";

type FixedExpensesPanelProps = {
  despesasFixas: ReturnType<typeof useFixedExpenses>;
};

function FixedExpensesPanel({ despesasFixas }: FixedExpensesPanelProps) {
  const [modalAberto, setModalAberto] = useState(false);

  return (
    <section className="painel" aria-labelledby="despesas-fixas-titulo">
      <div className="painel-header">
        <h2 id="despesas-fixas-titulo">🧾 Despesas Fixas</h2>
        <div className="painel-acoes">
          <button onClick={() => setModalAberto(true)}>+ Nova Despesa Fixa</button>
        </div>
      </div>

      {despesasFixas.actionError && <p className="erro-geral erro-acao">{despesasFixas.actionError}</p>}

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
    </section>
  );
}

export default FixedExpensesPanel;
